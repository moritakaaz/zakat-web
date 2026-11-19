// Forward chaining engine for mustahik priority.
// Facts enter, rules fire in order, new facts are added, inference stops
// when no new rule fires or a terminal result is reached.
// Thresholds come from the rule records passed in, with the default
// knowledge base as fallback, so editing a rule changes the result
// without editing this file.
const defaultRules = require('../data/rules')

const PRIORITY_RANK = {
  'Prioritas 1': 1,
  'Prioritas 2': 2,
  'Prioritas 3': 3,
  'Pending Verifikasi': 4,
  'Duplikat': 4,
  'Tidak Layak': 5
}

function perCapita(mustahik) {
  if (!mustahik.dependents || mustahik.dependents <= 0) {
    return mustahik.monthlyIncome
  }
  return Math.floor(mustahik.monthlyIncome / mustahik.dependents)
}

function hasStatus(mustahik, keyword) {
  return (mustahik.specialStatus || '').includes(keyword)
}

function isTeacher(mustahik) {
  return (mustahik.occupation || '').includes('Guru Honorer TPQ')
}

function findRule(rules, code) {
  return (rules || []).find((item) => item.code === code) || {}
}

function active(rules, code) {
  const rule = findRule(rules, code)
  return rule.isActive !== false
}

function limit(rules, code, field, fallback) {
  const value = findRule(rules, code)[field]
  return typeof value === 'number' ? value : fallback
}

function evaluateMustahik(mustahik, knownNiks, rules) {
  const config = Array.isArray(rules) && rules.length ? rules : defaultRules
  const trace = []
  const notes = []
  const income = mustahik.monthlyIncome || 0
  const dependents = mustahik.dependents || 0
  const capita = perCapita(mustahik)
  let result = null
  let fired = []

  function check(code, firedNow, note) {
    trace.push({ code, fired: firedNow, note })
    if (firedNow) {
      fired.push(code)
      if (note) notes.push(note)
    }
    return firedNow
  }

  function finish(finalResult) {
    return {
      id: mustahik.id,
      fullName: mustahik.fullName,
      result: finalResult,
      rank: PRIORITY_RANK[finalResult] || 5,
      perCapita: capita,
      firedRules: fired,
      trace,
      notes
    }
  }

  // R10 guard, document first.
  if (active(config, 'R10') && check('R10', mustahik.documentStatus !== 'Lengkap', 'Dokumen belum lengkap')) {
    return finish('Pending Verifikasi')
  }

  // R11 guard, duplicate check.
  const duplicate = Array.isArray(knownNiks) && knownNiks.filter((n) => n === mustahik.nik).length > 1
  if (active(config, 'R11') && check('R11', duplicate, 'NIK atau nomor KK tercatat ganda')) {
    return finish('Duplikat')
  }

  // R09 upper threshold.
  const specialCase = dependents >= 6
  if (active(config, 'R09') && check('R09', income > limit(config, 'R09', 'incomeLimit', 2500000) && !specialCase, 'Pendapatan di atas ambang Warakas')) {
    return finish('Tidak Layak')
  }

  // R01a, R01b, R01c income bands set the base priority.
  if (active(config, 'R01a') && check('R01a', income < limit(config, 'R01a', 'incomeLimit', 1500000), 'Pendapatan kurang dari Rp 1.500.000')) {
    result = 'Prioritas 1'
  } else if (active(config, 'R01b') && check('R01b', income >= limit(config, 'R01b', 'incomeMin', 1500000) && income <= limit(config, 'R01b', 'incomeLimit', 2000000), 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000')) {
    result = 'Prioritas 2'
  } else if (active(config, 'R01c') && check('R01c', income > limit(config, 'R01c', 'incomeMin', 2000001) - 1 && income <= limit(config, 'R01c', 'incomeLimit', 2500000), 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000')) {
    result = 'Prioritas 3'
  }

  // R02 per capita upgrade.
  if (active(config, 'R02') && check('R02', capita <= limit(config, 'R02', 'perCapitaLimit', 300000), 'Pendapatan per kapita Rp ' + capita.toLocaleString('id-ID'))) {
    if (result === 'Prioritas 2' || result === 'Prioritas 3') result = 'Prioritas 1'
  }

  // R03 heavy dependents confirm.
  if (active(config, 'R03')) check('R03', dependents >= limit(config, 'R03', 'dependentsMin', 4) && income <= limit(config, 'R03', 'incomeLimit', 2000000), 'Tanggungan berat')

  // R04 teacher rule raises to Prioritas 1.
  if (active(config, 'R04') && check('R04', isTeacher(mustahik) && income >= limit(config, 'R04', 'honorMin', 300000) && income <= limit(config, 'R04', 'honorMax', 600000), 'Guru honorer TPQ')) {
    result = 'Prioritas 1'
  }

  // R05 wali santri confirm.
  if (active(config, 'R05')) check('R05', hasStatus(mustahik, 'Wali Santri') && income < limit(config, 'R05', 'incomeLimit', 2500000), 'Wali santri')

  // R06 vulnerable group confirm.
  const vulnerable = hasStatus(mustahik, 'Janda') || hasStatus(mustahik, 'Lansia') || hasStatus(mustahik, 'Yatim')
  if (active(config, 'R06')) check('R06', vulnerable && income < limit(config, 'R06', 'incomeLimit', 2000000), 'Kelompok rentan')

  // R07 house tie breaker.
  if (active(config, 'R07')) check('R07', mustahik.houseCondition === 'Kontrak' || mustahik.houseCondition === 'Menumpang', 'Rumah kontrak atau menumpang')

  // R08 school burden tie breaker.
  if (active(config, 'R08')) check('R08', (mustahik.schoolChildren || 0) >= limit(config, 'R08', 'schoolMin', 3) && income <= limit(config, 'R08', 'incomeLimit', 2000000), 'Beban pendidikan tinggi')

  if (!result) result = 'Tidak Layak'
  return finish(result)
}

// R12 ranking rule, applied after every household has a result.
function rankResults(evaluations) {
  return [...evaluations].sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    if (a.perCapita !== b.perCapita) return a.perCapita - b.perCapita
    return 0
  })
}

function summarize(evaluations) {
  const counts = { 'Prioritas 1': 0, 'Prioritas 2': 0, 'Prioritas 3': 0, 'Pending Verifikasi': 0, 'Duplikat': 0, 'Tidak Layak': 0 }
  for (const item of evaluations) {
    if (counts[item.result] !== undefined) counts[item.result] += 1
  }
  return counts
}

module.exports = { evaluateMustahik, rankResults, summarize, perCapita, rules: defaultRules }
