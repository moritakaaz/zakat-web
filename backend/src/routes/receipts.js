const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistReceipt } = require('../db/persist')

const router = express.Router()

router.get('/', (req, res) => {
  const moneyIn = store.receipts.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = store.receipts.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  res.json({ data: store.receipts, totalMoney: moneyIn, totalRiceKg: riceIn })
})

router.post('/', requireRoles('bendahara', 'sekretaris'), (req, res) => {
  const nextNumber = store.receipts.reduce((max, row) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
  const item = { periodId: 1, ...req.body, id: 'RC' + String(nextNumber).padStart(2, '0'), periodId: Number((req.body || {}).periodId || 1) }
  store.receipts.push(item)
  persistReceipt(item)
  res.status(201).json({ data: item })
})

module.exports = router
