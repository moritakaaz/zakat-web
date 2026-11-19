const assert = require('assert')
const http = require('http')
const { store } = require('./store')
const { hashPassword } = require('./auth/auth')

// Small fixtures defined here only. No data file is imported.
store.users = [
  { id: 'U01', name: 'Bendahara', email: 'bendahara@contoh.id', role: 'bendahara', passwordHash: hashPassword('bendahara123') },
  { id: 'U02', name: 'Sekretaris', email: 'sekretaris@contoh.id', role: 'sekretaris', passwordHash: hashPassword('sekretaris123') },
  { id: 'U03', name: 'Kepala', email: 'kepala@contoh.id', role: 'kepala', passwordHash: hashPassword('kepala123') }
]
store.periods = [
  { id: 1, periodName: 'Periode 1', startDate: '2025-03-01', endDate: '2025-03-29', status: 'closed' },
  { id: 2, periodName: 'Periode 2', startDate: '2026-02-18', endDate: '2026-03-19', status: 'active' }
]
store.approvals = [
  { periodId: 1, status: 'approved', approverId: 'U03', approverName: 'Kepala', note: '', decidedAt: '2025-03-27T10:00:00.000Z' },
  { periodId: 2, status: 'pending', approverId: null, approverName: null, note: '', decidedAt: null }
]
store.rules = [
  { code: 'R10', order: 1, condition: 'Dokumen tidak lengkap', result: 'Pending Verifikasi', isActive: true },
  { code: 'R11', order: 1, condition: 'NIK ganda', result: 'Duplikat', isActive: true },
  { code: 'R09', order: 2, condition: 'Pendapatan di atas ambang', result: 'Tidak Layak', isActive: true, incomeLimit: 2500000 },
  { code: 'R01a', order: 3, condition: 'Pendapatan rendah', result: 'Prioritas 1', isActive: true, incomeLimit: 1500000 },
  { code: 'R01b', order: 3, condition: 'Pendapatan menengah', result: 'Prioritas 2', isActive: true, incomeMin: 1500000, incomeLimit: 2000000 },
  { code: 'R01c', order: 3, condition: 'Pendapatan atas', result: 'Prioritas 3', isActive: true, incomeMin: 2000001, incomeLimit: 2500000 },
  { code: 'R02', order: 4, condition: 'Per kapita rendah', result: 'Naik ke Prioritas 1', isActive: true, perCapitaLimit: 300000 },
  { code: 'R03', order: 4, condition: 'Tanggungan berat', result: 'Tanggungan berat', isActive: true, dependentsMin: 4, incomeLimit: 2000000 },
  { code: 'R04', order: 4, condition: 'Guru honorer', result: 'Prioritas 1', isActive: true, honorMin: 300000, honorMax: 600000 },
  { code: 'R05', order: 4, condition: 'Wali santri', result: 'Wali santri', isActive: true, incomeLimit: 2500000 },
  { code: 'R06', order: 5, condition: 'Kelompok rentan', result: 'Kelompok rentan', isActive: true, incomeLimit: 2000000 },
  { code: 'R07', order: 5, condition: 'Rumah kontrak', result: 'Rumah kontrak', isActive: true },
  { code: 'R08', order: 5, condition: 'Beban pendidikan', result: 'Beban pendidikan', isActive: true, schoolMin: 3, incomeLimit: 2000000 },
  { code: 'R12', order: 6, condition: 'Dana terbatas', result: 'Salurkan berurutan', isActive: true }
]
store.mustahik = [
  { id: 'T01', fullName: 'Keluarga Satu', nik: '1111111111111111', address: 'Warakas', occupation: 'Tidak Bekerja', monthlyIncome: 0, dependents: 5, schoolChildren: 3, houseCondition: 'Menumpang', specialStatus: 'Janda', asnaf: 'Fakir', documentStatus: 'Lengkap', surveyed: false, periodId: 2 },
  { id: 'T02', fullName: 'Keluarga Dua', nik: '2222222222222222', address: 'Warakas', occupation: 'Buruh Harian', monthlyIncome: 1700000, dependents: 2, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: 'Wali Santri', asnaf: 'Miskin', documentStatus: 'Lengkap', surveyed: true, periodId: 2 }
]
store.muzakki = []
store.receipts = []
store.distributions = []
store.auditLog = []

const app = require('./index')

function request(port, method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const req = http.request(
      { host: '127.0.0.1', port, method, path, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) } },
      (res) => {
        let raw = ''
        res.on('data', (chunk) => { raw += chunk })
        res.on('end', () => resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null }))
      }
    )
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

async function login(port, email, password) {
  const res = await request(port, 'POST', '/api/users/login', { email, password })
  assert.strictEqual(res.status, 200, email)
  return res.body.data.token
}

const server = app.listen(0, async () => {
  const port = server.address().port
  try {
    const bendahara = await login(port, 'bendahara@contoh.id', 'bendahara123')
    const kepala = await login(port, 'kepala@contoh.id', 'kepala123')

    // The audit log needs a token.
    const noToken = await request(port, 'GET', '/api/audit-log', null, null)
    assert.strictEqual(noToken.status, 401)

    // Approval is blocked while a Prioritas 1 household is unsurveyed.
    const blocked = await request(port, 'POST', '/api/approvals/2/approve', { note: '' }, kepala)
    assert.strictEqual(blocked.status, 400)
    assert.ok(blocked.body.error.includes('belum disurvei'))
    assert.ok(blocked.body.error.includes('Keluarga Satu'))

    // Marking the household surveyed opens the gate.
    const marked = await request(port, 'PUT', '/api/mustahik/T01', { surveyed: true }, bendahara)
    assert.strictEqual(marked.status, 200)
    assert.strictEqual(marked.body.data.surveyed, true)
    const approved = await request(port, 'POST', '/api/approvals/2/approve', { note: 'Sudah disurvei semua' }, kepala)
    assert.strictEqual(approved.status, 200)
    assert.strictEqual(approved.body.data.status, 'approved')

    // A new mustahik starts unsurveyed and is recorded in the log.
    const created = await request(port, 'POST', '/api/mustahik', { fullName: 'Keluarga Tiga', nik: '3333333333333333', address: 'Warakas', occupation: 'Buruh Harian', monthlyIncome: 1000000, dependents: 2, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 2 }, bendahara)
    assert.strictEqual(created.status, 201)
    assert.strictEqual(created.body.data.surveyed, false)

    const log = await request(port, 'GET', '/api/audit-log', null, bendahara)
    assert.strictEqual(log.status, 200)
    const actions = log.body.data.map((row) => row.action)
    assert.ok(actions.includes('Setujui hasil'))
    assert.ok(actions.includes('Tambah mustahik'))
    const createdEntry = log.body.data.find((row) => row.action === 'Tambah mustahik')
    assert.strictEqual(createdEntry.actorName, 'Bendahara')
    assert.strictEqual(createdEntry.actorRole, 'bendahara')
    assert.ok(createdEntry.target.includes('Keluarga Tiga'))

    console.log('Audit test passed')
    server.close()
    process.exit(0)
  } catch (error) {
    console.error(error)
    server.close()
    process.exit(1)
  }
})
