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
  const config = useRuntimeConfig()

  function login(email: string) {
    const demoUsers = [
      { name: 'Bendahara TPQ', email: 'bendahara@alfawwaz.or.id', role: 'bendahara' },
      { name: 'Sekretaris TPQ', email: 'sekretaris@alfawwaz.or.id', role: 'sekretaris' },
      { name: 'Kepala TPQ', email: 'kepala@alfawwaz.or.id', role: 'kepala' }
    ]
    const found = demoUsers.find((item) => item.email === email)
    if (!found) return null
    user.value = found
    if (import.meta.client) localStorage.setItem('zakat-user', JSON.stringify(found))
    return found
  }

  function restore() {
    if (!import.meta.client || user.value) return
    const raw = localStorage.getItem('zakat-user')
    if (raw) user.value = JSON.parse(raw)
  }

  function logout() {
    user.value = null
    if (import.meta.client) localStorage.removeItem('zakat-user')
    navigateTo('/login')
  }

  return { user, login, restore, logout, apiBase: config.public.apiBase }
}
