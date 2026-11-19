// CSV export with a semicolon separator, which is what Excel in
// Indonesia expects, and a UTF-8 BOM so accented characters open
// correctly. Fields are quoted only when they need it.
export function csvEscape(value: unknown): string {
  const text = String(value ?? '')
  if (/[;"\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"'
  return text
}

export function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.map(csvEscape).join(';')]
  for (const row of rows) lines.push(row.map(csvEscape).join(';'))
  return '\uFEFF' + lines.join('\n')
}

export function downloadCsv(filename: string, headers: string[], rows: unknown[][]): void {
  const blob = new Blob([buildCsv(headers, rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function fileNameSlug(value: string): string {
  return String(value || 'periode').trim().toLowerCase().replace(/\s+/g, '-')
}
