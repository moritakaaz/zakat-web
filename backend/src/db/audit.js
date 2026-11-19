const { store } = require('../store')
const { persistAuditLog } = require('./persist')

// Records who changed what and when. The in-memory list answers
// reads until the next load, the MySQL row is the archive.
function logAudit(req, action, target, detail) {
  const user = (req && req.user) || {}
  const entry = {
    id: store.auditLog.reduce((max, row) => Math.max(max, Number(row.id) || 0), 0) + 1,
    actorName: user.name || '',
    actorRole: user.role || '',
    action,
    target,
    detail: detail || '',
    createdAt: new Date().toISOString()
  }
  store.auditLog.unshift(entry)
  if (store.auditLog.length > 500) store.auditLog.length = 500
  persistAuditLog(entry)
  return entry
}

module.exports = { logAudit }
