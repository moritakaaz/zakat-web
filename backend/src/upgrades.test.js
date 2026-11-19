const assert = require('assert')
const http = require('http')
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
    const bendahara = await login(port, 'bendahara@alfawwaz.or.id', 'bendahara123')
    const sekretaris = await login(port, 'sekretaris@alfawwaz.or.id', 'sekretaris123')
    const kepala = await login(port, 'kepala@alfawwaz.or.id', 'kepala123')

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
    assert.deepStrictEqual(changed.body.summary, { 'Prioritas 1': 15, 'Prioritas 2': 6, 'Prioritas 3': 5, 'Pending Verifikasi': 1, 'Duplikat': 0, 'Tidak Layak': 3 })

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
    const periodAsSekretaris = await request(port, 'POST', '/api/periods', { periodName: 'Ramadan 1448 H', startDate: '2027-03-10', endDate: '2027-04-08' }, sekretaris)
    assert.strictEqual(periodAsSekretaris.status, 403)
    const created = await request(port, 'POST', '/api/periods', { periodName: 'Ramadan 1448 H', startDate: '2027-03-10', endDate: '2027-04-08' }, bendahara)
    assert.strictEqual(created.status, 201)
    assert.strictEqual(created.body.data.id, 3)
    const approval = await request(port, 'GET', '/api/approvals/3', null, bendahara)
    assert.strictEqual(approval.body.data.status, 'pending')
    const closed = await request(port, 'POST', '/api/periods/3/close', {}, bendahara)
    assert.strictEqual(closed.body.data.status, 'closed')
    const periods = await request(port, 'GET', '/api/periods', null, bendahara)
    assert.strictEqual(periods.body.data.length, 3)

    // Mustahik duplicate NIK and role guards.
    const duplicate = await request(port, 'POST', '/api/mustahik', { fullName: 'Duplikat NIK', nik: '3172••••••0001', address: 'Warakas', occupation: 'Buruh', monthlyIncome: 1000000, dependents: 2, schoolChildren: 0, houseCondition: 'Kontrak', specialStatus: '-', asnaf: 'Miskin', documentStatus: 'Lengkap', periodId: 1 }, bendahara)
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
    assert.strictEqual(muzakki.body.total, 6)
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
    const receiptAsKepala = await request(port, 'POST', '/api/receipts', { zakatType: 'Infaq', quantityKg: 0, amountMoney: 10000, date: '2025-03-28', recordedBy: 'Kepala TPQ' }, kepala)
    assert.strictEqual(receiptAsKepala.status, 403)
    const receipt = await request(port, 'POST', '/api/receipts', { zakatType: 'Infaq', quantityKg: 0, amountMoney: 10000, date: '2025-03-28', recordedBy: 'Sekretaris' }, sekretaris)
    assert.strictEqual(receipt.status, 201)

    // Distribution safeguards: approval first, then balance.
    const unapproved = await request(port, 'POST', '/api/distributions', { mustahikId: 'KK01', periodId: 2, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 100000, date: '2026-03-20', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(unapproved.status, 400)
    assert.ok(unapproved.body.error.includes('belum disetujui'))
    const overMoney = await request(port, 'POST', '/api/distributions', { mustahikId: 'KK01', periodId: 1, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 700000, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(overMoney.status, 400)
    assert.ok(overMoney.body.error.includes('sisa saldo'))
    const overRice = await request(port, 'POST', '/api/distributions', { mustahikId: 'KK01', periodId: 1, priority: 'Prioritas 1', form: 'Beras', quantityKg: 1, amountMoney: 0, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(overRice.status, 400)
    assert.ok(overRice.body.error.includes('sisa beras'))
    const allowed = await request(port, 'POST', '/api/distributions', { mustahikId: 'KK01', periodId: 1, priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 100000, date: '2025-03-29', recordedBy: 'Bendahara' }, bendahara)
    assert.strictEqual(allowed.status, 201)

    // Dashboard follows the selected period.
    const dashboardTwo = await request(port, 'GET', '/api/dashboard?periodId=2', null, bendahara)
    assert.strictEqual(dashboardTwo.body.data.totalMustahik, 0)
    assert.strictEqual(dashboardTwo.body.data.moneyIn, 0)
    const dashboardOne = await request(port, 'GET', '/api/dashboard?periodId=1', null, bendahara)
    assert.strictEqual(dashboardOne.body.data.totalMustahik, 30)
    assert.strictEqual(dashboardOne.body.data.moneyIn, 7460000)

    console.log('Upgrades test passed')
  } finally {
    server.close()
  }
})
