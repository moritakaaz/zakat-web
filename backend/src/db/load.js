const { getPool, checkConnection } = require('../config/db')
const { store } = require('../store')

function toMustahik(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    nik: row.nik || '',
    address: row.address,
    occupation: row.occupation,
    monthlyIncome: row.monthly_income,
    dependents: row.dependents,
    schoolChildren: row.school_children,
    houseCondition: row.house_condition,
    specialStatus: row.special_status,
    asnaf: row.asnaf,
    documentStatus: row.document_status,
    periodId: row.period_id,
    expectedResult: row.expected_result || null
  }
}

// Try to load the working data from MySQL. When the database is
// not configured or not reachable, the in-memory seed data stays
// in place and the store keeps running in memory mode. When the
// database is reachable, its rows replace the seed even when a
// table is empty, so an empty database shows no data.
async function initFromDatabase() {
  const status = await checkConnection()
  if (!status.connected) {
    store.dbMode = 'memory'
    store.dbStatus = status
    return status
  }
  const pool = getPool()
  try {
    const [users] = await pool.query('SELECT id, name, email, password, role FROM users')
    const [periods] = await pool.query('SELECT id, period_name, start_date, end_date, status FROM periods ORDER BY id')
    const [mustahik] = await pool.query('SELECT * FROM mustahik ORDER BY id')
    const [receipts] = await pool.query('SELECT * FROM zakat_receipts ORDER BY id')
    const [distributions] = await pool.query('SELECT * FROM zakat_distributions ORDER BY id')
    const [approvals] = await pool.query('SELECT period_id, status, approver_id, approver_name, note, decided_at FROM approvals ORDER BY period_id')
    const [muzakki] = await pool.query('SELECT id, full_name, address, zakat_type, amount, period_id FROM muzakki ORDER BY id')
    const [rules] = await pool.query('SELECT rule_code, condition_text, result_text, execution_order, is_active, thresholds, source FROM rules ORDER BY execution_order, rule_code')
    store.users = users.map((row) => ({ id: row.id, name: row.name, email: row.email, role: row.role, passwordHash: row.password }))
    store.periods = periods.map((row) => ({ id: row.id, periodName: row.period_name, startDate: row.start_date, endDate: row.end_date, status: row.status }))
    store.mustahik = mustahik.map(toMustahik)
    store.receipts = receipts.map((row) => ({ id: 'RC' + String(row.id).padStart(2, '0'), periodId: 1, muzakkiId: row.muzakki_id, zakatType: row.zakat_type, quantityKg: row.amount_rice_kg, amountMoney: row.amount_money, date: row.received_date, recordedBy: row.recorded_by }))
    store.distributions = distributions.map((row) => ({ id: 'DS' + String(row.id).padStart(2, '0'), periodId: 1, mustahikId: row.mustahik_id, priority: row.priority, form: row.distribution_type, quantityKg: row.amount_rice_kg, amountMoney: row.amount_money, date: row.distribution_date, recordedBy: row.recorded_by }))
    store.approvals = approvals.map((row) => ({ periodId: row.period_id, status: row.status, approverId: row.approver_id, approverName: row.approver_name, note: row.note || '', decidedAt: row.decided_at ? new Date(row.decided_at).toISOString() : null }))
    store.muzakki = muzakki.map((row) => ({ id: row.id, fullName: row.full_name, address: row.address, zakatType: row.zakat_type, amount: row.amount, periodId: row.period_id }))
    store.rules = rules.map((row) => {
      let thresholds = {}
      try { thresholds = row.thresholds ? JSON.parse(row.thresholds) : {} } catch (error) { thresholds = {} }
      return { code: row.rule_code, order: row.execution_order, condition: row.condition_text, result: row.result_text, source: row.source || '', isActive: row.is_active !== 0, ...thresholds }
    })
    store.dbMode = 'mysql'
    store.dbStatus = { connected: true }
    return store.dbStatus
  } catch (error) {
    store.dbMode = 'memory'
    store.dbStatus = { connected: false, reason: error.message }
    return store.dbStatus
  }
}

module.exports = { initFromDatabase }
