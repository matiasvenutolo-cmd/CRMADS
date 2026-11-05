import { calcular, conParadas, referenciaSugerida, tipoDesdeTipologia, uid, type ConfigCotizador, type Cotizacion, type LineaCosto, type SeccionDoc, type TipoEquipo } from './modelo'

export type Catalogo = {
  items: { id: string; categoria: string; nombre: string; costo: number; activo: boolean }[]
  bases: { id: string; tipo: string; paradas: number; precio: number; detalle: string | null; fuente: string | null }[]
  textos: { id: string; grupo: string; seccion: string; tipos: string[] | null; variante: string; texto: string; orden: number; porDefecto: boolean }[]
  config: ConfigCotizador
}

/** Precio base de lista para ese tipo y paradas; si no hay exacto, el más cercano. */
export function baseSugerida(cat: Catalogo, tipo: TipoEquipo, paradas: number) {
  const delTipo = cat.bases.filter((b) => b.tipo === tipo)
  if (!delTipo.length) return null
  return [...delTipo].sort((a, b) => Math.abs(a.paradas - paradas) - Math.abs(b.paradas - paradas) || b.paradas - a.paradas)[0]!
}

export function manoDeObraSugerida(cat: Catalogo, paradas: number) {
  const mo = cat.config.mano_obra
  return Math.round((mo.fijo + mo.por_parada * paradas) / 10) * 10
}

/** Secciones del documento por defecto para el tipo de equipo (variantes más usadas). */
export function seccionesPorDefecto(cat: Catalogo, tipo: TipoEquipo, paradas: number): SeccionDoc[] {
  const aplica = cat.textos.filter((t) => t.porDefecto && (!t.tipos || t.tipos.includes(tipo)))
  return aplica
    .sort((a, b) => (a.grupo === b.grupo ? a.orden - b.orden : a.grupo === 'tecnica' ? -1 : 1))
    .map((t) => ({ id: uid(), grupo: t.grupo as SeccionDoc['grupo'], titulo: t.seccion, texto: t.grupo === 'tecnica' ? conParadas(t.texto, paradas) : t.texto, incluir: true }))
}

export function nuevaCotizacion(
  cat: Catalogo,
  p: { tipologia: string; cantidadEquipos: number; paradas: number | null; cargaKg: number | null; velocidad: string | null; direccion: string; localidad: string | null; monto: number | null },
  cliente: { contacto: string | null },
  hoy: string
): Cotizacion {
  const tipo = tipoDesdeTipologia(p.tipologia)
  const paradas = p.paradas ?? 5
  const base = baseSugerida(cat, tipo, paradas)
  const item = (cat_: string, incluye: string) => cat.items.find((i) => i.activo && i.categoria === cat_ && i.nombre.toLowerCase().includes(incluye.toLowerCase()))
  const linea = (it: Catalogo['items'][number] | undefined, cantidad: number, extra?: Partial<LineaCosto>): LineaCosto[] =>
    it ? [{ id: uid(), categoria: it.categoria as LineaCosto['categoria'], nombre: it.nombre, cantidad, costo: it.costo, sinMargen: it.categoria === 'maquina', ...extra }] : []

  // Las puertas casi siempre vienen en el precio de lista de Wittur (sólo 15 de 104 planillas
  // las cargan aparte): quedan en el catálogo para agregarlas cuando haga falta.
  const lineas: LineaCosto[] = [
    ...linea(item('adicional', 'IEP'), 1),
    ...linea(item('flete', 'Wittur'), 1),
    ...linea(item('flete', 'obra'), 1),
    ...linea(item('mano_obra', 'montaje'), 1, { costo: manoDeObraSugerida(cat, paradas) }),
  ]

  // Ficha técnica: valores típicos, completados con lo que ya tiene el presupuesto.
  const ficha = (cat.config.ficha[tipo] ?? []).map((f) => {
    const campo = f.campo.toLowerCase()
    let valor = f.valor
    if (campo === 'tipo de ascensor' && /sin sala/i.test(p.tipologia)) valor = 'Electromecánico. Sin sala de máquinas.'
    if (campo.includes('parada')) valor = `${String(paradas).padStart(2, '0')} Paradas.`
    if ((campo.includes('carga') || campo.includes('capacidad')) && p.cargaKg) valor = `${p.cargaKg} Kgs.`
    if (campo === 'velocidad' && p.velocidad && /^\d+([.,]\d+)?$/.test(p.velocidad.trim())) {
      const mpm = Math.round(Number(p.velocidad.replace(',', '.')) * 60)
      valor = tipo === 'electromecanico' ? `${mpm} m.p.m. – Frecuencia Variable.` : `${mpm} m.p.m.`
    }
    return { id: uid(), campo: f.campo, valor }
  })

  const c: Cotizacion = {
    v: 1,
    tipo,
    cantidad: Math.max(1, p.cantidadEquipos),
    paradas,
    ficha,
    base: { precio: base?.precio ?? 0, descuento: cat.config.descuento_proveedor[tipo] ?? 1, detalle: base ? `Lista ${base.paradas} paradas${base.detalle ? ` · ${base.detalle}` : ''}${base.fuente ? ` (ref. ${base.fuente})` : ''}` : 'Cargá el precio de lista' },
    lineas,
    coeficiente: cat.config.coeficiente,
    actualizacion: cat.config.actualizacion,
    descuentoComercial: 0,
    redondeo: cat.config.redondeo,
    precioManual: null,
    alternativas: [],
    encabezado: { lugar: cat.config.lugar, fecha: hoy, atencion: cliente.contacto ?? '', referencia: referenciaSugerida({ cantidad: Math.max(1, p.cantidadEquipos), tipo, direccion: p.direccion, localidad: p.localidad }) },
    condiciones: { pago: cat.config.pago, plazo: cat.config.plazo, validez: cat.config.validez },
    secciones: seccionesPorDefecto(cat, tipo, paradas),
  }
  calcular(c)
  return c
}
