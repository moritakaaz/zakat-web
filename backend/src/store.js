const { evaluateMustahik, rankResults, summarize } = require('./engine/ruleEngine')

// In-memory store. Every array starts empty.
// The only data source is MySQL, loaded by db/load.js at startup.
// When MySQL is not configured or not reachable, the store stays
// empty and the app shows no data. No seed data lives in code.
const store = {
  dbMode: 'memory',
  dbStatus: { connected: false, reason: 'Database not configured' },
  mustahik: [],
  muzakki: [],
  receipts: [],
  distributions: [],
  rules: [],
  users: [],
  periods: [],
  approvals: []
}

function evaluateAll(periodId) {
  const list = periodId ? store.mustahik.filter((item) => Number(item.periodId || 1) === Number(periodId)) : store.mustahik
  const niks = list.map((item) => item.nik)
  const evaluations = list.map((item) => evaluateMustahik(item, niks, store.rules))
  return { evaluations: rankResults(evaluations), summary: summarize(evaluations) }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

module.exports = { store, evaluateAll, publicUser }
