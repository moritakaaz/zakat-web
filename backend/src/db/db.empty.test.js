const assert = require('assert')

async function main() {
  const dbPath = require.resolve('../config/db')
  require(dbPath)
  const fakePool = { query: async () => [[]] }
  require.cache[dbPath].exports = {
    getPool: () => fakePool,
    checkConnection: async () => ({ connected: true })
  }
  delete require.cache[require.resolve('./load')]
  delete require.cache[require.resolve('../store')]
  const { initFromDatabase } = require('./load')
  const { store } = require('../store')

  assert.strictEqual(store.mustahik.length, 0)
  const status = await initFromDatabase()
  assert.strictEqual(status.connected, true)
  assert.strictEqual(store.dbMode, 'mysql')
  assert.strictEqual(store.users.length, 0)
  assert.strictEqual(store.periods.length, 0)
  assert.strictEqual(store.mustahik.length, 0)
  assert.strictEqual(store.muzakki.length, 0)
  assert.strictEqual(store.receipts.length, 0)
  assert.strictEqual(store.distributions.length, 0)
  assert.strictEqual(store.rules.length, 0)
  assert.strictEqual(store.approvals.length, 0)
  console.log('Empty database test passed, mode is mysql with no rows when MySQL is connected but empty')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
