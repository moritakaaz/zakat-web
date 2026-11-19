const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistMustahik, deleteMustahik } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()
const canInput = requireRoles('bendahara', 'sekretaris')

function cleanNik(value) {
  return String(value || '').replace(/\D/g, '')
}

function duplicateNik(nik, periodId, excludeId) {
  const digits = cleanNik(nik)
  if (!digits) return false
  return store.mustahik.some((item) => cleanNik(item.nik) === digits && Number(item.periodId || 1) === Number(periodId || 1) && item.id !== excludeId)
}

router.get('/', (req, res) => {
  const query = String(req.query.search || '').toLowerCase()
  const periodId = req.query.periodId ? Number(req.query.periodId) : null
  const rows = store.mustahik.filter((item) => {
    if (periodId && Number(item.periodId || 1) !== periodId) return false
    if (!query) return true
    return [item.fullName, item.nik, item.address, item.occupation, item.specialStatus]
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

router.post('/', canInput, (req, res) => {
  const body = req.body || {}
  if (!body.fullName || !body.nik) {
    return res.status(400).json({ error: 'Nama kepala keluarga dan NIK wajib diisi' })
  }
  if (cleanNik(body.nik).length !== 16) {
    return res.status(400).json({ error: 'NIK wajib diisi 16 digit angka' })
  }
  if (duplicateNik(body.nik, body.periodId || 1)) {
    return res.status(409).json({ error: 'NIK sudah tercatat pada periode yang sama' })
  }
  const next = store.mustahik.reduce((max, row) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
  const id = 'KK' + String(next).padStart(2, '0')
  const item = { periodId: 1, id, ...body, nik: cleanNik(body.nik), periodId: Number(body.periodId || 1), surveyed: body.surveyed === true }
  store.mustahik.push(item)
  persistMustahik(item)
  logAudit(req, 'Tambah mustahik', item.id + ' ' + item.fullName, 'NIK ' + item.nik)
  res.status(201).json({ data: item })
})

router.put('/:id', canInput, (req, res) => {
  const index = store.mustahik.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Mustahik not found' })
  const merged = { ...store.mustahik[index], ...req.body }
  if (req.body.surveyed !== undefined) merged.surveyed = req.body.surveyed === true
  if (merged.nik !== undefined) {
    if (cleanNik(merged.nik).length !== 16) {
      return res.status(400).json({ error: 'NIK wajib diisi 16 digit angka' })
    }
    merged.nik = cleanNik(merged.nik)
  }
  if (duplicateNik(merged.nik, merged.periodId || 1, req.params.id)) {
    return res.status(409).json({ error: 'NIK sudah tercatat pada periode yang sama' })
  }
  store.mustahik[index] = merged
  persistMustahik(store.mustahik[index])
  logAudit(req, 'Ubah mustahik', merged.id + ' ' + merged.fullName, 'NIK ' + merged.nik)
  res.json({ data: store.mustahik[index] })
})

router.delete('/:id', requireRoles('bendahara'), (req, res) => {
  const index = store.mustahik.findIndex((row) => row.id === req.params.id)
  if (index < 0) return res.status(404).json({ error: 'Mustahik not found' })
  const removed = store.mustahik[index]
  store.mustahik.splice(index, 1)
  deleteMustahik(req.params.id)
  logAudit(req, 'Hapus mustahik', removed.id + ' ' + removed.fullName, 'NIK ' + removed.nik)
  res.json({ data: true })
})

module.exports = router
