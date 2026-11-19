const mysql = require('mysql2/promise')
require('dotenv').config()

let pool = null

function getPool() {
  if (pool) return pool
  if (!process.env.DB_HOST) return null
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  })
  return pool
}

async function checkConnection() {
  const activePool = getPool()
  if (!activePool) return { connected: false, reason: 'Database not configured' }
  try {
    await activePool.query('SELECT 1')
    return { connected: true }
  } catch (error) {
    return { connected: false, reason: error.message }
  }
}

module.exports = { getPool, checkConnection }
