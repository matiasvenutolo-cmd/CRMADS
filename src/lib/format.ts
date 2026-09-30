export function formatMoney(value: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function formatDateLong(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export const HOY = '2026-09-30'

export function diasDesde(iso: string, hasta: string = HOY): number {
  const a = new Date(`${iso}T00:00:00`).getTime()
  const b = new Date(`${hasta}T00:00:00`).getTime()
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function estaVencido(iso: string, hasta: string = HOY): boolean {
  return diasDesde(iso, hasta) > 0
}
