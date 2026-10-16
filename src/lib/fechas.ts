const TZ = 'America/Argentina/Buenos_Aires'

/** Fecha de hoy en Argentina, como 'YYYY-MM-DD'. */
export function hoyISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function sumarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

/** b - a, en días. */
export function diferenciaDias(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000)
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** '2026-10-16' → '16 oct' (agrega el año si no es el actual). */
export function fechaCorta(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  const base = `${d} ${MESES[m - 1]}`
  return y === Number(hoyISO().slice(0, 4)) ? base : `${base} ${y}`
}

export function fechaLarga(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  const t = new Intl.DateTimeFormat('es-AR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(d).replace(',', '')
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** "hoy", "mañana", "hace 3 días", "en 5 días". */
export function relativo(iso: string): string {
  const dias = diferenciaDias(hoyISO(), iso)
  if (dias === 0) return 'hoy'
  if (dias === 1) return 'mañana'
  if (dias === -1) return 'ayer'
  return dias > 0 ? `en ${dias} días` : `hace ${-dias} días`
}

export function momento(fecha: Date): string {
  const iso = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(fecha)
  const hora = new Intl.DateTimeFormat('es-AR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(fecha)
  const dias = diferenciaDias(iso, hoyISO())
  if (dias === 0) return `Hoy, ${hora}`
  if (dias === 1) return `Ayer, ${hora}`
  return `${fechaCorta(iso)}, ${hora}`
}
