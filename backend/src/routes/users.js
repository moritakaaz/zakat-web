const express = require('express')
const { store, publicUser } = require('../store')
const { verifyPassword, signToken } = require('../auth/auth')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: store.users.map(publicUser) })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = store.users.find((item) => item.email === email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email atau kata sandi salah' })
  }
  const token = signToken(user)
  res.json({ data: { ...publicUser(user), token } })
})

module.exports = router
