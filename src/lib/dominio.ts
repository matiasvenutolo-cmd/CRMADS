// Etapas propuestas para validar con ADS en la reunión de arranque. Cada obra
// guarda su propia copia, así que cambiar esta lista sólo afecta obras nuevas.
export const ETAPAS_OBRA = [
  'Anticipo y alta de obra',
  'Relevamiento e ingeniería',
  'Planos y aprobaciones',
  'Fabricación en planta',
  'Obra civil lista',
  'Entrega en obra',
  'Montaje',
  'Pruebas y puesta en marcha',
  'Entrega final y documentación',
] as const

export const TIPOLOGIAS = [
  'Ascensor electromecánico',
  'Ascensor hidráulico',
  'Sin sala de máquinas',
  'Monta vehículos',
  'Monta camillas',
  'Montacargas',
  'Monta platos / papeles',
] as const

export const LOCALIDADES_SUGERIDAS = ['CABA', 'Lanús Oeste', 'Lanús Este', 'Banfield', 'Avellaneda', 'Lomas de Zamora', 'Quilmes', 'Villa Gesell', 'Mar del Plata', 'Pinamar']

export const ESTADOS_PRESUPUESTO = {
  borrador: { label: 'Borrador', color: 'var(--color-ink-3)' },
  enviado: { label: 'Enviado', color: 'var(--color-accent)' },
  negociacion: { label: 'En negociación', color: 'var(--color-teal)' },
  ganado: { label: 'Ganado', color: 'var(--color-ok)' },
  perdido: { label: 'Perdido', color: 'var(--color-bad)' },
} as const
export type EstadoPresupuesto = keyof typeof ESTADOS_PRESUPUESTO
export const ESTADOS_ACTIVOS: EstadoPresupuesto[] = ['borrador', 'enviado', 'negociacion']

export const MOTIVOS_PERDIDA = ['Precio', 'Plazo de entrega', 'Eligió otra empresa', 'Obra postergada o cancelada', 'Otro'] as const

export const TIPOS_CONTACTO = {
  nota: 'Nota',
  llamada: 'Llamada',
  whatsapp: 'WhatsApp',
  mail: 'Mail',
  visita: 'Visita',
} as const
export type TipoContacto = keyof typeof TIPOS_CONTACTO

export const MONEDAS = ['ARS', 'USD'] as const
export type Moneda = (typeof MONEDAS)[number]

export function codigoPresupuesto(numero: number) {
  return `P-${String(numero).padStart(4, '0')}`
}
/** Número interno de ADS si está cargado ("ADS 8608"); si no, el código del sistema. */
export function etiquetaPresupuesto(p: { numero: number; numeroAds?: string | null }) {
  return p.numeroAds ? `ADS ${p.numeroAds}` : codigoPresupuesto(p.numero)
}

/** "ADS 8608", "ads-8608", "8608" → "8608". */
export function normalizarNumeroAds(v: string | null | undefined): string | null {
  const t = (v ?? '').trim().replace(/^ads[\s\-_.]*/i, '').trim()
  return t ? t.toUpperCase() : null
}

/** Busca un número ADS en el nombre de un archivo ("ADS 8608.xls" → "8608"). */
export function numeroAdsDeArchivo(nombre: string): string | null {
  const m = nombre.match(/ads[\s\-_.]*(\d{3,6})/i)
  return m ? m[1] : null
}

/** La velocidad se carga en m/s; si es sólo un número, se le agrega la unidad. */
export function velocidadLegible(v: string | null | undefined): string | null {
  if (!v) return null
  return /^\d+([.,]\d+)?$/.test(v.trim()) ? `${v.trim().replace('.', ',')} m/s` : v
}

export function codigoObra(numero: number) {
  return `O-${String(numero).padStart(4, '0')}`
}
