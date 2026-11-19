const express = require('express')
const { store, evaluateAll } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistDistribution, updateDistribution } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()

function periodRows(rows, periodId) {
  return rows.filter((row) => Number(row.periodId || 1) === Number(periodId))
}

function priorityError(mustahikId) {
  if (!mustahikId) return null
  const mustahik = store.mustahik.find((row) => row.id === mustahikId)
  if (!mustahik) return 'Mustahik tidak ditemukan'
  const found = evaluateAll(Number(mustahik.periodId || 1)).evaluations.find((row) => row.id === mustahikId)
  const result = found ? found.result : ''
  if (result !== 'Prioritas 1' && result !== 'Prioritas 2' && result !== 'Prioritas 3') {
    return mustahik.fullName + ' berstatus ' + result + ', bukan prioritas penyaluran'
  }
  return null
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
  if (!body.mustahikId && !body.groupName) {
    return res.status(400).json({ error: 'Pilih mustahik atau isi kelompok penerima terlebih dahulu' })
  }
  const mustahik = store.mustahik.find((row) => row.id === body.mustahikId)
  const periodId = Number(body.periodId || (mustahik && mustahik.periodId) || 1)
  const priorityProblem = priorityError(body.mustahikId)
  if (priorityProblem) return res.status(400).json({ error: priorityProblem })
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
  const item = { ...body, periodId, id: 'DS' + String(next).padStart(2, '0'), mustahikId: body.mustahikId || null, groupName: body.groupName || '', name: body.name || body.groupName || (mustahik && mustahik.fullName) || '', zakatType: body.zakatType || '', priority: body.priority || '', form: body.form || 'Uang' }
  store.distributions.push(item)
  persistDistribution(item)
  logAudit(req, 'Catat penyaluran', item.id + ' ' + (item.name || ''), (item.zakatType || '') + ' ' + (item.form || '') + ' ' + (item.amountMoney ? 'Rp ' + item.amountMoney : '') + (item.quantityKg ? item.quantityKg + ' kg' : ''))
  res.status(201).json({ data: item })
})

router.put('/:id', requireRoles('bendahara'), (req, res) => {
  const item = store.distributions.find((row) => row.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Penyaluran tidak ditemukan' })
  const body = req.body || {}
  const mustahikId = body.mustahikId === undefined ? item.mustahikId : (body.mustahikId || null)
  const groupName = body.groupName === undefined ? item.groupName : String(body.groupName || '').trim()
  if (!mustahikId && !groupName) {
    return res.status(400).json({ error: 'Pilih mustahik atau isi kelompok penerima terlebih dahulu' })
  }
  const periodId = Number(item.periodId || 1)
  const priorityProblem = priorityError(mustahikId)
  if (priorityProblem) return res.status(400).json({ error: priorityProblem })
  const approval = store.approvals.find((row) => row.periodId === periodId)
  if (!approval || approval.status !== 'approved') {
    return res.status(400).json({ error: 'Hasil prioritas periode ini belum disetujui Kepala TPQ, penyaluran belum dapat dicatat' })
  }
  const money = body.amountMoney === undefined ? item.amountMoney : Number(body.amountMoney || 0)
  const rice = body.quantityKg === undefined ? item.quantityKg : Number(body.quantityKg || 0)
  if (money < 0 || rice < 0) return res.status(400).json({ error: 'Jumlah tidak boleh negatif' })
  if (money === 0 && rice === 0) return res.status(400).json({ error: 'Isi nilai uang atau jumlah beras terlebih dahulu' })
  const moneyIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const moneyOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0) - (item.amountMoney || 0)
  const riceIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const riceOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0) - (item.quantityKg || 0)
  if (money > moneyIn - moneyOut) {
    return res.status(400).json({ error: 'Jumlah uang melebihi sisa saldo Rp ' + (moneyIn - moneyOut).toLocaleString('id-ID') })
  }
  if (rice > riceIn - riceOut) {
    return res.status(400).json({ error: 'Jumlah beras melebihi sisa beras ' + (riceIn - riceOut) + ' kg' })
  }
  const mustahik = mustahikId ? store.mustahik.find((row) => row.id === mustahikId) : null
  const found = mustahikId ? evaluateAll(Number(mustahik.periodId || 1)).evaluations.find((row) => row.id === mustahikId) : null
  item.mustahikId = mustahikId
  item.groupName = mustahik ? '' : groupName
  item.name = mustahik ? mustahik.fullName : groupName
  item.zakatType = body.zakatType === undefined ? item.zakatType : body.zakatType
  item.priority = found ? found.result : (body.priority === undefined ? item.priority : body.priority)
  item.form = body.form === undefined ? item.form : body.form
  item.quantityKg = rice
  item.amountMoney = money
  item.date = body.date === undefined ? item.date : body.date
  updateDistribution(item)
  logAudit(req, 'Ubah penyaluran', item.id + ' ' + (item.name || ''), (item.zakatType || '') + ' ' + (item.form || '') + ' ' + (money ? 'Rp ' + money : '') + (rice ? rice + ' kg' : ''))
  res.json({ data: item })
})

module.exports = router
