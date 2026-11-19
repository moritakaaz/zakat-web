import { mustahikSeed } from '~/data/mustahik'
import { receipts, distributions } from '~/data/finance'
import { evaluateAll, summarize } from '~/utils/ruleEngine'

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

export function useZakatData() {
  const mustahik = useState('mustahik', () => [...mustahikSeed])
  const evaluations = computed(() => evaluateAll(mustahik.value))
  const summary = computed(() => summarize(evaluations.value))

  const dashboard = computed<DashboardData>(() => {
    const moneyIn = receipts.reduce((sum, row) => sum + row.amountMoney, 0)
    const moneyOut = distributions.reduce((sum, row) => sum + row.amountMoney, 0)
    const riceIn = receipts.reduce((sum, row) => sum + row.quantityKg, 0)
    const riceOut = distributions.reduce((sum, row) => sum + row.quantityKg, 0)
    return {
      totalMustahik: mustahik.value.length,
      totalMuzakki: receipts.length,
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
    const id = 'KK' + String(mustahik.value.length + 1).padStart(2, '0')
    mustahik.value.push({ id, ...item })
    return id
  }

  return { mustahik, evaluations, summary, dashboard, receipts, distributions, addMustahik }
}

export function useSession() {
  const user = useState<any>('session-user', () => null)
  const token = useState<string | null>('session-token', () => null)
  const config = useRuntimeConfig()

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
    if (token.value) headers.Authorization = 'Bearer ' + token.value
    if (options.body) headers['Content-Type'] = 'application/json'
    return fetch(config.public.apiBase + path, { ...options, headers })
  }

  return { user, token, login, restore, logout, authFetch, apiBase: config.public.apiBase }
}
