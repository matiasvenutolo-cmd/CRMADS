export function dinero(monto: number | null | undefined, moneda: string = 'ARS'): string {
  if (monto == null) return 'Sin monto'
  const num = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(monto)
  return moneda === 'USD' ? `US$ ${num}` : `$ ${num}`
}

export function dineroCompacto(monto: number, moneda: string = 'ARS'): string {
  const pre = moneda === 'USD' ? 'US$ ' : '$ '
  if (monto >= 1_000_000) return `${pre}${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(monto / 1_000_000)} M`
  if (monto >= 1_000) return `${pre}${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(monto / 1_000)} mil`
  return `${pre}${monto}`
}

export function tamanoArchivo(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export function soloDigitos(tel: string): string {
  return tel.replace(/\D/g, '')
}
