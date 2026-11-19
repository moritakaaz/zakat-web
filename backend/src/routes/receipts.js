const express = require('express')
const { store } = require('../store')
const { requireRoles } = require('../auth/auth')
const { persistReceipt, updateReceipt } = require('../db/persist')
const { logAudit } = require('../db/audit')

const router = express.Router()

function periodRows(rows, periodId) {
  return rows.filter((row) => Number(row.periodId || 1) === Number(periodId))
}

function formFromAmounts(money, rice) {
  if (money > 0 && rice > 0) return 'Uang dan Beras'
  if (rice > 0) return 'Beras'
  if (money > 0) return 'Uang'
  return ''
}

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
  logAudit(req, 'Catat penerimaan', item.id + ' ' + (item.zakatType || ''), (item.name || '') + ' ' + (item.form || '') + ' ' + (item.amountMoney ? 'Rp ' + item.amountMoney : '') + (item.quantityKg ? item.quantityKg + ' kg' : ''))
  res.status(201).json({ data: item })
})

router.put('/:id', requireRoles('bendahara', 'sekretaris'), (req, res) => {
  const item = store.receipts.find((row) => row.id === req.params.id)
  if (!item) return res.status(404).json({ error: 'Penerimaan tidak ditemukan' })
  const body = req.body || {}
  const money = body.amountMoney === undefined ? item.amountMoney : Number(body.amountMoney || 0)
  const rice = body.quantityKg === undefined ? item.quantityKg : Number(body.quantityKg || 0)
  if (money < 0 || rice < 0) return res.status(400).json({ error: 'Jumlah tidak boleh negatif' })
  if (money === 0 && rice === 0) return res.status(400).json({ error: 'Isi nilai uang atau jumlah beras terlebih dahulu' })
  const periodId = Number(item.periodId || 1)
  const moneyIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const moneyOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = periodRows(store.receipts, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const riceOut = periodRows(store.distributions, periodId).reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  if (moneyIn - (item.amountMoney || 0) + money - moneyOut < 0) {
    return res.status(400).json({ error: 'Perubahan ini membuat saldo uang menjadi negatif' })
  }
  if (riceIn - (item.quantityKg || 0) + rice - riceOut < 0) {
    return res.status(400).json({ error: 'Perubahan ini membuat sisa beras menjadi negatif' })
  }
  if (body.muzakkiId !== undefined) {
    item.muzakkiId = body.muzakkiId || null
    const muzakki = store.muzakki.find((row) => row.id === item.muzakkiId)
    item.name = muzakki ? muzakki.fullName : (body.name || item.name || '')
  }
  if (body.zakatType !== undefined) item.zakatType = body.zakatType
  if (body.date !== undefined) item.date = body.date
  item.amountMoney = money
  item.quantityKg = rice
  item.form = formFromAmounts(money, rice)
  updateReceipt(item)
  logAudit(req, 'Ubah penerimaan', item.id + ' ' + (item.zakatType || ''), (item.name || '') + ' ' + item.form + ' ' + (money ? 'Rp ' + money : '') + (rice ? rice + ' kg' : ''))
  res.json({ data: item })
})

module.exports = router
