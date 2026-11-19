const express = require('express')
const { store, publicUser } = require('../store')
const { hashPassword, verifyPassword, signToken, requireAuth, requireRoles } = require('../auth/auth')
const { persistUser } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()
const roles = ['bendahara', 'sekretaris', 'kepala']

function nextUserId() {
  const next = store.users.reduce((max, row) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
  return 'U' + String(next).padStart(2, '0')
}

router.get('/', requireAuth, (req, res) => {
  res.json({ data: store.users.map(publicUser) })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = store.users.find((item) => item.email === email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Email atau kata sandi salah' })
  }
  if (user.active === false) {
    return res.status(401).json({ error: 'Akun ini tidak aktif, hubungi Kepala TPQ' })
  }
  const token = signToken(user)
  res.json({ data: { ...publicUser(user), token } })
})

router.patch('/me', requireAuth, (req, res) => {
  const user = store.users.find((item) => item.id === req.user.id)
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' })
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const newPassword = body.newPassword || ''
  if (body.name !== undefined && !name) {
    return res.status(400).json({ error: 'Nama tidak boleh kosong' })
  }
  if (newPassword) {
    if (!verifyPassword(body.oldPassword, user.passwordHash)) {
      return res.status(400).json({ error: 'Kata sandi lama salah' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Kata sandi baru minimal 8 karakter' })
    }
  }
  if (name) {
    user.name = name
    logAudit(req, 'Ubah profil', user.id + ' ' + user.name, 'Nama diubah menjadi ' + user.name)
  }
  if (newPassword) {
    user.passwordHash = hashPassword(newPassword)
    logAudit(req, 'Ubah kata sandi', user.id + ' ' + user.name, 'Kata sandi diubah')
  }
  persistUser(user)
  res.json({ data: publicUser(user) })
})

router.post('/', requireAuth, requireRoles('kepala'), (req, res) => {
  const body = req.body || {}
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = body.password || ''
  if (!name) return res.status(400).json({ error: 'Nama wajib diisi' })
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email tidak valid' })
  if (!roles.includes(body.role)) return res.status(400).json({ error: 'Peran tidak dikenal' })
  if (!password || password.length < 8) return res.status(400).json({ error: 'Kata sandi minimal 8 karakter' })
  if (store.users.some((item) => item.email === email)) {
    return res.status(409).json({ error: 'Email sudah dipakai pengguna lain' })
  }
  const user = { id: nextUserId(), name, email, role: body.role, passwordHash: hashPassword(password), active: true }
  store.users.push(user)
  persistUser(user)
  logAudit(req, 'Tambah pengguna', user.id + ' ' + user.name, user.email + ' peran ' + user.role)
  res.status(201).json({ data: publicUser(user) })
})

router.put('/:id', requireAuth, requireRoles('kepala'), (req, res) => {
  const user = store.users.find((item) => item.id === req.params.id)
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' })
  if (user.id === req.user.id) {
    return res.status(400).json({ error: 'Ubah data sendiri lewat halaman Profil Saya' })
  }
  const body = req.body || {}
  const changes = []
  if (body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return res.status(400).json({ error: 'Nama tidak boleh kosong' })
    if (name !== user.name) {
      user.name = name
      changes.push('nama')
    }
  }
  if (body.email !== undefined) {
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email tidak valid' })
    if (store.users.some((item) => item.id !== user.id && item.email === email)) {
      return res.status(409).json({ error: 'Email sudah dipakai pengguna lain' })
    }
    if (email !== user.email) {
      user.email = email
      changes.push('email')
    }
  }
  if (body.role !== undefined) {
    if (!roles.includes(body.role)) return res.status(400).json({ error: 'Peran tidak dikenal' })
    if (body.role !== user.role) {
      user.role = body.role
      changes.push('peran')
    }
  }
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') return res.status(400).json({ error: 'Status aktif tidak valid' })
    if (body.active !== (user.active !== false)) {
      user.active = body.active
      changes.push(body.active ? 'diaktifkan' : 'dinonaktifkan')
    }
  }
  if (body.password) {
    if (body.password.length < 8) return res.status(400).json({ error: 'Kata sandi minimal 8 karakter' })
    user.passwordHash = hashPassword(body.password)
    logAudit(req, 'Reset kata sandi', user.id + ' ' + user.name, 'Kata sandi direset oleh Kepala TPQ')
  }
  if (changes.length) {
    logAudit(req, 'Ubah pengguna', user.id + ' ' + user.name, 'Diubah ' + changes.join(', '))
  }
  persistUser(user)
  res.json({ data: publicUser(user) })
})

module.exports = router
