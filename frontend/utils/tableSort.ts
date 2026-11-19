import { ref } from 'vue'

export type SortDirection = 'asc' | 'desc'

export const resultRank: Record<string, number> = {
  'Prioritas 1': 1,
  'Prioritas 2': 2,
  'Prioritas 3': 3,
  'Pending Verifikasi': 4,
  'Tidak Layak': 5
}

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'id-ID')
}

export function useTableSort() {
  const sortKey = ref('')
  const sortDirection = ref<SortDirection>('asc')

  function toggleSort(key: string) {
    if (sortKey.value !== key) {
      sortKey.value = key
      sortDirection.value = 'asc'
      return
    }
    if (sortDirection.value === 'asc') {
      sortDirection.value = 'desc'
      return
    }
    sortKey.value = ''
    sortDirection.value = 'asc'
  }

  function clearSort() {
    sortKey.value = ''
    sortDirection.value = 'asc'
  }

  function sortRows<T>(rows: T[], valueOf: (row: T, key: string) => unknown): T[] {
    if (!sortKey.value) return rows
    const direction = sortDirection.value === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => compareValues(valueOf(a, sortKey.value), valueOf(b, sortKey.value)) * direction)
  }

  return { sortKey, sortDirection, toggleSort, clearSort, sortRows }
}
