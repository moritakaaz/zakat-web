const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret = process.env.JWT_SECRET || 'zakat-al-fawwaz-dev-secret'
const expiresIn = process.env.JWT_EXPIRES_IN || '8h'

function hashPassword(password) {
  return bcrypt.hashSync(password, 10)
}

function verifyPassword(password, hash) {
  if (!password || !hash) return false
  return bcrypt.compareSync(password, hash)
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    secret,
    { expiresIn }
  )
}

function verifyToken(token) {
  return jwt.verify(token, secret)
}

// Express middleware. Login and health stay public, every other
// /api route needs a Bearer token.
function requireAuth(req, res, next) {
  if (req.method === 'POST' && req.path === '/users/login') return next()
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Token tidak ditemukan' })
  try {
    req.user = verifyToken(token)
    return next()
  } catch (error) {
    return res.status(401).json({ error: 'Token tidak valid atau kedaluwarsa' })
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Peran tidak diizinkan untuk aksi ini' })
    }
    return next()
  }
}

module.exports = { hashPassword, verifyPassword, signToken, verifyToken, requireAuth, requireRole }
