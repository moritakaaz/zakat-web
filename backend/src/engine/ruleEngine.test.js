const assert = require('assert')
const mustahik = require('../data/mustahik')
const { evaluateMustahik, rankResults, summarize } = require('./ruleEngine')

const niks = mustahik.map((item) => item.nik)
const evaluations = rankResults(mustahik.map((item) => evaluateMustahik(item, niks)))
const summary = summarize(evaluations)

for (const item of evaluations) {
  const source = mustahik.find((row) => row.id === item.id)
  assert.strictEqual(item.result, source.expectedResult, item.id + ' expected ' + source.expectedResult + ' got ' + item.result)
}

assert.strictEqual(evaluations.length, 30)
assert.deepStrictEqual(summary, {
  'Prioritas 1': 15,
  'Prioritas 2': 6,
  'Prioritas 3': 5,
  'Pending Verifikasi': 1,
  Duplikat: 0,
  'Tidak Layak': 3
})

const ahmad = evaluations.find((item) => item.id === 'KK08')
assert.ok(ahmad.firedRules.includes('R01a'))
assert.ok(ahmad.firedRules.includes('R02'))
assert.ok(ahmad.trace.length >= 5)

console.log('Rule engine test passed')
console.log(summary)
