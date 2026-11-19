const express = require('express')
const { store, evaluateAll } = require('../store')
const rules = require('../data/rules')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: rules })
})

router.post('/evaluate', (req, res) => {
  const result = evaluateAll()
  res.json(result)
})

router.post('/evaluate-one', (req, res) => {
  const { evaluateMustahik } = require('../engine/ruleEngine')
  const niks = store.mustahik.map((item) => item.nik)
  const evaluation = evaluateMustahik(req.body || {}, niks)
  res.json({ data: evaluation })
})

module.exports = router
