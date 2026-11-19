const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistMuzakki, deleteMuzakki } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()
const canInput = requireRoles('bendahara', 'sekretaris')

router.get('/', (req, res) => {
  const query = String(req.query.search || '').toLowerCase()
  const periodId = req.query.periodId ? Number(req.query.periodId) : null
  const rows = store.muzakki.filter((item) => {
    if (periodId && Number(item.periodId || 1) !== periodId) return false
    if (!query) return true
    return [item.fullName, item.address, item.zakatType].join(' ').toLowerCase().includes(query)
  })
  res.json({ data: rows, total: rows.length })
})

router.get('/:id', (req, res) => {
  const item = store.muzakki.find((row) => row.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Muzakki not found' })
  res.json({ data: item })
})

router.post('/', canInput, (req, res) => {
  const body = req.body || {}
  if (!body.fullName || !body.zakatType) {
    return res.status(400).json({ error: 'Nama muzakki dan jenis zakat wajib diisi' })
  }
  const next = store.muzakki.reduce((max, row) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
  const item = { periodId: 1, id: 'MZ' + String(next).padStart(2, '0'), ...body, periodId: Number(body.periodId || 1) }
  store.muzakki.push(item)
  persistMuzakki(item)
  logAudit(req, 'Tambah muzakki', item.id + ' ' + item.fullName, item.zakatType || '')
  res.status(201).json({ data: item })
})

router.put('/:id', canInput, (req, res) => {
  const index = store.muzakki.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Muzakki not found' })
  store.muzakki[index] = { ...store.muzakki[index], ...req.body }
  persistMuzakki(store.muzakki[index])
  logAudit(req, 'Ubah muzakki', store.muzakki[index].id + ' ' + store.muzakki[index].fullName, store.muzakki[index].zakatType || '')
  res.json({ data: store.muzakki[index] })
})

router.delete('/:id', requireRoles('bendahara'), (req, res) => {
  const index = store.muzakki.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Muzakki not found' })
  const removed = store.muzakki[index]
  store.muzakki.splice(index, 1)
  deleteMuzakki(req.params.id)
  logAudit(req, 'Hapus muzakki', removed.id + ' ' + removed.fullName, removed.zakatType || '')
  res.json({ data: true })
})

module.exports = router
