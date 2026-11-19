const express = require('express')
const { store } = require('../store')
const { persistMustahik, deleteMustahik } = require('../db/persist')

const router = express.Router()

router.get('/', (req, res) => {
  const query = String(req.query.search || '').toLowerCase()
  const rows = store.mustahik.filter((item) => {
    if (!query) return true
    return [item.fullName, item.address, item.occupation, item.specialStatus]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
  res.json({ data: rows, total: rows.length })
})

router.get('/:id', (req, res) => {
  const item = store.mustahik.find((row) => row.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Mustahik not found' })
  res.json({ data: item })
})

router.post('/', (req, res) => {
  const body = req.body || {}
  const id = 'KK' + String(store.mustahik.length + 1).padStart(2, '0')
  const item = { id, ...body }
  store.mustahik.push(item)
  persistMustahik(item)
  res.status(201).json({ data: item })
})

router.put('/:id', (req, res) => {
  const index = store.mustahik.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Mustahik not found' })
  store.mustahik[index] = { ...store.mustahik[index], ...req.body }
  persistMustahik(store.mustahik[index])
  res.json({ data: store.mustahik[index] })
})

router.delete('/:id', (req, res) => {
  const index = store.mustahik.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Mustahik not found' })
  store.mustahik.splice(index, 1)
  deleteMustahik(req.params.id)
  res.json({ data: true })
})

module.exports = router
