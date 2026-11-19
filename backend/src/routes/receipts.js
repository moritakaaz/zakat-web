const express = require('express')
const { store } = require('../store')

const router = express.Router()

router.get('/', (req, res) => {
  const moneyIn = store.receipts.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = store.receipts.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  res.json({ data: store.receipts, totalMoney: moneyIn, totalRiceKg: riceIn })
})

router.post('/', (req, res) => {
  const item = { id: 'RC' + String(store.receipts.length + 1).padStart(2, '0'), ...req.body }
  store.receipts.push(item)
  res.status(201).json({ data: item })
})

module.exports = router
