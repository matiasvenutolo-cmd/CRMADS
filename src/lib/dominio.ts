// Etapas validadas con Gerardo (nov 2026). Cada obra guarda su propia copia por orden;
// varias etapas piden datos propios al pasar a la siguiente (ver ETAPA).
export const ETAPAS_OBRA = [
  'Forma de pago',
  'Replanteo',
  'Planos de proyecto',
  'Compras y fabricación',
  'Obra civil',
  'Entrega de materiales en obra',
  'Montaje',
  'Pruebas y puesta en marcha',
  'Entrega final',
] as const

/** Orden de las etapas que tienen comportamiento propio. */
export const ETAPA = { pago: 1, replanteo: 2, planos: 3, compras: 4, civil: 5, entrega: 6, montaje: 7, pruebas: 8, final: 9 } as const

/** Qué fecha se pide al completar cada etapa. */
export const FECHA_DE_ETAPA: Record<number, string> = {
  1: 'Fecha',
  2: 'Fecha del replanteo',
  3: 'Aprobación de los planos por el cliente',
  4: 'Materiales listos',
  5: 'Fecha de la verificación',
  6: 'Fecha de entrega en obra',
  7: 'Fin del montaje',
  8: 'Fecha de puesta en marcha',
  9: 'Fecha de entrega final',
}

export const CATEGORIAS_ARCHIVO = { planos: 'Planos de proyecto', acta: 'Acta de entrega firmada' } as const
export type CategoriaArchivo = keyof typeof CATEGORIAS_ARCHIVO

export const MEDIOS_PAGO = ['Transferencia', 'Efectivo', 'Cheque', 'Canje', 'Otro'] as const

export const MUNICIPAL = { no: 'No corresponde', si: 'A cargo de ADS' } as const

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
/** Número interno de ADS si está cargado ("ADS 8608", "ADS 8608-B"); si no, el código del sistema. */
export function etiquetaPresupuesto(p: { numero: number; numeroAds?: string | null; version?: string | null }) {
  const sufijo = p.version ? `-${p.version}` : ''
  return p.numeroAds ? `ADS ${p.numeroAds}${sufijo}` : `${codigoPresupuesto(p.numero)}${sufijo}`
}

/** Letra de la versión siguiente: original → B → C… */
export function siguienteVersion(actual: string | null | undefined) {
  return actual ? String.fromCharCode(actual.charCodeAt(0) + 1) : 'B'
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
