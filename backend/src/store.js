const mustahikSeed = require('./data/mustahik')
const { receipts, distributions } = require('./data/finance')
const { evaluateMustahik, rankResults, summarize } = require('./engine/ruleEngine')

// In-memory store seeded from the reference data.
// The MySQL schema in db/schema.sql mirrors these tables.
// When MySQL is reachable at startup, db/load.js replaces these
// arrays with rows from the database and sets dbMode to mysql.
// Demo passwords are bendahara123, sekretaris123 and kepala123.
// Change them before production use.
const store = {
  dbMode: 'memory',
  dbStatus: { connected: false, reason: 'Database not configured' },
  mustahik: [...mustahikSeed],
  muzakki: [],
  receipts: [...receipts],
  distributions: [...distributions],
  users: [
    { id: 'U01', name: 'Bendahara TPQ', email: 'bendahara@alfawwaz.or.id', role: 'bendahara', passwordHash: '$2a$10$tYpj8l0Kv.OL1qfrWUDBHe/qGrhDPOWMWyTSnr65nXKoh3LdAXa.a' },
    { id: 'U02', name: 'Sekretaris TPQ', email: 'sekretaris@alfawwaz.or.id', role: 'sekretaris', passwordHash: '$2a$10$9W3szvNAu8Lkmi2fv35g6.o1k21Rmy4nO9jizWog/ZyB6GbFWZh3C' },
    { id: 'U03', name: 'Kepala TPQ', email: 'kepala@alfawwaz.or.id', role: 'kepala', passwordHash: '$2a$10$UIDTvlMt.vfIu2abPmgjJuCgfmPmKT8VQD.m3SiqHEiW/Y8LM87x6' }
  ],
  periods: [
    { id: 1, periodName: 'Ramadan 1446 H', startDate: '2025-03-01', endDate: '2025-03-29', status: 'closed' },
    { id: 2, periodName: 'Ramadan 1447 H', startDate: '2026-02-18', endDate: '2026-03-19', status: 'active' }
  ],
  approvals: [
    { periodId: 1, status: 'approved', approverId: 'U03', approverName: 'Kepala TPQ', note: 'Hasil Ramadan 1446 H disetujui setelah verifikasi lapangan', decidedAt: '2025-03-27T10:00:00.000Z' },
    { periodId: 2, status: 'pending', approverId: null, approverName: null, note: '', decidedAt: null }
  ]
}

function evaluateAll() {
  const niks = store.mustahik.map((item) => item.nik)
  const evaluations = store.mustahik.map((item) => evaluateMustahik(item, niks))
  return { evaluations: rankResults(evaluations), summary: summarize(evaluations) }
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

module.exports = { store, evaluateAll, publicUser }
