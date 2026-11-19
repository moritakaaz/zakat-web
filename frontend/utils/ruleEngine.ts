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

export function evaluateMustahik(item: Mustahik, knownNiks: string[]): Evaluation {
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

  if (check('R10', item.documentStatus !== 'Lengkap', 'Dokumen belum lengkap')) {
    return finish('Pending Verifikasi')
  }

  const duplicate = knownNiks.filter((n) => n === item.nik).length > 1
  if (check('R11', duplicate, 'NIK atau nomor KK tercatat ganda')) {
    return finish('Duplikat')
  }

  if (check('R09', income > 2500000 && dependents < 6, 'Pendapatan di atas ambang Warakas')) {
    return finish('Tidak Layak')
  }

  if (check('R01a', income < 1500000, 'Pendapatan kurang dari Rp 1.500.000')) {
    result = 'Prioritas 1'
  } else if (check('R01b', income >= 1500000 && income <= 2000000, 'Pendapatan Rp 1.500.000 sampai Rp 2.000.000')) {
    result = 'Prioritas 2'
  } else if (check('R01c', income > 2000000 && income <= 2500000, 'Pendapatan Rp 2.000.001 sampai Rp 2.500.000')) {
    result = 'Prioritas 3'
  }

  if (check('R02', capita <= 300000, 'Pendapatan per kapita Rp ' + capita.toLocaleString('id-ID'))) {
    if (result === 'Prioritas 2' || result === 'Prioritas 3') result = 'Prioritas 1'
  }

  check('R03', dependents >= 4 && income <= 2000000, 'Tanggungan berat')

  const isTeacher = (item.occupation || '').includes('Guru Honorer TPQ')
  if (check('R04', isTeacher && income >= 300000 && income <= 600000, 'Guru honorer TPQ')) {
    result = 'Prioritas 1'
  }

  check('R05', (item.specialStatus || '').includes('Wali Santri') && income < 2500000, 'Wali santri')

  const vulnerable = (item.specialStatus || '').includes('Janda') || (item.specialStatus || '').includes('Lansia') || (item.specialStatus || '').includes('Yatim')
  check('R06', vulnerable && income < 2000000, 'Kelompok rentan')

  check('R07', item.houseCondition === 'Kontrak' || item.houseCondition === 'Menumpang', 'Rumah kontrak atau menumpang')

  check('R08', (item.schoolChildren || 0) >= 3 && income <= 2000000, 'Beban pendidikan tinggi')

  return finish(result || 'Tidak Layak')
}

export function evaluateAll(list: Mustahik[]): Evaluation[] {
  const niks = list.map((item) => item.nik)
  const evaluations = list.map((item) => evaluateMustahik(item, niks))
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
