export function formatMoney(value: number): string {
  return 'Rp ' + (value || 0).toLocaleString('id-ID')
}

export function formatKg(value: number): string {
  return (value || 0).toLocaleString('id-ID') + ' kg'
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(date)
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(date)
}

export function summaryCardMeta(label: string): { icon: string, iconClass: string } {
  if (label === 'Prioritas 1') return { icon: 'i-lucide-trophy', iconClass: 'text-emerald-700' }
  if (label === 'Prioritas 2') return { icon: 'i-lucide-medal', iconClass: 'text-sky-700' }
  if (label === 'Prioritas 3') return { icon: 'i-lucide-award', iconClass: 'text-amber-700' }
  if (label === 'Pending Verifikasi') return { icon: 'i-lucide-hourglass', iconClass: 'text-orange-700' }
  if (label === 'Duplikat') return { icon: 'i-lucide-copy', iconClass: 'text-slate-500' }
  return { icon: 'i-lucide-circle-x', iconClass: 'text-red-700' }
}

export function prioritySeverity(result: string): string {
  if (result === 'Prioritas 1') return 'success'
  if (result === 'Prioritas 2') return 'info'
  if (result === 'Prioritas 3') return 'warning'
  if (result === 'Pending Verifikasi') return 'neutral'
  return 'error'
}
