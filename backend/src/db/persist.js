const { getPool } = require('../config/db')
const { store } = require('../store')

// Best effort write through to MySQL. A failed write never breaks
// the API response, the in-memory store stays the source of truth
// until the next successful load from the database.
async function run(sql, params) {
  if (store.dbMode !== 'mysql') return false
  try {
    const pool = getPool()
    if (!pool) return false
    await pool.execute(sql, params)
    return true
  } catch (error) {
    console.log('MySQL write skipped, ' + error.message)
    return false
  }
}

function persistMustahik(item) {
  return run(
    'INSERT INTO mustahik (id, full_name, nik, address, occupation, monthly_income, dependents, school_children, house_condition, special_status, asnaf, document_status, period_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), nik = VALUES(nik), address = VALUES(address), occupation = VALUES(occupation), monthly_income = VALUES(monthly_income), dependents = VALUES(dependents), school_children = VALUES(school_children), house_condition = VALUES(house_condition), special_status = VALUES(special_status), asnaf = VALUES(asnaf), document_status = VALUES(document_status), period_id = VALUES(period_id)',
    [item.id, item.fullName, item.nik || '', item.address, item.occupation, item.monthlyIncome || 0, item.dependents || 0, item.schoolChildren || 0, item.houseCondition, item.specialStatus, item.asnaf, item.documentStatus, item.periodId || 1]
  )
}

function deleteMustahik(id) {
  return run('DELETE FROM mustahik WHERE id = ?', [id])
}

function persistReceipt(item) {
  return run(
    'INSERT INTO zakat_receipts (muzakki_id, zakat_type, amount_rice_kg, amount_money, received_date, recorded_by) VALUES (?, ?, ?, ?, ?, ?)',
    [item.muzakkiId || null, item.zakatType, item.quantityKg || 0, item.amountMoney || 0, item.date || new Date().toISOString().slice(0, 10), item.recordedBy || 'Bendahara']
  )
}

function persistDistribution(item) {
  return run(
    'INSERT INTO zakat_distributions (mustahik_id, priority, distribution_type, amount_rice_kg, amount_money, distribution_date, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [item.mustahikId || item.id, item.priority || '', item.form || item.distributionType || 'Uang', item.quantityKg || 0, item.amountMoney || 0, item.date || new Date().toISOString().slice(0, 10), item.recordedBy || 'Bendahara']
  )
}

function persistApproval(approval) {
  return run(
    'INSERT INTO approvals (period_id, status, approver_id, approver_name, note, decided_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), approver_id = VALUES(approver_id), approver_name = VALUES(approver_name), note = VALUES(note), decided_at = VALUES(decided_at)',
    [approval.periodId, approval.status, approval.approverId, approval.approverName, approval.note || '', approval.decidedAt ? new Date(approval.decidedAt).toISOString().slice(0, 19).replace('T', ' ') : null]
  )
}

module.exports = { persistMustahik, deleteMustahik, persistReceipt, persistDistribution, persistApproval }
