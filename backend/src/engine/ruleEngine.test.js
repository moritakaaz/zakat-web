const assert = require('assert')
const { evaluateMustahik, rankResults, summarize } = require('./ruleEngine')

// Small fixtures defined here only. No data file is imported.
const rules = [
  { code: 'R10', order: 1, condition: 'Dokumen tidak lengkap', result: 'Pending Verifikasi', isActive: true },
  { code: 'R11', order: 1, condition: 'NIK ganda', result: 'Duplikat', isActive: true },
  { code: 'R09', order: 2, condition: 'Pendapatan di atas ambang', result: 'Tidak Layak', isActive: true, incomeLimit: 2500000 },
  { code: 'R01a', order: 3, condition: 'Pendapatan rendah', result: 'Prioritas 1', isActive: true, incomeLimit: 1500000 },
  { code: 'R01b', order: 3, condition: 'Pendapatan menengah', result: 'Prioritas 2', isActive: true, incomeMin: 1500000, incomeLimit: 2000000 },
  { code: 'R01c', order: 3, condition: 'Pendapatan atas', result: 'Prioritas 3', isActive: true, incomeMin: 2000001, incomeLimit: 2500000 },
  { code: 'R02', order: 4, condition: 'Per kapita rendah', result: 'Naik ke Prioritas 1', isActive: true, perCapitaLimit: 300000 },
  { code: 'R03', order: 4, condition: 'Tanggungan berat', result: 'Tanggungan berat', isActive: true, dependentsMin: 4, incomeLimit: 2000000 },
  { code: 'R04', order: 4, condition: 'Guru honorer', result: 'Prioritas 1', isActive: true, honorMin: 300000, honorMax: 600000 },
  { code: 'R05', order: 4, condition: 'Wali santri', result: 'Wali santri', isActive: true, incomeLimit: 2500000 },
  { code: 'R06', order: 5, condition: 'Kelompok rentan', result: 'Kelompok rentan', isActive: true, incomeLimit: 2000000 },
  { code: 'R07', order: 5, condition: 'Rumah kontrak', result: 'Rumah kontrak', isActive: true },
  { code: 'R08', order: 5, condition: 'Beban pendidikan', result: 'Beban pendidikan', isActive: true, schoolMin: 3, incomeLimit: 2000000 },
  { code: 'R12', order: 6, condition: 'Dana terbatas', result: 'Salurkan berurutan', isActive: true }
]

function household(id, patch) {
  return {
    id,
    fullName: 'Keluarga ' + id,
    nik: 'NIK-' + id,
    address: 'Warakas',
    occupation: 'Buruh',
    monthlyIncome: 1000000,
    dependents: 2,
    schoolChildren: 1,
    houseCondition: 'Milik Sendiri',
    specialStatus: '-',
    asnaf: 'Miskin',
    documentStatus: 'Lengkap',
    periodId: 1,
    ...patch
  }
}

const mustahik = [
  household('T01', { monthlyIncome: 0, dependents: 5 }),
  household('T02', { monthlyIncome: 1000000, dependents: 2 }),
  household('T03', { monthlyIncome: 1700000, dependents: 2 }),
  household('T04', { monthlyIncome: 1700000, dependents: 6 }),
  household('T05', { monthlyIncome: 2200000, dependents: 2 }),
  household('T06', { monthlyIncome: 1200000, dependents: 3, documentStatus: 'KTP saja' }),
  household('T07', { monthlyIncome: 1000000, dependents: 3 }),
  household('T08', { monthlyIncome: 3000000, dependents: 2 }),
  household('T09', { monthlyIncome: 500000, dependents: 2, occupation: 'Guru Honorer TPQ' })
]

const expected = {
  T01: 'Prioritas 1',
  T02: 'Prioritas 1',
  T03: 'Prioritas 2',
  T04: 'Prioritas 1',
  T05: 'Prioritas 3',
  T06: 'Pending Verifikasi',
  T07: 'Prioritas 1',
  T08: 'Tidak Layak',
  T09: 'Prioritas 1'
}

const niks = mustahik.map((item) => item.nik)
const evaluations = rankResults(mustahik.map((item) => evaluateMustahik(item, niks, rules)))
const summary = summarize(evaluations)

assert.strictEqual(evaluations.length, 9)
for (const item of evaluations) {
  assert.strictEqual(item.result, expected[item.id], item.id + ' expected ' + expected[item.id] + ' got ' + item.result)
}
assert.deepStrictEqual(summary, {
  'Prioritas 1': 5,
  'Prioritas 2': 1,
  'Prioritas 3': 1,
  'Pending Verifikasi': 1,
  Duplikat: 0,
  'Tidak Layak': 1
})

const teacher = evaluations.find((item) => item.id === 'T09')
assert.ok(teacher.firedRules.includes('R04'))
const upgraded = evaluations.find((item) => item.id === 'T04')
assert.ok(upgraded.firedRules.includes('R02'))
assert.ok(upgraded.trace.length >= 5)

// A NIK that appears twice flags both households as Duplikat.
const pair = [
  household('KA01', { monthlyIncome: 1000000, nik: 'NIK-SAMA' }),
  household('KA02', { monthlyIncome: 1000000, nik: 'NIK-SAMA' })
]
const pairNiks = pair.map((item) => item.nik)
assert.strictEqual(evaluateMustahik(pair[0], pairNiks, rules).result, 'Duplikat')
assert.strictEqual(evaluateMustahik(pair[1], pairNiks, rules).result, 'Duplikat')

// The same NIK written with spaces still counts as one NIK.
const spaced = [
  household('KA03', { monthlyIncome: 1000000, nik: '3172010101010001' }),
  household('KA04', { monthlyIncome: 1000000, nik: '3172 0101 0101 0001' })
]
const spacedNiks = spaced.map((item) => item.nik)
assert.strictEqual(evaluateMustahik(spaced[0], spacedNiks, rules).result, 'Duplikat')
assert.strictEqual(evaluateMustahik(spaced[1], spacedNiks, rules).result, 'Duplikat')

// Status and occupation match whole tokens only, never substrings.
const tricky = household('TB01', { monthlyIncome: 1000000, dependents: 2, specialStatus: 'Bukan Janda' })
assert.ok(!evaluateMustahik(tricky, [tricky.nik], rules).firedRules.includes('R06'))
const richWidow = household('TB02', { monthlyIncome: 1000000, dependents: 2, specialStatus: 'Janda Tapi Kaya sebenarnya' })
assert.ok(!evaluateMustahik(richWidow, [richWidow.nik], rules).firedRules.includes('R06'))
const formerTeacher = household('TB03', { monthlyIncome: 500000, dependents: 2, occupation: 'Mantan Guru Honorer TPQ' })
assert.ok(!evaluateMustahik(formerTeacher, [formerTeacher.nik], rules).firedRules.includes('R04'))
const realWidow = household('TB04', { monthlyIncome: 1000000, dependents: 2, specialStatus: 'Janda, Wali Santri' })
const realWidowEval = evaluateMustahik(realWidow, [realWidow.nik], rules)
assert.ok(realWidowEval.firedRules.includes('R06'))
assert.ok(realWidowEval.firedRules.includes('R05'))

// R09 has no dependents exception. Income above the limit is not layak.
const bigFamily = household('TB05', { monthlyIncome: 3000000, dependents: 6 })
assert.strictEqual(evaluateMustahik(bigFamily, [bigFamily.nik], rules).result, 'Tidak Layak')

// A fully evaluated household shows every rule in the trace, including
// all three income bands and the R12 ranking note.
const full = evaluateMustahik(household('T02', { monthlyIncome: 1000000, dependents: 2 }), ['NIK-T02'], rules)
assert.strictEqual(full.trace.length, 14)
assert.ok(full.trace.some((step) => step.code === 'R01b' && step.fired === false))
assert.ok(full.trace.some((step) => step.code === 'R01c' && step.fired === false))
assert.ok(full.trace.some((step) => step.code === 'R12' && step.fired === null))
// Trace notes state the actual fact.
assert.strictEqual(full.trace.find((step) => step.code === 'R10').note, 'Dokumen lengkap')

// With no rules loaded, no rule fires and no threshold is invented.
const noRules = evaluateMustahik(household('KK99', { monthlyIncome: 100 }), ['NIK-KK99'], [])
assert.strictEqual(noRules.result, 'Tidak Layak')
assert.strictEqual(noRules.trace.length, 0)
assert.strictEqual(noRules.firedRules.length, 0)

console.log('Rule engine test passed')
console.log(summary)
