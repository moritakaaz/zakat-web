const assert = require('assert')
const { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, requireRole } = require('./auth')

const hash = hashPassword('bendahara123')
assert.strictEqual(verifyPassword('bendahara123', hash), true)
assert.strictEqual(verifyPassword('salah123', hash), false)
assert.strictEqual(verifyPassword('', hash), false)
assert.strictEqual(verifyPassword('bendahara123', ''), false)

const user = { id: 'U03', name: 'Kepala TPQ', email: 'kepala@alfawwaz.or.id', role: 'kepala' }
const token = signToken(user)
const payload = verifyToken(token)
assert.strictEqual(payload.email, 'kepala@alfawwaz.or.id')
assert.strictEqual(payload.role, 'kepala')

assert.throws(() => verifyToken(token + 'x'))
assert.throws(() => verifyToken('bukan-token'))

function mockRes() {
  const res = {}
  res.statusCode = 200
  res.body = null
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (body) => { res.body = body; return res }
  return res
}

let nextCalled = false
const reqNoToken = { method: 'GET', path: '/mustahik', headers: {} }
requireAuth(reqNoToken, mockRes(), () => { nextCalled = true })
assert.strictEqual(nextCalled, false)

nextCalled = false
const reqBadToken = { method: 'GET', path: '/mustahik', headers: { authorization: 'Bearer salah' } }
const resBad = mockRes()
requireAuth(reqBadToken, resBad, () => { nextCalled = true })
assert.strictEqual(nextCalled, false)
assert.strictEqual(resBad.statusCode, 401)

nextCalled = false
const reqGood = { method: 'GET', path: '/mustahik', headers: { authorization: 'Bearer ' + token } }
requireAuth(reqGood, mockRes(), () => { nextCalled = true })
assert.strictEqual(nextCalled, true)
assert.strictEqual(reqGood.user.role, 'kepala')

const resForbidden = mockRes()
let roleNext = false
requireRole('kepala')({ user: { role: 'bendahara' } }, resForbidden, () => { roleNext = true })
assert.strictEqual(roleNext, false)
assert.strictEqual(resForbidden.statusCode, 403)

roleNext = false
requireRole('kepala')({ user: { role: 'kepala' } }, mockRes(), () => { roleNext = true })
assert.strictEqual(roleNext, true)

console.log('Auth test passed')
