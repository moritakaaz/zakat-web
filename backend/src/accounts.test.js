const assert = require('assert')
const http = require('http')
const { store } = require('./store')
const { hashPassword } = require('./auth/auth')

// Small fixtures defined here only. No data file is imported.
store.users = [
  { id: 'U01', name: 'Bendahara', email: 'bendahara@contoh.id', role: 'bendahara', passwordHash: hashPassword('bendahara123'), active: true },
  { id: 'U02', name: 'Sekretaris', email: 'sekretaris@contoh.id', role: 'sekretaris', passwordHash: hashPassword('sekretaris123'), active: true },
  { id: 'U03', name: 'Kepala', email: 'kepala@contoh.id', role: 'kepala', passwordHash: hashPassword('kepala123'), active: true }
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
  { id: 'T01', fullName: 'Keluarga Satu', nik: '1111111111111111', address: 'Warakas', occupation: 'Tidak Bekerja', monthlyIncome: 0, dependents: 5, schoolChildren: 3, houseCondition: 'Menumpang', specialStatus: 'Janda', asnaf: 'Fakir', documentStatus: 'Lengkap', surveyed: true, periodId: 1 },
  { id: 'T02', fullName: 'Keluarga Dua', nik: '2222222222222222', address: 'Warakas', occupation: 'Buruh Harian', monthlyIncome: 1700000, dependents: 2, schoolChildren: 1, houseCondition: 'Kontrak', specialStatus: 'Wali Santri', asnaf: 'Miskin', documentStatus: 'Lengkap', surveyed: true, periodId: 1 },
  { id: 'T03', fullName: 'Keluarga Tiga', nik: '3333333333333333', address: 'Warakas', occupation: 'Karyawan Toko', monthlyIncome: 2800000, dependents: 2, schoolChildren: 1, houseCondition: 'Milik Sendiri', specialStatus: '-', asnaf: '-', documentStatus: 'Lengkap', surveyed: true, periodId: 1 }
]
store.muzakki = [
  { id: 'MZ01', fullName: 'Donatur Satu', address: 'Warakas', zakatType: 'Zakat Mal', periodId: 1 }
]
store.receipts = [
  { id: 'RC01', periodId: 1, muzakkiId: 'MZ01', name: 'Donatur Satu', zakatType: 'Zakat Mal', form: 'Uang', quantityKg: 0, amountMoney: 2000000, date: '2025-03-21' },
  { id: 'RC02', periodId: 1, muzakkiId: 'MZ01', name: 'Donatur Satu', zakatType: 'Zakat Fitrah', form: 'Beras', quantityKg: 10, amountMoney: 0, date: '2025-03-25' }
]
store.distributions = [
  { id: 'DS01', periodId: 1, mustahikId: 'T01', groupName: '', name: 'Keluarga Satu', zakatType: 'Zakat Mal', priority: 'Prioritas 1', form: 'Uang', quantityKg: 0, amountMoney: 500000, date: '2025-03-28' },
  { id: 'DS02', periodId: 1, mustahikId: null, groupName: 'Prioritas 1 (1 KK)', name: 'Prioritas 1 (1 KK)', zakatType: 'Zakat Fitrah', priority: '', form: 'Beras', quantityKg: 5, amountMoney: 0, date: '2025-03-28' },
  { id: 'DS03', periodId: 2, mustahikId: null, groupName: 'Kelompok Uji', name: 'Kelompok Uji', zakatType: 'Infaq', priority: '', form: 'Uang', quantityKg: 0, amountMoney: 100000, date: '2026-03-10' }
]
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
    const sekretaris = await login(port, 'sekretaris@contoh.id', 'sekretaris123')
    const kepala = await login(port, 'kepala@contoh.id', 'kepala123')

    // The user list needs a token.
    const noToken = await request(port, 'GET', '/api/users', null, null)
    assert.strictEqual(noToken.status, 401)
    const list = await request(port, 'GET', '/api/users', null, bendahara)
    assert.strictEqual(list.status, 200)
    assert.strictEqual(list.body.data.length, 3)
    assert.ok(list.body.data.every((row) => row.active === true))

    // Profile name change.
    const renamed = await request(port, 'PATCH', '/api/users/me', { name: 'Bendahara Baru' }, bendahara)
    assert.strictEqual(renamed.status, 200)
    assert.strictEqual(renamed.body.data.name, 'Bendahara Baru')

    // Password change needs the old password.
    const wrongOld = await request(port, 'PATCH', '/api/users/me', { oldPassword: 'salah123', newPassword: 'bendaharaBaru1' }, bendahara)
    assert.strictEqual(wrongOld.status, 400)
    const changed = await request(port, 'PATCH', '/api/users/me', { oldPassword: 'bendahara123', newPassword: 'bendaharaBaru1' }, bendahara)
    assert.strictEqual(changed.status, 200)
    const oldLogin = await request(port, 'POST', '/api/users/login', { email: 'bendahara@contoh.id', password: 'bendahara123' })
    assert.strictEqual(oldLogin.status, 401)
    const newLogin = await request(port, 'POST', '/api/users/login', { email: 'bendahara@contoh.id', password: 'bendaharaBaru1' })
    assert.strictEqual(newLogin.status, 200)

    // Receipt edit moves the money total.
    const editedReceipt = await request(port, 'PUT', '/api/receipts/RC01', { amountMoney: 2500000 }, bendahara)
    assert.strictEqual(editedReceipt.status, 200)
    assert.strictEqual(editedReceipt.body.data.amountMoney, 2500000)
    const receipts = await request(port, 'GET', '/api/receipts', null, bendahara)
    assert.strictEqual(receipts.body.totalMoney, 2500000)

    // A receipt edit that would push the balance below zero is rejected.
    const negativeBalance = await request(port, 'PUT', '/api/receipts/RC01', { amountMoney: 100000 }, bendahara)
    assert.strictEqual(negativeBalance.status, 400)
    assert.ok(negativeBalance.body.error.includes('negatif'))

    // Sekretaris can edit receipts, Kepala cannot.
    const riceEdited = await request(port, 'PUT', '/api/receipts/RC02', { quantityKg: 12 }, sekretaris)
    assert.strictEqual(riceEdited.status, 200)
    const kepalaReceipt = await request(port, 'PUT', '/api/receipts/RC01', { amountMoney: 2400000 }, kepala)
    assert.strictEqual(kepalaReceipt.status, 403)
    const missingReceipt = await request(port, 'PUT', '/api/receipts/RC99', { amountMoney: 1000 }, bendahara)
    assert.strictEqual(missingReceipt.status, 404)

    // A distribution to a Tidak Layak household is rejected on create and on edit.
    const badCreate = await request(port, 'POST', '/api/distributions', { periodId: 1, mustahikId: 'T03', zakatType: 'Zakat Mal', form: 'Uang', amountMoney: 100000, date: '2025-03-29' }, bendahara)
    assert.strictEqual(badCreate.status, 400)
    assert.ok(badCreate.body.error.includes('bukan prioritas penyaluran'))
    const badEdit = await request(port, 'PUT', '/api/distributions/DS01', { mustahikId: 'T03' }, bendahara)
    assert.strictEqual(badEdit.status, 400)

    // Distribution edit moves the amount within the balance.
    const editedDistribution = await request(port, 'PUT', '/api/distributions/DS01', { amountMoney: 600000 }, bendahara)
    assert.strictEqual(editedDistribution.status, 200)
    assert.strictEqual(editedDistribution.body.data.amountMoney, 600000)
    const overBalance = await request(port, 'PUT', '/api/distributions/DS01', { amountMoney: 3000000 }, bendahara)
    assert.strictEqual(overBalance.status, 400)
    assert.ok(overBalance.body.error.includes('melebihi sisa saldo'))

    // Moving a distribution to another eligible household updates its priority.
    const moved = await request(port, 'PUT', '/api/distributions/DS01', { mustahikId: 'T02' }, bendahara)
    assert.strictEqual(moved.status, 200)
    assert.strictEqual(moved.body.data.priority, 'Prioritas 2')
    assert.strictEqual(moved.body.data.name, 'Keluarga Dua')

    // Rice edit respects the rice balance.
    const riceDistribution = await request(port, 'PUT', '/api/distributions/DS02', { quantityKg: 6 }, bendahara)
    assert.strictEqual(riceDistribution.status, 200)
    const riceOver = await request(port, 'PUT', '/api/distributions/DS02', { quantityKg: 20 }, bendahara)
    assert.strictEqual(riceOver.status, 400)

    // A distribution in a period that is not approved stays locked.
    const locked = await request(port, 'PUT', '/api/distributions/DS03', { amountMoney: 150000 }, bendahara)
    assert.strictEqual(locked.status, 400)
    assert.ok(locked.body.error.includes('belum disetujui'))
    const sekretarisDistribution = await request(port, 'PUT', '/api/distributions/DS01', { amountMoney: 550000 }, sekretaris)
    assert.strictEqual(sekretarisDistribution.status, 403)
    const missingDistribution = await request(port, 'PUT', '/api/distributions/DS99', { amountMoney: 1000 }, bendahara)
    assert.strictEqual(missingDistribution.status, 404)

    // Only Kepala TPQ manages users.
    const created = await request(port, 'POST', '/api/users', { name: 'Bendahara Cadangan', email: 'cadangan@contoh.id', password: 'cadangan123', role: 'bendahara' }, kepala)
    assert.strictEqual(created.status, 201)
    assert.strictEqual(created.body.data.id, 'U04')
    const newUserLogin = await login(port, 'cadangan@contoh.id', 'cadangan123')
    assert.ok(newUserLogin)
    const duplicate = await request(port, 'POST', '/api/users', { name: 'Duplikat', email: 'cadangan@contoh.id', password: 'duplikat123', role: 'sekretaris' }, kepala)
    assert.strictEqual(duplicate.status, 409)
    const shortPassword = await request(port, 'POST', '/api/users', { name: 'Pendek', email: 'pendek@contoh.id', password: 'abc', role: 'sekretaris' }, kepala)
    assert.strictEqual(shortPassword.status, 400)
    const bendaharaCreate = await request(port, 'POST', '/api/users', { name: 'Tidak Boleh', email: 'tidak@contoh.id', password: 'tidakboleh1', role: 'sekretaris' }, bendahara)
    assert.strictEqual(bendaharaCreate.status, 403)

    // Deactivating blocks login, reactivating restores it.
    const deactivated = await request(port, 'PUT', '/api/users/U04', { active: false }, kepala)
    assert.strictEqual(deactivated.status, 200)
    assert.strictEqual(deactivated.body.data.active, false)
    const inactiveLogin = await request(port, 'POST', '/api/users/login', { email: 'cadangan@contoh.id', password: 'cadangan123' })
    assert.strictEqual(inactiveLogin.status, 401)
    const reactivated = await request(port, 'PUT', '/api/users/U04', { active: true }, kepala)
    assert.strictEqual(reactivated.status, 200)
    const activeLogin = await login(port, 'cadangan@contoh.id', 'cadangan123')
    assert.ok(activeLogin)

    // Kepala cannot edit their own account through user management.
    const selfEdit = await request(port, 'PUT', '/api/users/U03', { name: 'Kepala Lain' }, kepala)
    assert.strictEqual(selfEdit.status, 400)

    // Kepala resets a password through user management.
    const reset = await request(port, 'PUT', '/api/users/U04', { password: 'cadanganBaru1' }, kepala)
    assert.strictEqual(reset.status, 200)
    const resetLogin = await login(port, 'cadangan@contoh.id', 'cadanganBaru1')
    assert.ok(resetLogin)

    // Every change above is recorded in the audit log.
    const log = await request(port, 'GET', '/api/audit-log', null, bendahara)
    assert.strictEqual(log.status, 200)
    const actions = log.body.data.map((row) => row.action)
    assert.ok(actions.includes('Ubah profil'))
    assert.ok(actions.includes('Ubah kata sandi'))
    assert.ok(actions.includes('Ubah penerimaan'))
    assert.ok(actions.includes('Ubah penyaluran'))
    assert.ok(actions.includes('Tambah pengguna'))
    assert.ok(actions.includes('Ubah pengguna'))
    assert.ok(actions.includes('Reset kata sandi'))

    console.log('Accounts test passed')
    server.close()
    process.exit(0)
  } catch (error) {
    console.error(error)
    server.close()
    process.exit(1)
  }
})
