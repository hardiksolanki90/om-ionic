const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatReportCurrency(value: number): string {
  return currencyFormatter.format(value)
}

export function formatReportNumber(value: number, decimals = 2): string {
  return value.toFixed(decimals)
}
