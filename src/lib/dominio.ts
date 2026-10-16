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
export function codigoObra(numero: number) {
  return `O-${String(numero).padStart(4, '0')}`
}
