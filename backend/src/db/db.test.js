const assert = require('assert')
const { checkConnection, getPool } = require('../config/db')
const { store } = require('../store')
const { initFromDatabase } = require('./load')

async function main() {
  delete process.env.DB_HOST
  assert.strictEqual(getPool(), null)
  const status = await checkConnection()
  assert.strictEqual(status.connected, false)

  const loaded = await initFromDatabase()
  assert.strictEqual(loaded.connected, false)
  assert.strictEqual(store.dbMode, 'memory')
  assert.strictEqual(store.mustahik.length, 30)
  assert.strictEqual(store.approvals.length, 2)
  const pending = store.approvals.find((item) => item.periodId === 2)
  assert.strictEqual(pending.status, 'pending')
  console.log('Database fallback test passed, mode is memory when MySQL is not configured')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
