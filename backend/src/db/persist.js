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
    'INSERT INTO mustahik (id, full_name, nik, address, occupation, monthly_income, dependents, school_children, house_condition, special_status, asnaf, document_status, surveyed, period_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), nik = VALUES(nik), address = VALUES(address), occupation = VALUES(occupation), monthly_income = VALUES(monthly_income), dependents = VALUES(dependents), school_children = VALUES(school_children), house_condition = VALUES(house_condition), special_status = VALUES(special_status), asnaf = VALUES(asnaf), document_status = VALUES(document_status), surveyed = VALUES(surveyed), period_id = VALUES(period_id)',
    [item.id, item.fullName, item.nik || '', item.address, item.occupation, item.monthlyIncome || 0, item.dependents || 0, item.schoolChildren || 0, item.houseCondition, item.specialStatus, item.asnaf, item.documentStatus, item.surveyed ? 1 : 0, item.periodId || 1]
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
    'INSERT INTO zakat_distributions (mustahik_id, priority, distribution_type, zakat_type, group_name, amount_rice_kg, amount_money, distribution_date, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [item.mustahikId || null, item.priority || '', item.form || item.distributionType || 'Uang', item.zakatType || '', item.groupName || '', item.quantityKg || 0, item.amountMoney || 0, item.date || new Date().toISOString().slice(0, 10), item.recordedBy || 'Bendahara']
  )
}

function persistApproval(approval) {
  return run(
    'INSERT INTO approvals (period_id, status, approver_id, approver_name, note, decided_at) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), approver_id = VALUES(approver_id), approver_name = VALUES(approver_name), note = VALUES(note), decided_at = VALUES(decided_at)',
    [approval.periodId, approval.status, approval.approverId, approval.approverName, approval.note || '', approval.decidedAt ? new Date(approval.decidedAt).toISOString().slice(0, 19).replace('T', ' ') : null]
  )
}

function persistMuzakki(item) {
  return run(
    'INSERT INTO muzakki (id, full_name, address, zakat_type, period_id) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), address = VALUES(address), zakat_type = VALUES(zakat_type), period_id = VALUES(period_id)',
    [item.id, item.fullName, item.address || '', item.zakatType || '', item.periodId || 1]
  )
}

function deleteMuzakki(id) {
  return run('DELETE FROM muzakki WHERE id = ?', [id])
}

function persistPeriod(item) {
  return run(
    'INSERT INTO periods (id, period_name, start_date, end_date, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE period_name = VALUES(period_name), start_date = VALUES(start_date), end_date = VALUES(end_date), status = VALUES(status)',
    [item.id, item.periodName, item.startDate, item.endDate, item.status || 'active']
  )
}

function persistRule(rule) {
  const thresholds = {}
  for (const key of ['incomeMin', 'incomeLimit', 'perCapitaLimit', 'dependentsMin', 'honorMin', 'honorMax', 'schoolMin']) {
    if (typeof rule[key] === 'number') thresholds[key] = rule[key]
  }
  return run(
    'INSERT INTO rules (rule_code, condition_text, result_text, execution_order, is_active, thresholds, source) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE condition_text = VALUES(condition_text), result_text = VALUES(result_text), execution_order = VALUES(execution_order), is_active = VALUES(is_active), thresholds = VALUES(thresholds), source = VALUES(source)',
    [rule.code, rule.condition, rule.result, rule.order, rule.isActive ? 1 : 0, JSON.stringify(thresholds), rule.source || '']
  )
}

function persistUser(user) {
  return run(
    'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), email = VALUES(email), password = VALUES(password), role = VALUES(role), active = VALUES(active)',
    [user.id, user.name, user.email, user.passwordHash, user.role, user.active === false ? 0 : 1]
  )
}

function updateReceipt(item) {
  const id = Number(String(item.id).replace(/\D/g, '')) || 0
  return run(
    'UPDATE zakat_receipts SET muzakki_id = ?, zakat_type = ?, amount_rice_kg = ?, amount_money = ?, received_date = ?, recorded_by = ? WHERE id = ?',
    [item.muzakkiId || null, item.zakatType, item.quantityKg || 0, item.amountMoney || 0, item.date || new Date().toISOString().slice(0, 10), item.recordedBy || 'Bendahara', id]
  )
}

function updateDistribution(item) {
  const id = Number(String(item.id).replace(/\D/g, '')) || 0
  return run(
    'UPDATE zakat_distributions SET mustahik_id = ?, priority = ?, distribution_type = ?, zakat_type = ?, group_name = ?, amount_rice_kg = ?, amount_money = ?, distribution_date = ?, recorded_by = ? WHERE id = ?',
    [item.mustahikId || null, item.priority || '', item.form || item.distributionType || 'Uang', item.zakatType || '', item.groupName || '', item.quantityKg || 0, item.amountMoney || 0, item.date || new Date().toISOString().slice(0, 10), item.recordedBy || 'Bendahara', id]
  )
}

function persistAuditLog(entry) {
  return run(
    'INSERT INTO audit_log (actor_name, actor_role, action, target, detail) VALUES (?, ?, ?, ?, ?)',
    [entry.actorName || '', entry.actorRole || '', entry.action || '', entry.target || '', entry.detail || '']
  )
}

module.exports = { persistMustahik, deleteMustahik, persistReceipt, updateReceipt, persistDistribution, updateDistribution, persistApproval, persistMuzakki, deleteMuzakki, persistPeriod, persistRule, persistAuditLog, persistUser }
