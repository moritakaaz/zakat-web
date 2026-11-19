const express = require('express')
const { store } = require('../store')
const { persistDistribution } = require('../db/persist')

const router = express.Router()

router.get('/', (req, res) => {
  const moneyOut = store.distributions.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceOut = store.distributions.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  res.json({ data: store.distributions, totalMoney: moneyOut, totalRiceKg: riceOut })
})

router.post('/', (req, res) => {
  const item = { id: 'DS' + String(store.distributions.length + 1).padStart(2, '0'), ...req.body }
  store.distributions.push(item)
  persistDistribution(item)
  res.status(201).json({ data: item })
})

module.exports = router
