import { mustahikSeed } from '~/data/mustahik'
import { receipts, distributions } from '~/data/finance'
import { evaluateAll, summarize, type RuleConfig } from '~/utils/ruleEngine'

export interface DashboardData {
  totalMustahik: number
  totalMuzakki: number
  moneyIn: number
  moneyOut: number
  balance: number
  riceIn: number
  riceOut: number
  riceBalance: number
  summary: Record<string, number>
}

export interface Period {
  id: number
  periodName: string
  startDate: string
  endDate: string
  status: string
}

export function usePeriod() {
  const selectedPeriodId = useState<number>('selected-period', () => 1)
  const periods = useState<Period[]>('periods', () => [
    { id: 1, periodName: 'Ramadan 1446 H', startDate: '2025-03-01', endDate: '2025-03-29', status: 'closed' },
    { id: 2, periodName: 'Ramadan 1447 H', startDate: '2026-02-18', endDate: '2026-03-19', status: 'active' }
  ])

  function restorePeriod() {
    if (!import.meta.client) return
    const saved = Number(localStorage.getItem('zakat-period') || 1)
    if (saved) selectedPeriodId.value = saved
  }

  function selectPeriod(id: number) {
    selectedPeriodId.value = id
    if (import.meta.client) localStorage.setItem('zakat-period', String(id))
  }

  async function loadPeriods(authFetch: (path: string, options?: any) => Promise<Response>) {
    try {
      const res = await authFetch('/periods')
      if (!res.ok) return
      const body = await res.json()
      if (Array.isArray(body.data) && body.data.length) periods.value = body.data
    } catch (error) {
      // Keep the seed periods when the API is not reachable.
    }
  }

  return { selectedPeriodId, periods, restorePeriod, selectPeriod, loadPeriods }
}

export function useRules() {
  const rules = useState<RuleConfig[]>('rules', () => [])

  async function loadRules(authFetch: (path: string, options?: any) => Promise<Response>) {
    try {
      const res = await authFetch('/rules')
      if (!res.ok) return
      const body = await res.json()
      if (Array.isArray(body.data) && body.data.length) rules.value = body.data
    } catch (error) {
      // Keep the default thresholds when the API is not reachable.
    }
  }

  return { rules, loadRules }
}

export function useZakatData() {
  const mustahik = useState('mustahik', () => mustahikSeed.map((item) => ({ periodId: 1, ...item })))
  const { selectedPeriodId } = usePeriod()
  const { rules } = useRules()
  const periodMustahik = computed(() => mustahik.value.filter((item: any) => Number(item.periodId || 1) === selectedPeriodId.value))
  const evaluations = computed(() => evaluateAll(periodMustahik.value, rules.value.length ? rules.value : undefined))
  const summary = computed(() => summarize(evaluations.value))

  const dashboard = computed<DashboardData>(() => {
    const isPeriodOne = selectedPeriodId.value === 1
    const moneyIn = isPeriodOne ? receipts.reduce((sum, row) => sum + row.amountMoney, 0) : 0
    const moneyOut = isPeriodOne ? distributions.reduce((sum, row) => sum + row.amountMoney, 0) : 0
    const riceIn = isPeriodOne ? receipts.reduce((sum, row) => sum + row.quantityKg, 0) : 0
    const riceOut = isPeriodOne ? distributions.reduce((sum, row) => sum + row.quantityKg, 0) : 0
    return {
      totalMustahik: periodMustahik.value.length,
      totalMuzakki: isPeriodOne ? receipts.length : 0,
      moneyIn,
      moneyOut,
      balance: moneyIn - moneyOut,
      riceIn,
      riceOut,
      riceBalance: riceIn - riceOut,
      summary: summary.value
    }
  })

  function addMustahik(item: any) {
    const next = mustahik.value.reduce((max: number, row: any) => Math.max(max, Number(String(row.id).replace(/\D/g, '')) || 0), 0) + 1
    const id = 'KK' + String(next).padStart(2, '0')
    mustahik.value.push({ periodId: selectedPeriodId.value, id, ...item })
    return id
  }

  function updateMustahik(id: string, patch: any) {
    const index = mustahik.value.findIndex((row: any) => row.id === id)
    if (index < 0) return false
    mustahik.value[index] = { ...mustahik.value[index], ...patch }
    return true
  }

  function deleteMustahik(id: string) {
    const index = mustahik.value.findIndex((row: any) => row.id === id)
    if (index < 0) return false
    mustahik.value.splice(index, 1)
    return true
  }

  return { mustahik, periodMustahik, evaluations, summary, dashboard, receipts, distributions, addMustahik, updateMustahik, deleteMustahik }
}

export function useSession() {
  const user = useState<any>('session-user', () => null)
  const token = useState<string | null>('session-token', () => null)
  const config = useRuntimeConfig()

  const isBendahara = computed(() => user.value?.role === 'bendahara')
  const isSekretaris = computed(() => user.value?.role === 'sekretaris')
  const isKepala = computed(() => user.value?.role === 'kepala')
  const canInput = computed(() => isBendahara.value || isSekretaris.value)
  const canDelete = computed(() => isBendahara.value)
  const canRunRules = computed(() => isBendahara.value)

  function saveSession(found: any, newToken: string) {
    user.value = found
    token.value = newToken
    if (import.meta.client) {
      localStorage.setItem('zakat-user', JSON.stringify(found))
      localStorage.setItem('zakat-token', newToken)
    }
  }

  async function login(email: string, password: string) {
    const res = await fetch(config.public.apiBase + '/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) return null
    const body = await res.json()
    saveSession({ id: body.data.id, name: body.data.name, email: body.data.email, role: body.data.role }, body.data.token)
    return user.value
  }

  function restore() {
    if (!import.meta.client || user.value) return
    const raw = localStorage.getItem('zakat-user')
    const savedToken = localStorage.getItem('zakat-token')
    if (raw) user.value = JSON.parse(raw)
    if (savedToken) token.value = savedToken
  }

  function logout() {
    user.value = null
    token.value = null
    if (import.meta.client) {
      localStorage.removeItem('zakat-user')
      localStorage.removeItem('zakat-token')
    }
    navigateTo('/login')
  }

  // Fetch helper that sends the JWT on every protected request.
  async function authFetch(path: string, options: any = {}) {
    const headers = { ...(options.headers || {}) }
    const savedToken = token.value || (import.meta.client ? localStorage.getItem('zakat-token') : null)
    if (savedToken) headers.Authorization = 'Bearer ' + savedToken
    if (options.body) headers['Content-Type'] = 'application/json'
    return fetch(config.public.apiBase + path, { ...options, headers })
  }

  return { user, token, login, restore, logout, authFetch, apiBase: config.public.apiBase, isBendahara, isSekretaris, isKepala, canInput, canDelete, canRunRules }
}
