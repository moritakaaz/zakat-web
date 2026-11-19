const express = require('express')
const { store } = require('../store')

const router = express.Router()

router.get('/', (req, res) => {
  res.json({ data: store.auditLog })
})

module.exports = router
