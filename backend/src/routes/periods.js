const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistPeriod } = require('../db/persist')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: store.periods })
})

router.get('/:id', (req, res) => {
  const item = store.periods.find((row) => row.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Period not found' })
  res.json({ data: item })
})

router.post('/', requireRoles('bendahara'), (req, res) => {
  const body = req.body || {}
  if (!body.periodName || !body.startDate || !body.endDate) {
    return res.status(400).json({ error: 'Nama periode, tanggal mulai, dan tanggal selesai wajib diisi' })
  }
  const id = store.periods.reduce((max, row) => Math.max(max, row.id), 0) + 1
  const item = { id, periodName: String(body.periodName), startDate: String(body.startDate), endDate: String(body.endDate), status: 'active' }
  store.periods.push(item)
  store.approvals.push({ periodId: id, status: 'pending', approverId: null, approverName: null, note: '', decidedAt: null })
  persistPeriod(item)
  res.status(201).json({ data: item })
})

router.post('/:id/close', requireRoles('bendahara'), (req, res) => {
  const item = store.periods.find((row) => row.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Period not found' })
  item.status = 'closed'
  persistPeriod(item)
  res.json({ data: item })
})

module.exports = router
