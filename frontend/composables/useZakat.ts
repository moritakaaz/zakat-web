import { evaluateAll, summarize, type RuleConfig, type Mustahik } from '~/utils/ruleEngine'

export type { Mustahik }

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

const loadErrorText = 'Data dari server tidak dapat dimuat. Periksa apakah backend berjalan lalu muat ulang halaman.'

type FetchFn = (path: string, options?: any) => Promise<Response>

function useLoadError() {
  return useState<string>('zakat-load-error', () => '')
}

async function fetchList(authFetch: FetchFn, path: string): Promise<any[]> {
  const res = await authFetch(path)
  if (!res.ok) throw new Error('Request failed with status ' + res.status)
  const body = await res.json()
  return Array.isArray(body.data) ? body.data : []
}

export function usePeriod() {
  const selectedPeriodId = useState<number>('selected-period', () => 1)
  const periods = useState<Period[]>('periods', () => [])
  const loadError = useLoadError()

  function restorePeriod() {
    if (!import.meta.client) return
    const saved = Number(localStorage.getItem('zakat-period') || 1)
    if (saved) selectedPeriodId.value = saved
  }

  function selectPeriod(id: number) {
    selectedPeriodId.value = id
    if (import.meta.client) localStorage.setItem('zakat-period', String(id))
  }

  async function loadPeriods(authFetch: FetchFn) {
    try {
      periods.value = await fetchList(authFetch, '/periods')
    } catch (error) {
      periods.value = []
      loadError.value = loadErrorText
    }
  }

  return { selectedPeriodId, periods, restorePeriod, selectPeriod, loadPeriods }
}

export function useRules() {
  const rules = useState<RuleConfig[]>('rules', () => [])
  const loadError = useLoadError()

  async function loadRules(authFetch: FetchFn) {
    try {
      rules.value = await fetchList(authFetch, '/rules')
    } catch (error) {
      rules.value = []
      loadError.value = loadErrorText
    }
  }

  return { rules, loadRules }
}

export function useZakatData() {
  const mustahik = useState<any[]>('mustahik', () => [])
  const receipts = useState<any[]>('receipts', () => [])
  const distributions = useState<any[]>('distributions', () => [])
  const dashboardData = useState<DashboardData | null>('dashboard-data', () => null)
  const loadError = useLoadError()
  const { selectedPeriodId } = usePeriod()
  const { rules, loadRules } = useRules()
  const { loadPeriods } = usePeriod()
  const periodMustahik = computed(() => mustahik.value.filter((item: any) => Number(item.periodId || 1) === selectedPeriodId.value))
  const evaluations = computed(() => evaluateAll(periodMustahik.value, rules.value.length ? rules.value : undefined))
  const summary = computed(() => summarize(evaluations.value))

  const periodReceipts = computed(() => receipts.value.filter((row: any) => Number(row.periodId || 1) === selectedPeriodId.value))
  const periodDistributions = computed(() => distributions.value.filter((row: any) => Number(row.periodId || 1) === selectedPeriodId.value))

  const dashboard = computed<DashboardData>(() => {
    if (dashboardData.value) {
      return {
        totalMustahik: dashboardData.value.totalMustahik,
        totalMuzakki: dashboardData.value.totalMuzakki,
        moneyIn: dashboardData.value.moneyIn,
        moneyOut: dashboardData.value.moneyOut,
        balance: dashboardData.value.balance,
        riceIn: dashboardData.value.riceIn,
        riceOut: dashboardData.value.riceOut,
        riceBalance: dashboardData.value.riceBalance,
        summary: dashboardData.value.summary && Object.keys(dashboardData.value.summary).length ? dashboardData.value.summary : summary.value
      }
    }
    const moneyIn = periodReceipts.value.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
    const moneyOut = periodDistributions.value.reduce((sum, row) => sum + (row.amountMoney || 0), 0)
    const riceIn = periodReceipts.value.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
    const riceOut = periodDistributions.value.reduce((sum, row) => sum + (row.quantityKg || 0), 0)
    return {
      totalMustahik: periodMustahik.value.length,
      totalMuzakki: periodReceipts.value.length,
      moneyIn,
      moneyOut,
      balance: moneyIn - moneyOut,
      riceIn,
      riceOut,
      riceBalance: riceIn - riceOut,
      summary: summary.value
    }
  })

  async function loadMustahik(authFetch: FetchFn) {
    try {
      mustahik.value = await fetchList(authFetch, '/mustahik')
    } catch (error) {
      mustahik.value = []
      loadError.value = loadErrorText
    }
  }

  async function loadFinance(authFetch: FetchFn) {
    try {
      const [loadedReceipts, loadedDistributions] = await Promise.all([
        fetchList(authFetch, '/receipts'),
        fetchList(authFetch, '/distributions')
      ])
      receipts.value = loadedReceipts
      distributions.value = loadedDistributions
    } catch (error) {
      receipts.value = []
      distributions.value = []
      loadError.value = loadErrorText
    }
  }

  async function loadDashboard(authFetch: FetchFn) {
    try {
      const res = await authFetch('/dashboard?periodId=' + selectedPeriodId.value)
      if (!res.ok) throw new Error('Request failed with status ' + res.status)
      const body = await res.json()
      dashboardData.value = body.data || null
    } catch (error) {
      dashboardData.value = null
      loadError.value = loadErrorText
    }
  }

  async function loadAll(authFetch: FetchFn) {
    loadError.value = ''
    await Promise.all([
      loadMustahik(authFetch),
      loadFinance(authFetch),
      loadDashboard(authFetch),
      loadPeriods(authFetch),
      loadRules(authFetch)
    ])
  }

  return { mustahik, receipts, distributions, periodMustahik, evaluations, summary, dashboard, loadError, loadMustahik, loadFinance, loadDashboard, loadAll }
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
