// Cotizador online: el cálculo replica la planilla Excel de ADS.
//   materiales = precio base de lista × descuento del proveedor + puertas
//   subtotal   = materiales + adicionales + fletes + habilitación + mano de obra
//   precio     = subtotal × actualización × coeficiente (+ lo que va sin margen, p. ej. la máquina)
// Todo es por equipo; el total multiplica por la cantidad.

export const TIPOS_EQUIPO = {
  electromecanico: 'Electromecánico',
  hidraulico: 'Hidráulico',
  monta_vehiculos: 'Monta vehículos',
  monta_platos: 'Monta platos',
} as const
export type TipoEquipo = keyof typeof TIPOS_EQUIPO

export function tipoDesdeTipologia(tipologia: string): TipoEquipo {
  const t = tipologia.toLowerCase()
  if (t.includes('vehí') || t.includes('vehi')) return 'monta_vehiculos'
  if (t.includes('platos')) return 'monta_platos'
  if (t.includes('hidráulico') || t.includes('hidraulico')) return 'hidraulico'
  return 'electromecanico'
}

export const CATEGORIAS = {
  puerta: 'Puertas',
  maquina: 'Máquina',
  adicional: 'Adicionales',
  habilitacion: 'Habilitación',
  flete: 'Fletes',
  mano_obra: 'Mano de obra',
  otro: 'Otros',
} as const
export type Categoria = keyof typeof CATEGORIAS

export type LineaCosto = { id: string; categoria: Categoria; nombre: string; cantidad: number; costo: number; sinMargen: boolean }
export type CampoFicha = { id: string; campo: string; valor: string }
export type SeccionDoc = { id: string; grupo: 'tecnica' | 'condiciones'; titulo: string; texto: string; incluir: boolean }
export type Alternativa = { id: string; concepto: string; monto: number }

export type Cotizacion = {
  v: 1
  tipo: TipoEquipo
  cantidad: number
  paradas: number
  ficha: CampoFicha[]
  base: { precio: number; descuento: number; detalle: string }
  lineas: LineaCosto[]
  coeficiente: number
  actualizacion: number
  descuentoComercial: number // porcentaje sobre el precio sugerido
  redondeo: number
  precioManual: number | null // por equipo; null = se usa el sugerido
  alternativas: Alternativa[]
  encabezado: { lugar: string; fecha: string; atencion: string; referencia: string }
  condiciones: { pago: string; plazo: string; validez: string }
  secciones: SeccionDoc[]
  // Si se armó leyendo el Excel y el Word que ya tenía el presupuesto.
  origen?: { tipo: 'importada'; excel: string; word: string; totalExcel: number; opcion?: string }
}

export type ConfigCotizador = {
  coeficiente: number
  actualizacion: number
  redondeo: number
  descuento_proveedor: Record<TipoEquipo, number>
  mano_obra: { fijo: number; por_parada: number }
  iva: string
  validez: string
  pago: string
  plazo: string
  lugar: string
  ficha: Record<TipoEquipo, { campo: string; valor: string }[]>
}

/** Los textos de siempre traen las paradas escritas («12 Paradas.»): se ajustan a la cotización. */
export function conParadas(texto: string, paradas: number) {
  return texto.replace(/\b\d{1,2}(\s+)Paradas\b/g, (_, esp) => `${String(paradas).padStart(2, '0')}${esp}Paradas`)
}

export const uid = () => Math.random().toString(36).slice(2, 10)

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0)

export function redondear(v: number, paso: number) {
  return paso > 0 ? Math.round(v / paso) * paso : Math.round(v)
}

export function calcular(c: Cotizacion) {
  const base = n(c.base.precio) * n(c.base.descuento)
  const linea = (l: LineaCosto) => n(l.cantidad) * n(l.costo)
  const conMargen = c.lineas.filter((l) => !l.sinMargen)
  const sinMargenLineas = c.lineas.filter((l) => l.sinMargen)
  const porCategoria = Object.fromEntries(Object.keys(CATEGORIAS).map((k) => [k, c.lineas.filter((l) => l.categoria === k).reduce((t, l) => t + linea(l), 0)])) as Record<Categoria, number>
  const materiales = base + conMargen.filter((l) => l.categoria === 'puerta').reduce((t, l) => t + linea(l), 0)
  const subtotal = base + conMargen.reduce((t, l) => t + linea(l), 0)
  const sinMargen = sinMargenLineas.reduce((t, l) => t + linea(l), 0)
  const costo = subtotal + sinMargen
  const conCoeficiente = subtotal * n(c.actualizacion || 1) * n(c.coeficiente || 1)
  const bruto = conCoeficiente + sinMargen
  const sugerido = redondear(bruto * (1 - n(c.descuentoComercial) / 100), n(c.redondeo))
  const unitario = c.precioManual != null && c.precioManual > 0 ? c.precioManual : sugerido
  const cantidad = Math.max(1, Math.round(n(c.cantidad)) || 1)
  return {
    base,
    materiales,
    subtotal,
    sinMargen,
    costo,
    conCoeficiente,
    bruto,
    sugerido,
    unitario,
    cantidad,
    total: unitario * cantidad,
    margen: unitario - costo,
    margenPct: unitario > 0 ? (unitario - costo) / unitario : 0,
    porCategoria,
  }
}
export type Calculo = ReturnType<typeof calcular>

const UNIDADES = ['', 'Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve', 'Diez']

/** «Un (1) Ascensor electromecánico…», como en los Word de ADS. */
export function cantidadEnTexto(cantidad: number) {
  return `${UNIDADES[cantidad] ?? cantidad} (${cantidad})`
}

export function referenciaSugerida(p: { cantidad: number; tipo: TipoEquipo; direccion: string; localidad: string | null }) {
  const equipo = p.tipo === 'hidraulico' ? 'Ascensor Hidráulico' : p.tipo === 'monta_vehiculos' ? 'Monta Vehículos' : p.tipo === 'monta_platos' ? 'Monta Platos' : 'Ascensor Electromecánico'
  const plural = p.cantidad > 1 ? (equipo.startsWith('Ascensor') ? equipo.replace('Ascensor', 'Ascensores') : equipo) : equipo
  return `Provisión e Instalación de ${cantidadEnTexto(p.cantidad)} ${plural} ubicado${p.cantidad > 1 ? 's' : ''} en ${p.direccion}${p.localidad ? ` – ${p.localidad}` : ''}.`
}
