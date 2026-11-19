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

const server = app.listen(0, async () => {
  const port = server.address().port
  try {
    const wrong = await request(port, 'POST', '/api/users/login', { email: 'bendahara@alfawwaz.or.id', password: 'salah123' })
    assert.strictEqual(wrong.status, 401)

    const unknown = await request(port, 'POST', '/api/users/login', { email: 'tidak@ada.or.id', password: 'bendahara123' })
    assert.strictEqual(unknown.status, 401)

    const good = await request(port, 'POST', '/api/users/login', { email: 'bendahara@alfawwaz.or.id', password: 'bendahara123' })
    assert.strictEqual(good.status, 200)
    assert.ok(good.body.data.token)
    assert.strictEqual(good.body.data.email, 'bendahara@alfawwaz.or.id')
    assert.strictEqual(good.body.data.password, undefined)
    assert.strictEqual(good.body.data.passwordHash, undefined)
    const token = good.body.data.token

    const noToken = await request(port, 'GET', '/api/mustahik')
    assert.strictEqual(noToken.status, 401)

    const withToken = await request(port, 'GET', '/api/mustahik', null, token)
    assert.strictEqual(withToken.status, 200)
    assert.strictEqual(withToken.body.total, 30)

    const dashboard = await request(port, 'GET', '/api/dashboard', null, token)
    assert.strictEqual(dashboard.status, 200)
    assert.strictEqual(dashboard.body.data.totalMustahik, 30)
    assert.strictEqual(dashboard.body.data.moneyIn, 7450000)

    const health = await request(port, 'GET', '/health')
    assert.strictEqual(health.status, 200)
    assert.strictEqual(health.body.status, 'ok')
    assert.strictEqual(health.body.database.connected, false)
    assert.strictEqual(health.body.dbMode, 'memory')

    const kepala = await request(port, 'POST', '/api/users/login', { email: 'kepala@alfawwaz.or.id', password: 'kepala123' })
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
