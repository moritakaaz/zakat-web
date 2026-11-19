const express = require('express')
const { store, evaluateAll } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistRule } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()
const numericFields = ['incomeMin', 'incomeLimit', 'perCapitaLimit', 'dependentsMin', 'honorMin', 'honorMax', 'schoolMin']

// Rules are data in the store, mirrored in the rules table.
// Editing them here changes the engine result without code changes.
router.get('/', (req, res) => {
  const rows = [...store.rules].sort((a, b) => (a.order - b.order) || String(a.code).localeCompare(String(b.code)))
  res.json({ data: rows })
})

router.put('/:code', requireRoles('bendahara'), (req, res) => {
  const rule = store.rules.find((item) => item.code === req.params.code)
  if (!rule) return res.status(404).json({ error: 'Rule not found' })
  const body = req.body || {}
  if (typeof body.condition === 'string' && body.condition.trim()) rule.condition = body.condition.trim()
  if (typeof body.result === 'string' && body.result.trim()) rule.result = body.result.trim()
  if (typeof body.source === 'string') rule.source = body.source
  if (Number.isInteger(body.order) && body.order >= 1) rule.order = body.order
  if (typeof body.isActive === 'boolean') rule.isActive = body.isActive
  for (const field of numericFields) {
    if (body[field] === null) delete rule[field]
    else if (typeof body[field] === 'number' && body[field] >= 0) rule[field] = body[field]
  }
  persistRule(rule)
  logAudit(req, 'Ubah aturan', rule.code, rule.condition)
  res.json({ data: rule })
})

router.post('/evaluate', requireRoles('bendahara'), (req, res) => {
  const periodId = req.body && req.body.periodId ? Number(req.body.periodId) : null
  res.json(evaluateAll(periodId))
})

router.post('/evaluate-one', requireRoles('bendahara'), (req, res) => {
  const { evaluateMustahik } = require('../engine/ruleEngine')
  const list = store.mustahik.filter((item) => !req.body.periodId || Number(item.periodId || 1) === Number(req.body.periodId))
  const niks = list.map((item) => item.nik)
  const evaluation = evaluateMustahik(req.body || {}, niks, store.rules)
  res.json({ data: evaluation })
})

module.exports = router
