const mustahikSeed = require('./data/mustahik')
const { receipts, distributions } = require('./data/finance')
const { evaluateMustahik, rankResults, summarize } = require('./engine/ruleEngine')

// In-memory store seeded from the reference data.
// The MySQL schema in db/schema.sql mirrors these tables.
const store = {
  mustahik: [...mustahikSeed],
  muzakki: [],
  receipts: [...receipts],
  distributions: [...distributions],
  users: [
    { id: 'U01', name: 'Bendahara TPQ', email: 'bendahara@alfawwaz.or.id', role: 'bendahara' },
    { id: 'U02', name: 'Sekretaris TPQ', email: 'sekretaris@alfawwaz.or.id', role: 'sekretaris' },
    { id: 'U03', name: 'Kepala TPQ', email: 'kepala@alfawwaz.or.id', role: 'kepala' }
  ],
  periods: [
    { id: 1, periodName: 'Ramadan 1446 H', startDate: '2025-03-01', endDate: '2025-03-29', status: 'closed' },
    { id: 2, periodName: 'Ramadan 1447 H', startDate: '2026-02-18', endDate: '2026-03-19', status: 'active' }
  ]
}

function evaluateAll() {
  const niks = store.mustahik.map((item) => item.nik)
  const evaluations = store.mustahik.map((item) => evaluateMustahik(item, niks))
  return { evaluations: rankResults(evaluations), summary: summarize(evaluations) }
}

module.exports = { store, evaluateAll }
