const express = require('express')
const cors = require('cors')
const { checkConnection } = require('./config/db')
const { store, evaluateAll } = require('./store')
const { initFromDatabase } = require('./db/load')
const { requireAuth } = require('./auth/auth')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', async (req, res) => {
  const db = await checkConnection()
  res.json({ status: 'ok', database: db, dbMode: store.dbMode })
})

app.get('/api/dashboard', requireAuth, (req, res) => {
  const periodId = req.query.periodId ? Number(req.query.periodId) : null
  const mustahik = periodId ? store.mustahik.filter((row) => Number(row.periodId || 1) === periodId) : store.mustahik
  const receipts = periodId ? store.receipts.filter((row) => Number(row.periodId || 1) === periodId) : store.receipts
  const distributions = periodId ? store.distributions.filter((row) => Number(row.periodId || 1) === periodId) : store.distributions
  const moneyIn = receipts.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const moneyOut = distributions.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = receipts.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const riceOut = distributions.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const summary = evaluateAll(periodId).summary
  res.json({
    data: {
      totalMustahik: mustahik.length,
      totalMuzakki: receipts.length,
      moneyIn,
      moneyOut,
      balance: moneyIn - moneyOut,
      riceIn,
      riceOut,
      riceBalance: riceIn - riceOut,
      summary
    }
  })
})

app.use('/api/users', require('./routes/users'))
app.use('/api', requireAuth)
app.use('/api/mustahik', require('./routes/mustahik'))
app.use('/api/muzakki', require('./routes/muzakki'))
app.use('/api/receipts', require('./routes/receipts'))
app.use('/api/distributions', require('./routes/distributions'))
app.use('/api/rules', require('./routes/rules'))
app.use('/api/periods', require('./routes/periods'))
app.use('/api/approvals', require('./routes/approvals'))
app.use('/api/audit-log', require('./routes/auditLog'))

const port = Number(process.env.PORT || 3001)
if (require.main === module) {
  initFromDatabase().then(() => {
    app.listen(port, () => {
      console.log('Zakat backend listening on port ' + port)
    })
  })
}

module.exports = app
