const assert = require('assert')
const { checkConnection, getPool } = require('../config/db')
const { store } = require('../store')
const { initFromDatabase } = require('./load')

async function main() {
  delete process.env.DB_HOST

  // The store starts empty and stays empty without a database.
  assert.strictEqual(store.users.length, 0)
  assert.strictEqual(store.periods.length, 0)
  assert.strictEqual(store.mustahik.length, 0)
  assert.strictEqual(store.muzakki.length, 0)
  assert.strictEqual(store.receipts.length, 0)
  assert.strictEqual(store.distributions.length, 0)
  assert.strictEqual(store.rules.length, 0)
  assert.strictEqual(store.approvals.length, 0)

  assert.strictEqual(getPool(), null)
  const status = await checkConnection()
  assert.strictEqual(status.connected, false)

  const loaded = await initFromDatabase()
  assert.strictEqual(loaded.connected, false)
  assert.strictEqual(store.dbMode, 'memory')
  assert.strictEqual(store.mustahik.length, 0)
  assert.strictEqual(store.users.length, 0)
  assert.strictEqual(store.rules.length, 0)
  console.log('Database fallback test passed, store stays empty when MySQL is not configured')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
