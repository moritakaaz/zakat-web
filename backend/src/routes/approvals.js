const express = require('express')
const { store } = require('../store')
const { requireRole } = require('../auth/auth')
const { persistApproval } = require('../db/persist')

const router = express.Router()

function findApproval(periodId) {
  return store.approvals.find((item) => item.periodId === periodId)
}

router.get('/', (req, res) => {
  res.json({ data: store.approvals })
})

router.get('/:periodId', (req, res) => {
  const approval = findApproval(Number(req.params.periodId))
  if (!approval) return res.status(404).json({ error: 'Approval not found' })
  res.json({ data: approval })
})

// Only Kepala TPQ decides. The decision, approver, time and note
// are stored so the result cannot change without a trace.
function decide(status) {
  return (req, res) => {
    const periodId = Number(req.params.periodId)
    const approval = findApproval(periodId)
    if (!approval) return res.status(404).json({ error: 'Approval not found' })
    approval.status = status
    approval.approverId = req.user.id
    approval.approverName = req.user.name
    approval.note = String((req.body || {}).note || '')
    approval.decidedAt = new Date().toISOString()
    persistApproval(approval)
    res.json({ data: approval })
  }
}

router.post('/:periodId/approve', requireRole('kepala'), decide('approved'))
router.post('/:periodId/reject', requireRole('kepala'), decide('rejected'))

module.exports = router
