export interface Mustahik { id: string, fullName: string, nik: string, address: string, occupation: string, monthlyIncome: number, dependents: number, schoolChildren: number, houseCondition: string, specialStatus: string, asnaf: string, documentStatus: string, expectedResult?: string, periodId?: number }

export interface TraceStep {
  code: string
  fired: boolean | null
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

function statusTokens(item: Mustahik): string[] {
  return String(item.specialStatus || '').split(',').map((token) => token.trim().toLowerCase()).filter(Boolean)
}

function hasStatus(item: Mustahik, keyword: string): boolean {
  return statusTokens(item).includes(keyword.toLowerCase())
}

function isTeacher(item: Mustahik): boolean {
  return String(item.occupation || '').trim().toLowerCase() === 'guru honorer tpq'
}

function normalizeNik(value: string): string {
  return String(value || '').replace(/[\s-]/g, '')
}

function findRule(rules: RuleConfig[] | undefined, code: string): RuleConfig | undefined {
  return (rules || []).find((item) => item.code === code)
}

function active(rules: RuleConfig[] | undefined, code: string): boolean {
  const rule = findRule(rules, code)
  return !!rule && rule.isActive !== false
}

function limit(rules: RuleConfig[] | undefined, code: string, field: keyof RuleConfig): number | undefined {
  const value = findRule(rules, code)?.[field]
  return typeof value === 'number' ? value : undefined
}

function moneyText(value: number): string {
  return 'Rp ' + value.toLocaleString('id-ID')
}

export function evaluateMustahik(item: Mustahik, knownNiks: string[], rules?: RuleConfig[]): Evaluation {
  const trace: TraceStep[] = []
  const notes: string[] = []
  const fired: string[] = []
  const income = item.monthlyIncome || 0
  const dependents = item.dependents || 0
  const capita = perCapita(item)
  let result: string | null = null

  function check(code: string, firedNow: boolean, firedNote: string, unfiredNote: string): boolean {
    const note = firedNow ? firedNote : unfiredNote
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

  if (active(rules, 'R10') && check('R10', item.documentStatus !== 'Lengkap', 'Dokumen belum lengkap', 'Dokumen lengkap')) {
    return finish('Pending Verifikasi')
  }

  const nik = normalizeNik(item.nik)
  const duplicate = nik !== '' && knownNiks.filter((n) => normalizeNik(n) === nik).length > 1
  if (active(rules, 'R11') && check('R11', duplicate, 'NIK tercatat ganda pada periode ini', 'NIK tidak ganda')) {
    return finish('Duplikat')
  }

  const upper = limit(rules, 'R09', 'incomeLimit')
  if (active(rules, 'R09') && check('R09', upper !== undefined && income > upper, 'Pendapatan di atas ambang Warakas', 'Pendapatan ' + moneyText(income))) {
    return finish('Tidak Layak')
  }

  const lowLimit = limit(rules, 'R01a', 'incomeLimit')
  const midMin = limit(rules, 'R01b', 'incomeMin')
  const midLimit = limit(rules, 'R01b', 'incomeLimit')
  const highMin = limit(rules, 'R01c', 'incomeMin')
  const highLimit = limit(rules, 'R01c', 'incomeLimit')
  const bandA = active(rules, 'R01a') && check('R01a', lowLimit !== undefined && income < lowLimit, lowLimit !== undefined ? 'Pendapatan kurang dari ' + moneyText(lowLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  const bandB = active(rules, 'R01b') && check('R01b', midMin !== undefined && midLimit !== undefined && income >= midMin && income <= midLimit, midMin !== undefined && midLimit !== undefined ? 'Pendapatan ' + moneyText(midMin) + ' sampai ' + moneyText(midLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  const bandC = active(rules, 'R01c') && check('R01c', highMin !== undefined && highLimit !== undefined && income >= highMin && income <= highLimit, highMin !== undefined && highLimit !== undefined ? 'Pendapatan ' + moneyText(highMin) + ' sampai ' + moneyText(highLimit) : 'Ambang aturan tidak tersedia', 'Pendapatan ' + moneyText(income))
  if (bandA) result = 'Prioritas 1'
  else if (bandB) result = 'Prioritas 2'
  else if (bandC) result = 'Prioritas 3'

  const capitaLimit = limit(rules, 'R02', 'perCapitaLimit')
  if (active(rules, 'R02') && check('R02', capitaLimit !== undefined && capita <= capitaLimit, 'Pendapatan per kapita ' + moneyText(capita), 'Pendapatan per kapita ' + moneyText(capita) + ', di atas batas ' + (capitaLimit !== undefined ? moneyText(capitaLimit) : '-'))) {
    if (result === 'Prioritas 2' || result === 'Prioritas 3') result = 'Prioritas 1'
  }

  const dependentsMin = limit(rules, 'R03', 'dependentsMin')
  const heavyLimit = limit(rules, 'R03', 'incomeLimit')
  if (active(rules, 'R03')) check('R03', dependentsMin !== undefined && heavyLimit !== undefined && dependents >= dependentsMin && income <= heavyLimit, 'Tanggungan berat', 'Tanggungan ' + dependents + ' jiwa')

  const honorMin = limit(rules, 'R04', 'honorMin')
  const honorMax = limit(rules, 'R04', 'honorMax')
  if (active(rules, 'R04') && check('R04', honorMin !== undefined && honorMax !== undefined && isTeacher(item) && income >= honorMin && income <= honorMax, 'Guru honorer TPQ', 'Pekerjaan ' + (item.occupation || '-'))) {
    result = 'Prioritas 1'
  }

  const waliLimit = limit(rules, 'R05', 'incomeLimit')
  if (active(rules, 'R05')) check('R05', waliLimit !== undefined && hasStatus(item, 'Wali Santri') && income < waliLimit, 'Wali santri', 'Status khusus ' + (item.specialStatus || '-'))

  const vulnerable = hasStatus(item, 'Janda') || hasStatus(item, 'Lansia') || hasStatus(item, 'Yatim')
  const vulnerableLimit = limit(rules, 'R06', 'incomeLimit')
  if (active(rules, 'R06')) check('R06', vulnerableLimit !== undefined && vulnerable && income < vulnerableLimit, 'Kelompok rentan', 'Status khusus ' + (item.specialStatus || '-'))

  if (active(rules, 'R07')) check('R07', item.houseCondition === 'Kontrak' || item.houseCondition === 'Menumpang', 'Rumah kontrak atau menumpang', 'Rumah ' + (item.houseCondition || '-'))

  const schoolMin = limit(rules, 'R08', 'schoolMin')
  const schoolLimit = limit(rules, 'R08', 'incomeLimit')
  if (active(rules, 'R08')) check('R08', schoolMin !== undefined && schoolLimit !== undefined && (item.schoolChildren || 0) >= schoolMin && income <= schoolLimit, 'Beban pendidikan tinggi', 'Anak sekolah ' + (item.schoolChildren || 0) + ' orang')

  if (active(rules, 'R12')) trace.push({ code: 'R12', fired: null, note: 'Penyaluran diurutkan Prioritas 1, lalu 2, lalu 3 bila dana kurang' })

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
