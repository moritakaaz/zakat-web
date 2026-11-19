// Forward chaining engine for mustahik priority.
// Facts enter, rules fire in order, new facts are added, inference stops
// when no new rule fires or a terminal result is reached.
// Every threshold comes from the rule records passed in, which come
// from MySQL. A missing rule never fires and a missing threshold never
// matches, so the engine never invents a result from numbers in code.
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

// Status khusus is stored as a comma separated list of fixed options.
// Match one whole token, never a substring, so "Bukan Janda" does not
// count as Janda and "Janda Tapi Kaya" does not count either.
function statusTokens(mustahik) {
  return String(mustahik.specialStatus || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean)
}

function hasStatus(mustahik, keyword) {
  return statusTokens(mustahik).includes(String(keyword).toLowerCase())
}

function isTeacher(mustahik) {
  return String(mustahik.occupation || '').trim().toLowerCase() === 'guru honorer tpq'
}

function normalizeNik(value) {
  return String(value || '').replace(/[\s-]/g, '')
}

function findRule(rules, code) {
  return (rules || []).find((item) => item.code === code)
}

function active(rules, code) {
  const rule = findRule(rules, code)
  return !!rule && rule.isActive !== false
}

function limit(rules, code, field) {
  const rule = findRule(rules, code)
  const value = rule ? rule[field] : undefined
  return typeof value === 'number' ? value : undefined
}

function moneyText(value) {
  return 'Rp ' + value.toLocaleString('id-ID')
}

function evaluateMustahik(mustahik, knownNiks, rules) {
  const config = Array.isArray(rules) ? rules : []
  const trace = []
  const notes = []
  const income = mustahik.monthlyIncome || 0
  const dependents = mustahik.dependents || 0
  const capita = perCapita(mustahik)
  let result = null
  let fired = []

  // The stored note always states the actual fact, so an unfired rule
  // never reads as if its condition were true.
  function check(code, firedNow, firedNote, unfiredNote) {
    const note = firedNow ? firedNote : unfiredNote
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
  if (active(config, 'R10') && check('R10', mustahik.documentStatus !== 'Lengkap', 'Dokumen belum lengkap', 'Dokumen lengkap')) {
    return finish('Pending Verifikasi')
  }

  // R11 guard, duplicate check.
  const nik = normalizeNik(mustahik.nik)
  const duplicate = nik !== '' && Array.isArray(knownNiks) && knownNiks.filter((n) => normalizeNik(n) === nik).length > 1
  if (active(config, 'R11') && check('R11', duplicate, 'NIK tercatat ganda pada periode ini', 'NIK tidak ganda')) {
    return finish('Duplikat')
  }

  // R09 upper threshold.
  const upper = limit(config, 'R09', 'incomeLimit')
  if (active(config, 'R09') && check('R09', upper !== undefined && income > upper, 'Pendapatan di atas ambang Warakas', 'Pendapatan ' + moneyText(income))) {
    return finish('Tidak Layak')
  }

  // R01a, R01b, R01c income bands. Every band is checked so the trace
  // shows all three, and the first matching band sets the base priority.
  const lowLimit = limit(config, 'R01a', 'incomeLimit')
  const midMin = limit(config, 'R01b', 'incomeMin')
  const midLimit = limit(config, 'R01b', 'incomeLimit')
  const highMin = limit(config, 'R01c', 'incomeMin')
  const highLimit = limit(config, 'R01c', 'incomeLimit')
  const bandA = active(config, 'R01a') && check('R01a', lowLimit !== undefined && income < lowLimit, lowLimit !== undefined ? 'Pendapatan kurang dari ' + moneyText(lowLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  const bandB = active(config, 'R01b') && check('R01b', midMin !== undefined && midLimit !== undefined && income >= midMin && income <= midLimit, midMin !== undefined && midLimit !== undefined ? 'Pendapatan ' + moneyText(midMin) + ' sampai ' + moneyText(midLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  const bandC = active(config, 'R01c') && check('R01c', highMin !== undefined && highLimit !== undefined && income >= highMin && income <= highLimit, highMin !== undefined && highLimit !== undefined ? 'Pendapatan ' + moneyText(highMin) + ' sampai ' + moneyText(highLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  if (bandA) result = 'Prioritas 1'
  else if (bandB) result = 'Prioritas 2'
  else if (bandC) result = 'Prioritas 3'

  // R02 per capita upgrade.
  const capitaLimit = limit(config, 'R02', 'perCapitaLimit')
  if (active(config, 'R02') && check('R02', capitaLimit !== undefined && capita <= capitaLimit, 'Pendapatan per kapita ' + moneyText(capita), 'Pendapatan per kapita ' + moneyText(capita) + ', di atas batas ' + (capitaLimit !== undefined ? moneyText(capitaLimit) : '-'))) {
    if (result === 'Prioritas 2' || result === 'Prioritas 3') result = 'Prioritas 1'
  }

  // R03 heavy dependents confirm.
  const dependentsMin = limit(config, 'R03', 'dependentsMin')
  const heavyLimit = limit(config, 'R03', 'incomeLimit')
  if (active(config, 'R03')) check('R03', dependentsMin !== undefined && heavyLimit !== undefined && dependents >= dependentsMin && income <= heavyLimit, 'Tanggungan berat', 'Tanggungan ' + dependents + ' jiwa')

  // R04 teacher rule raises to Prioritas 1.
  const honorMin = limit(config, 'R04', 'honorMin')
  const honorMax = limit(config, 'R04', 'honorMax')
  if (active(config, 'R04') && check('R04', honorMin !== undefined && honorMax !== undefined && isTeacher(mustahik) && income >= honorMin && income <= honorMax, 'Guru honorer TPQ', 'Pekerjaan ' + (mustahik.occupation || '-'))) {
    result = 'Prioritas 1'
  }

  // R05 wali santri confirm.
  const waliLimit = limit(config, 'R05', 'incomeLimit')
  if (active(config, 'R05')) check('R05', waliLimit !== undefined && hasStatus(mustahik, 'Wali Santri') && income < waliLimit, 'Wali santri', 'Status khusus ' + (mustahik.specialStatus || '-'))

  // R06 vulnerable group confirm.
  const vulnerable = hasStatus(mustahik, 'Janda') || hasStatus(mustahik, 'Lansia') || hasStatus(mustahik, 'Yatim')
  const vulnerableLimit = limit(config, 'R06', 'incomeLimit')
  if (active(config, 'R06')) check('R06', vulnerableLimit !== undefined && vulnerable && income < vulnerableLimit, 'Kelompok rentan', 'Status khusus ' + (mustahik.specialStatus || '-'))

  // R07 house tie breaker.
  if (active(config, 'R07')) check('R07', mustahik.houseCondition === 'Kontrak' || mustahik.houseCondition === 'Menumpang', 'Rumah kontrak atau menumpang', 'Rumah ' + (mustahik.houseCondition || '-'))

  // R08 school burden tie breaker.
  const schoolMin = limit(config, 'R08', 'schoolMin')
  const schoolLimit = limit(config, 'R08', 'incomeLimit')
  if (active(config, 'R08')) check('R08', schoolMin !== undefined && schoolLimit !== undefined && (mustahik.schoolChildren || 0) >= schoolMin && income <= schoolLimit, 'Beban pendidikan tinggi', 'Anak sekolah ' + (mustahik.schoolChildren || 0) + ' orang')

  // R12 is a ranking rule, not a per household condition. It is listed
  // in the trace as information with no fired state.
  if (active(config, 'R12')) trace.push({ code: 'R12', fired: null, note: 'Penyaluran diurutkan Prioritas 1, lalu 2, lalu 3 bila dana kurang' })

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

module.exports = { evaluateMustahik, rankResults, summarize, perCapita }
