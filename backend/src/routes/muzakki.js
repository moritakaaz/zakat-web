const express = require('express')
const { store } = require('../store')

const router = express.Router()

function listHandler(key) {
  return (req, res) => {
    res.json({ data: store[key], total: store[key].length })
  }
}

function createHandler(key, prefix) {
  return (req, res) => {
    const item = { id: prefix + String(store[key].length + 1).padStart(2, '0'), ...req.body }
    store[key].push(item)
    res.status(201).json({ data: item })
  }
}

router.get('/', listHandler('muzakki'))
router.post('/', createHandler('muzakki', 'MZ'))

module.exports = router
