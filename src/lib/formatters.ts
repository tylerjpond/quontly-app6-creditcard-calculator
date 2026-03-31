const decimalFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function currency(value: number, currencyCode = 'USD', locale = 'en-US'): string {
  const safeValue = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(safeValue)
}

export function decimal(value: number): string {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatMoney(value: number): string {
  return currency(value)
}

export function csvCell(value: string | number): string {
  const text = String(value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }
  return text
}
