const express = require('express')
const cors = require('cors')
const { checkConnection } = require('./config/db')
const { store, evaluateAll } = require('./store')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', async (req, res) => {
  const db = await checkConnection()
  res.json({ status: 'ok', database: db })
})

app.get('/api/dashboard', (req, res) => {
  const moneyIn = store.receipts.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const moneyOut = store.distributions.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
  const riceIn = store.receipts.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const riceOut = store.distributions.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
  const summary = evaluateAll().summary
  res.json({
    data: {
      totalMustahik: store.mustahik.length,
      totalMuzakki: store.receipts.length,
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
app.use('/api/mustahik', require('./routes/mustahik'))
app.use('/api/muzakki', require('./routes/muzakki'))
app.use('/api/receipts', require('./routes/receipts'))
app.use('/api/distributions', require('./routes/distributions'))
app.use('/api/rules', require('./routes/rules'))
app.use('/api/periods', require('./routes/periods'))

const port = Number(process.env.PORT || 3001)
if (require.main === module) {
  app.listen(port, () => {
    console.log('Zakat backend listening on port ' + port)
  })
}

module.exports = app
