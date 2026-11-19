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

function household(id, patch) {
  return {
    id,
    fullName: 'Keluarga ' + id,
    nik: 'NIK-' + id,
    address: 'Warakas',
    occupation: 'Buruh',
    monthlyIncome: 1000000,
    dependents: 2,
    schoolChildren: 1,
    houseCondition: 'Milik Sendiri',
    specialStatus: '-',
    asnaf: 'Miskin',
    documentStatus: 'Lengkap',
    periodId: 1,
    ...patch
  }
}

store.mustahik = [
  household('T01', { monthlyIncome: 0, dependents: 5, nik: '1111111111111111' }),
  household('T02', { monthlyIncome: 1000000, dependents: 2 }),
  household('T03', { monthlyIncome: 1700000, dependents: 2 }),
  household('T04', { monthlyIncome: 1700000, dependents: 6 }),
  household('T05', { monthlyIncome: 2200000, dependents: 2 }),
  household('T06', { monthlyIncome: 1200000, dependents: 3, documentStatus: 'KTP saja' }),
  household('T07', { monthlyIncome: 1000000, dependents: 3 }),
  household('T08', { monthlyIncome: 3000000, dependents: 2 }),
  household('T09', { monthlyIncome: 500000, dependents: 2, occupation: 'Guru Honorer TPQ' })
]
store.muzakki = [
  { id: 'MZ01', fullName: 'Donatur Satu', address: 'Warakas', zakatType: 'Zakat Mal', amount: 600000, periodId: 1 },
  { id: 'MZ02', fullName: 'Donatur Dua', address: 'Warakas', zakatType: 'Infaq', amount: 400000, periodId: 1 }
]
store.receipts = [
  { id: 'RC01', periodId: 1, muzakkiId: 'MZ01', zakatType: 'Zakat Mal', quantityKg: 10, amountMoney: 600000, date: '2025-03-20', recordedBy: 'Bendahara' },
  { id: 'RC02', periodId: 1, muzakkiId: 'MZ02', zakatType: 'Infaq', quantityKg: 0, amountMoney: 400000, date: '2025-03-21', recordedBy: 'Bendahara' }
]
store.distributions = [
  { id: 'DS01', periodId: 1, mustahikId: 'T01', priority: 'Prioritas 1', form: 'Uang', quantityKg: 10, amountMoney: 400000, date: '2025-03-28', recordedBy: 'Bendahara' }
]

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

const expectedSummary = { 'Prioritas 1': 5, 'Prioritas 2': 1, 'Prioritas 3': 1, 'Pending Verifikasi': 1, 'Duplikat': 0, 'Tidak Layak': 1 }

const server = app.listen(0, async () => {
  const port = server.address().port
  try {
    const bendahara = await login(port, 'bendahara@contoh.id', 'bendahara123')
    const sekretaris = await login(port, 'sekretaris@contoh.id', 'sekretaris123')
    const kepala = await login(port, 'kepala@contoh.id', 'kepala123')

    // Rules are data, thresholds and active state can change.
    const rules = await request(port, 'GET', '/api/rules', null, bendahara)
    assert.strictEqual(rules.status, 200)
    assert.strictEqual(rules.body.data.length, 14)
    const r01a = rules.body.data.find((row) => row.code === 'R01a')
    assert.strictEqual(r01a.incomeLimit, 1500000)
    assert.strictEqual(r01a.isActive, true)

    const ruleAsSekretaris = await request(port, 'PUT', '/api/rules/R02', { perCapitaLimit: 100000 }, sekretaris)
    assert.strictEqual(ruleAsSekretaris.status, 403)

    const changed = await request(port, 'POST', '/api/rules/evaluate', {}, bendahara)
    assert.deepStrictEqual(changed.body.summary, expectedSummary)

    const editRule = await request(port, 'PUT', '/api/rules/R02', { perCapitaLimit: 100000 }, bendahara)
    assert.strictEqual(editRule.status, 200)
    assert.strictEqual(editRule.body.data.perCapitaLimit, 100000)
    const afterEdit = await request(port, 'POST', '/api/rules/evaluate', {}, bendahara)
    assert.notDeepStrictEqual(afterEdit.body.summary, changed.body.summary)

    const restoreRule = await request(port, 'PUT', '/api/rules/R02', { perCapitaLimit: 300000 }, bendahara)
    assert.strictEqual(restoreRule.body.data.perCapitaLimit, 300000)
    const restored = await request(port, 'POST', '/api/rules/evaluate', {}, bendahara)
    assert.deepStrictEqual(restored.body.summary, changed.body.summary)

    const deactivate = await request(port, 'PUT', '/api/rules/R02', { isActive: false }, bendahara)
    assert.strictEqual(deactivate.body.data.isActive, false)
    const deactivated = await request(port, 'POST', '/api/rules/evaluate', {}, bendahara)
    assert.notDeepStrictEqual(deactivated.body.summary, changed.body.summary)
    await request(port, 'PUT', '/api/rules/R02', { isActive: true }, bendahara)

    const runAsSekretaris = await request(port, 'POST', '/api/rules/evaluate', {}, sekretaris)
    assert.strictEqual(runAsSekretaris.status, 403)

    // Periods can be created and closed by bendahara only.
    const periodAsSekretaris = await request(port, 'POST', '/api/periods', { periodName: 'Periode 3', startDate: '2027-03-10', endDate: '2027-04-08' }, sekretaris)
    assert.strictEqual(periodAsSekretaris.status, 403)
    const created = await request(port, 'POST', '/api/periods', { periodName: 'Periode 3', startDate: '2027-03-10', endDate: '2027-04-08' }, bendahara)
    assert.strictEqual(created.status, 201)
    assert.strictEqual(created.body.data.id, 3)
    const approval = await request(port, 'GET', '/api/approvals/3', null, bendahara)
    assert.strictEqual(approval.body.data.status, 'pending')
    const closed = await request(port, 'POST', '/api/periods/3/close', {}, bendahara)
    assert.strictEqual(closed.body.data.status, 'closed')
    const periods = await request(port, 'GET', '/api/periods', null, bendahara)
    assert.strictEqual(periods.body.data.length, 3)

    // Mustahik duplicate NIK and role guards.
    const duplicate = await request(port, 'POST', '/api/mustahik', { fullName: 'Duplikat NIK', nik: '1111111111111111', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 1000000, dependents: 2, schoolChildren: 0, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 }, bendahara)
    assert.strictEqual(duplicate.status, 409)
    const kepalaCreate = await request(port, 'POST', '/api/mustahik', { fullName: 'Kepala Coba', nik: '3172999999999999', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 1000000, dependents: 2, schoolChildren: 0, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 }, kepala)
    assert.strictEqual(kepalaCreate.status, 403)
    const periodTwo = await request(port, 'GET', '/api/mustahik?periodId=2', null, bendahara)
    assert.strictEqual(periodTwo.body.total, 0)
    const createdMustahik = await request(port, 'POST', '/api/mustahik', { fullName: 'Uji CRUD', nik: '3172111100001111', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 1200000, dependents: 3, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 }, sekretaris)
    assert.strictEqual(createdMustahik.status, 201)
    const mustahikId = createdMustahik.body.data.id
    const updatedMustahik = await request(port, 'PUT', '/api/mustahik/' + mustahikId, { monthlyIncome: 1300000 }, sekretaris)
    assert.strictEqual(updatedMustahik.body.data.monthlyIncome, 1300000)
    const deleteAsSekretaris = await request(port, 'DELETE', '/api/mustahik/' + mustahikId, null, sekretaris)
    assert.strictEqual(deleteAsSekretaris.status, 403)
    const deletedMustahik = await request(port, 'DELETE', '/api/mustahik/' + mustahikId, null, bendahara)
    assert.strictEqual(deletedMustahik.status, 200)

    // Muzakki full CRUD and role guards.
    const muzakki = await request(port, 'GET', '/api/muzakki', null, bendahara)
    assert.strictEqual(muzakki.body.total, 2)
    const muzakkiAsKepala = await request(port, 'POST', '/api/muzakki', { fullName: 'Kepala Coba', address: 'Warakas', zakatType: 'Infaq', amount: 100000, periodId: 1 }, kepala)
    assert.strictEqual(muzakkiAsKepala.status, 403)
    const createdMuzakki = await request(port, 'POST', '/api/muzakki', { fullName: 'Uji Muzakki', address: 'Warakas', zakatType: 'Infaq', amount: 100000, periodId: 1 }, sekretaris)
    assert.strictEqual(createdMuzakki.status, 201)
    const muzakkiId = createdMuzakki.body.data.id
    const updatedMuzakki = await request(port, 'PUT', '/api/muzakki/' + muzakkiId, { amount: 150000 }, sekretaris)
    assert.strictEqual(updatedMuzakki.body.data.amount, 150000)
    const deleteMuzakkiAsSekretaris = await request(port, 'DELETE', '/api/muzakki/' + muzakkiId, null, sekretaris)
    assert.strictEqual(deleteMuzakkiAsSekretaris.status, 403)
    const deletedMuzakki = await request(port, 'DELETE', '/api/muzakki/' + muzakkiId, null, bendahara)
    assert.strictEqual(deletedMuzakki.status, 200)

    // Receipts may be recorded by bendahara and sekretaris, not kepala.
    const receiptAsKepala = await request(port, 'POST', '/api/receipts', { zakatType: 'Infaq', quantityKg: 0, amountMoney: 10000, date: '2025-03-28', recordedBy: 'Kepala' }, kepala)
    assert.strictEqual(receiptAsKepala.status, 403)
    const receipt = await request(port, 'POST', '/api/receipts', { zakatType: 'Infaq', quantityKg: 0, amountMoney: 10000, date: '2025-03-28', recordedBy: 'Sekretaris' }, sekretaris)
    assert.strictEqual(receipt.status, 201)

    // Distribution safeguards: approval first, then balance.
    // Fixture balance for period 1 is Rp 600.000 and 0 kg of rice.
    const unapproved = await request(port, 'POST', '/api/distributions', { mustahikId: 'T01', periodId: 2, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 100000, date: '2026-03-20', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(unapproved.status, 400)
    assert.ok(unapproved.body.error.includes('belum disetujui'))
    const overMoney = await request(port, 'POST', '/api/distributions', { mustahikId: 'T01', periodId: 1, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 700000, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(overMoney.status, 400)
    assert.ok(overMoney.body.error.includes('sisa saldo'))
    const overRice = await request(port, 'POST', '/api/distributions', { mustahikId: 'T01', periodId: 1, priority: 'Prioritas 1', form: 'Beras', quantityKg: 1, amountMoney: 0, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(overRice.status, 400)
    assert.ok(overRice.body.error.includes('sisa beras'))
    const allowed = await request(port, 'POST', '/api/distributions', { mustahikId: 'T01', periodId: 1, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 100000, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(allowed.status, 201)

    // Dashboard follows the selected period.
    const dashboardTwo = await request(port, 'GET', '/api/dashboard?periodId=2', null, bendahara)
    assert.strictEqual(dashboardTwo.body.data.totalMustahik, 0)
    assert.strictEqual(dashboardTwo.body.data.moneyIn, 0)
    const dashboardOne = await request(port, 'GET', '/api/dashboard?periodId=1', null, bendahara)
    assert.strictEqual(dashboardOne.body.data.totalMustahik, 9)
    assert.strictEqual(dashboardOne.body.data.moneyIn, 1010000)

    console.log('Upgrades test passed')
  } finally {
    server.close()
  }
})
