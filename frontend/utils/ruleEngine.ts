import type { Mustahik } from '~/data/mustahik'

export interface TraceStep {
  code: string
  fired: boolean
  note: string
}

export interface Evaluation {
  id: string
  fullName: string
  result: string
  rank: number
  perCapita: number
  firedRules: string[]
  trace: TraceStep[]
  notes: string[]
}

export interface RuleConfig {
  code: string
  order: number
  condition: string
  result: string
  source: string
  isActive: boolean
  incomeMin?: number
  incomeLimit?: number
  perCapitaLimit?: number
  dependentsMin?: number
  honorMin?: number
  honorMax?: number
  schoolMin?: number
}

const PRIORITY_RANK: Record<string, number> = {
  'Prioritas 1': 1,
  'Prioritas 2': 2,
  'Prioritas 3': 3,
  'Pending Verifikasi': 4,
  Duplikat: 4,
  'Tidak Layak': 5
}

export function perCapita(item: Mustahik): number {
  if (!item.dependents || item.dependents <= 0) return item.monthlyIncome
  return Math.floor(item.monthlyIncome / item.dependents)
}

function findRule(rules: RuleConfig[] | undefined, code: string): RuleConfig {
  return (rules || []).find((item) => item.code === code) || ({} as RuleConfig)
}

function active(rules: RuleConfig[] | undefined, code: string): boolean {
  if (!rules || !rules.length) return true
  return findRule(rules, code).isActive !== false
}

function limit(rules: RuleConfig[] | undefined, code: string, field: keyof RuleConfig, fallback: number): number {
  const value = findRule(rules, code)[field]
  return typeof value === 'number' ? value : fallback
}

export function evaluateMustahik(item: Mustahik, knownNiks: string[], rules?: RuleConfig[]): Evaluation {
  const trace: TraceStep[] = []
  const notes: string[] = []
  const fired: string[] = []
  const income = item.monthlyIncome || 0
  const dependents = item.dependents || 0
  const capita = perCapita(item)
  let result: string | null = null

  function check(code: string, firedNow: boolean, note: string): boolean {
    trace.push({ code, fired: firedNow, note })
    if (firedNow) {
      fired.push(code)
      notes.push(note)
    }
    return firedNow
  }

  function finish(finalResult: string): Evaluation {
    return {
      id: item.id,
      fullName: item.fullName,
      result: finalResult,
      rank: PRIORITY_RANK[finalResult] || 5,
      perCapita: capita,
      firedRules: fired,
      trace,
      notes
    }
  }

  if (active(rules, 'R10') && check('R10', item.documentStatus !== 'Lengkap', 'Dokumen belum lengkap')) {
    return finish('Pending Verifikasi')
  }

  const duplicate = knownNiks.filter((n) => n === item.nik).length > 1
  if (active(rules, 'R11') && check('R11', duplicate, 'NIK atau nomor KK tercatat ganda')) {
    return finish('Duplikat')
  }

  if (active(rules, 'R09') && check('R09', income > limit(rules, 'R09', 'incomeLimit', 2500000) && dependents < 6, 'Pendapatan di atas ambang Warakas')) {
    return finish('Tidak Layak')
  }

  if (active(rules, 'R01a') && check('R01a', income < limit(rules, 'R01a', 'incomeLimit', 1500000), 'Pendapatan kurang dari Rp 1.500.000')) {
    result = 'Prioritas 1'
  } else if (active(rules, 'R01b') && check('R01b', income >= limit(rules, 'R01b', 'incomeMin', 1500000) && income <= limit(rules, 'R01b', 'incomeLimit', 2000000), 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000')) {
    result = 'Prioritas 2'
  } else if (active(rules, 'R01c') && check('R01c', income > limit(rules, 'R01c', 'incomeMin', 2000001) - 1 && income <= limit(rules, 'R01c', 'incomeLimit', 2500000), 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000')) {
    result = 'Prioritas 3'
  }

  if (active(rules, 'R02') && check('R02', capita <= limit(rules, 'R02', 'perCapitaLimit', 300000), 'Pendapatan per kapita Rp ' + capita.toLocaleString('id-ID'))) {
    if (result === 'Prioritas 2' || result === 'Prioritas 3') result = 'Prioritas 1'
  }

  if (active(rules, 'R03')) check('R03', dependents >= limit(rules, 'R03', 'dependentsMin', 4) && income <= limit(rules, 'R03', 'incomeLimit', 2000000), 'Tanggungan berat')

  const isTeacher = (item.occupation || '').includes('Guru Honorer TPQ')
  if (active(rules, 'R04') && check('R04', isTeacher && income >= limit(rules, 'R04', 'honorMin', 300000) && income <= limit(rules, 'R04', 'honorMax', 600000), 'Guru honorer TPQ')) {
    result = 'Prioritas 1'
  }

  if (active(rules, 'R05')) check('R05', (item.specialStatus || '').includes('Wali Santri') && income < limit(rules, 'R05', 'incomeLimit', 2500000), 'Wali santri')

  const vulnerable = (item.specialStatus || '').includes('Janda') || (item.specialStatus || '').includes('Lansia') || (item.specialStatus || '').includes('Yatim')
  if (active(rules, 'R06')) check('R06', vulnerable && income < limit(rules, 'R06', 'incomeLimit', 2000000), 'Kelompok rentan')

  if (active(rules, 'R07')) check('R07', item.houseCondition === 'Kontrak' || item.houseCondition === 'Menumpang', 'Rumah kontrak atau menumpang')

  if (active(rules, 'R08')) check('R08', (item.schoolChildren || 0) >= limit(rules, 'R08', 'schoolMin', 3) && income <= limit(rules, 'R08', 'incomeLimit', 2000000), 'Beban pendidikan tinggi')

  return finish(result || 'Tidak Layak')
}

export function evaluateAll(list: Mustahik[], rules?: RuleConfig[]): Evaluation[] {
  const niks = list.map((item) => item.nik)
  const evaluations = list.map((item) => evaluateMustahik(item, niks, rules))
  return evaluations.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank
    return a.perCapita - b.perCapita
  })
}

export function summarize(evaluations: Evaluation[]): Record<string, number> {
  const counts: Record<string, number> = {
    'Prioritas 1': 0,
    'Prioritas 2': 0,
    'Prioritas 3': 0,
    'Pending Verifikasi': 0,
    Duplikat: 0,
    'Tidak Layak': 0
  }
  for (const item of evaluations) {
    if (counts[item.result] !== undefined) counts[item.result] += 1
  }
  return counts
}
