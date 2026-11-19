const fs = require('fs')
const path = require('path')
const { getPool } = require('../config/db')

async function main() {
  const pool = getPool()
  if (!pool) {
    console.log('Database not configured, seed skipped')
    return
  }
  const schema = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8')
  const seed = fs.readFileSync(path.join(__dirname, '..', 'db', 'seed.sql'), 'utf8')
  const connection = await pool.getConnection()
  try {
    await connection.query(schema)
    await connection.query(seed)
    console.log('Database seeded')
  } finally {
    connection.release()
  }
  await pool.end()
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
