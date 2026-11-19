export function formatMoney(value: number): string {
  return 'Rp ' + (value || 0).toLocaleString('id-ID')
}

export function formatKg(value: number): string {
  return (value || 0).toLocaleString('id-ID') + ' kg'
}

export function prioritySeverity(result: string): string {
  if (result === 'Prioritas 1') return 'success'
  if (result === 'Prioritas 2') return 'info'
  if (result === 'Prioritas 3') return 'warning'
  if (result === 'Pending Verifikasi') return 'neutral'
  return 'error'
}
