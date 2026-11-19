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
store.mustahik = [
  { id: 'T01', fullName: 'Keluarga T01', nik: '1111111111111111', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 1000000, dependents: 2, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 },
  { id: 'T02', fullName: 'Keluarga T02', nik: '2222222222222222', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 2000000, dependents: 2, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 }
]
store.receipts = [
  { id: 'RC01', periodId: 1, muzakkiId: null, zakatType: 'Zakat Mal', quantityKg: 10, amountMoney: 100000, date: '2025-03-20', recordedBy: 'Bendahara' },
  { id: 'RC02', periodId: 1, muzakkiId: null, zakatType: 'Infaq', quantityKg: 0, amountMoney: 50000, date: '2025-03-21', recordedBy: 'Bendahara' }
]
store.distributions = []
store.rules = []
store.muzakki = []

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

const server = app.listen(0, async () => {
  const port = server.address().port
  try {
    const wrong = await request(port, 'POST', '/api/users/login', { email: 'bendahara@contoh.id', password: 'salah123' })
    assert.strictEqual(wrong.status, 401)

    const unknown = await request(port, 'POST', '/api/users/login', { email: 'tidak@ada.id', password: 'bendahara123' })
    assert.strictEqual(unknown.status, 401)

    const good = await request(port, 'POST', '/api/users/login', { email: 'bendahara@contoh.id', password: 'bendahara123' })
    assert.strictEqual(good.status, 200)
    assert.ok(good.body.data.token)
    assert.strictEqual(good.body.data.email, 'bendahara@contoh.id')
    assert.strictEqual(good.body.data.password, undefined)
    assert.strictEqual(good.body.data.passwordHash, undefined)
    const token = good.body.data.token

    const noToken = await request(port, 'GET', '/api/mustahik')
    assert.strictEqual(noToken.status, 401)

    const withToken = await request(port, 'GET', '/api/mustahik', null, token)
    assert.strictEqual(withToken.status, 200)
    assert.strictEqual(withToken.body.total, 2)

    const dashboard = await request(port, 'GET', '/api/dashboard', null, token)
    assert.strictEqual(dashboard.status, 200)
    assert.strictEqual(dashboard.body.data.totalMustahik, 2)
    assert.strictEqual(dashboard.body.data.moneyIn, 150000)

    const health = await request(port, 'GET', '/health')
    assert.strictEqual(health.status, 200)
    assert.strictEqual(health.body.status, 'ok')
    assert.strictEqual(health.body.database.connected, false)
    assert.strictEqual(health.body.dbMode, 'memory')

    const kepala = await request(port, 'POST', '/api/users/login', { email: 'kepala@contoh.id', password: 'kepala123' })
    const kepalaToken = kepala.body.data.token
    const bendaharaApprove = await request(port, 'POST', '/api/approvals/2/approve', { note: 'Coba' }, token)
    assert.strictEqual(bendaharaApprove.status, 403)

    const approve = await request(port, 'POST', '/api/approvals/2/approve', { note: 'Disetujui setelah verifikasi' }, kepalaToken)
    assert.strictEqual(approve.status, 200)
    assert.strictEqual(approve.body.data.status, 'approved')
    assert.strictEqual(approve.body.data.approverId, 'U03')
    assert.strictEqual(approve.body.data.note, 'Disetujui setelah verifikasi')
    assert.ok(approve.body.data.decidedAt)

    const fetched = await request(port, 'GET', '/api/approvals/2', null, kepalaToken)
    assert.strictEqual(fetched.body.data.status, 'approved')

    const reject = await request(port, 'POST', '/api/approvals/2/reject', { note: 'Data perlu dilengkapi' }, kepalaToken)
    assert.strictEqual(reject.body.data.status, 'rejected')

    console.log('API auth and approval test passed')
  } finally {
    server.close()
  }
})
