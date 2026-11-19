const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
require('dotenv').config()

// Runs db/schema.sql and db/seed.sql with multiple statements
// enabled. The pool in config/db.js keeps multiple statements off.
async function main() {
  if (!process.env.DB_HOST) {
    console.log('Database not configured, seed skipped')
    return
  }
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true
  })
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'schema.sql'), 'utf8')
    const seed = fs.readFileSync(path.join(__dirname, '..', '..', 'db', 'seed.sql'), 'utf8')
    await connection.query(schema)
    await connection.query(seed)
    console.log('Database seeded')
  } finally {
    await connection.end()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
