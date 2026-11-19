const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistDistribution } = require('../db/persist')

const router = express.Router()

function periodRows(rows, periodId) {
  return rows.filter((row) => Number(row.periodId || 1) === Number(periodId))
}

router.get('/', (req, res) => {
  const periodId = req.query.periodId ? Number(req.query.periodId) : null
  const rows = periodId ? periodRows(store.distributions, periodId) : store.distributions
  const moneyOut = rows.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceOut = rows.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  res.json({ data: rows, totalMoney: moneyOut, totalRiceKg: riceOut })
})

router.post('/', requireRoles('bendahara'), (req, res) => {
  const body = req.body || {}
  const mustahik = store.mustahik.find((row) => row.id === body.mustahikId)
  const periodId = Number(body.periodId || (mustahik && mustahik.periodId) || 1)
  const approval = store.approvals.find((row) => row.periodId === periodId)
  if (!approval || approval.status !== 'approved') {
    return res.status(400).json({ error: 'Hasil prioritas periode ini belum disetujui Kepala TPQ, penyaluran belum dapat dicatat' })
  }
  const moneyIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const moneyOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const riceOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const money = Number(body.amountMoney || 0)
  const rice = Number(body.quantityKg || 0)
  if (money > moneyIn - moneyOut) {
    return res.status(400).json({ error: 'Jumlah uang melebihi sisa saldo Rp ' + (moneyIn - moneyOut).toLocaleString('id-ID') })
  }
  if (rice > riceIn - riceOut) {
    return res.status(400).json({ error: 'Jumlah beras melebihi sisa beras ' + (riceIn - riceOut) + ' kg' })
  }
  const next = store.distributions.reduce((max, row) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
  const item = { periodId, id: 'DS' + String(next).padStart(2, '0'), ...body, periodId }
  store.distributions.push(item)
  persistDistribution(item)
  res.status(201).json({ data: item })
})

module.exports = router
