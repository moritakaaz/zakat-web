const express = require('express')
const { store } = require('../store')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: store.users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })) })
})

router.post('/login', (req, res) => {
  const { email } = req.body || {}
  const user = store.users.find((item) => item.email === email)
  if (!user) return res.status(401).json({ error: 'Email tidak terdaftar' })
  res.json({ data: { id: user.id, name: user.name, email: user.email, role: user.role } })
})

module.exports = router
