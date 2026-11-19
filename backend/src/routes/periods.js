const express = require('express')
const { store } = require('../store')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: store.periods })
})

router.get('/:id', (req, res) => {
  const item = store.periods.find((row) => row.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Period not found' })
  res.json({ data: item })
})

module.exports = router
