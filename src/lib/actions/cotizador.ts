'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { cotizaciones, cotizadorBases, cotizadorConfig, cotizadorItems, cotizadorTextos, presupuestos } from '@/lib/db/schema'
import { requerirEdicion } from '@/lib/session'
import { calcular, CATEGORIAS, TIPOS_EQUIPO, type Cotizacion } from '@/lib/cotizador/modelo'
import { dinero } from '@/lib/formato'
import { registrarEvento, textoLimpio, type Resultado } from './comun'

const num = (v: unknown, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def)
const str = (v: unknown, max = 20000) => (typeof v === 'string' ? v.slice(0, max) : '')

/** Limpia lo que llega del navegador: sólo los campos conocidos, con tipos correctos. */
function sanear(c: Cotizacion): Cotizacion {
  return {
    v: 1,
    tipo: c.tipo in TIPOS_EQUIPO ? c.tipo : 'electromecanico',
    cantidad: Math.max(1, Math.round(num(c.cantidad, 1))),
    paradas: Math.max(1, Math.round(num(c.paradas, 1))),
    ficha: (c.ficha ?? []).slice(0, 40).map((f) => ({ id: str(f.id, 20), campo: str(f.campo, 120), valor: str(f.valor, 500) })),
    base: { precio: num(c.base?.precio), descuento: num(c.base?.descuento, 1), detalle: str(c.base?.detalle, 300) },
    lineas: (c.lineas ?? []).slice(0, 80).map((l) => ({ id: str(l.id, 20), categoria: l.categoria in CATEGORIAS ? l.categoria : 'otro', nombre: str(l.nombre, 300), cantidad: num(l.cantidad), costo: num(l.costo), sinMargen: Boolean(l.sinMargen) })),
    coeficiente: num(c.coeficiente, 1),
    actualizacion: num(c.actualizacion, 1),
    descuentoComercial: Math.min(100, Math.max(0, num(c.descuentoComercial))),
    redondeo: Math.max(0, num(c.redondeo)),
    precioManual: c.precioManual == null || !num(c.precioManual) ? null : num(c.precioManual),
    alternativas: (c.alternativas ?? []).slice(0, 10).map((a) => ({ id: str(a.id, 20), concepto: str(a.concepto, 500), monto: num(a.monto) })),
    encabezado: { lugar: str(c.encabezado?.lugar, 80), fecha: str(c.encabezado?.fecha, 10), atencion: str(c.encabezado?.atencion, 200), referencia: str(c.encabezado?.referencia, 600) },
    condiciones: { pago: str(c.condiciones?.pago, 500), plazo: str(c.condiciones?.plazo, 500), validez: str(c.condiciones?.validez, 100) },
    secciones: (c.secciones ?? []).slice(0, 80).map((s) => ({ id: str(s.id, 20), grupo: s.grupo === 'condiciones' ? 'condiciones' : 'tecnica', titulo: str(s.titulo, 200), texto: str(s.texto), incluir: s.incluir !== false })),
    ...(c.origen?.tipo === 'importada' ? { origen: { tipo: 'importada' as const, excel: str(c.origen.excel, 200), word: str(c.origen.word, 200), totalExcel: num(c.origen.totalExcel), opcion: str(c.origen.opcion, 200) } } : {}),
  }
}

export async function guardarCotizacion(presupuestoId: string, datos: Cotizacion): Promise<Resultado> {
  const u = await requerirEdicion()
  const limpio = sanear(datos)
  const existente = await db.query.cotizaciones.findFirst({ where: eq(cotizaciones.presupuestoId, presupuestoId), columns: { presupuestoId: true, datos: true } })
  // Las importadas de los Excel y Word son sólo para ver, por ahora.
  if ((existente?.datos as Cotizacion | undefined)?.origen?.tipo === 'importada') return { ok: false, error: 'Esta cotización se armó con los archivos del presupuesto y por ahora es sólo para ver.' }
  await db
    .insert(cotizaciones)
    .values({ presupuestoId, datos: limpio, usuarioId: u.id })
    .onConflictDoUpdate({ target: cotizaciones.presupuestoId, set: { datos: limpio, usuarioId: u.id, updatedAt: new Date() } })
  if (!existente) await registrarEvento(db, { presupuestoId, tipo: 'sistema', texto: 'Cotización armada en el cotizador online', usuarioId: u.id })
  revalidatePath(`/presupuestos/${presupuestoId}`)
  return { ok: true }
}

/** Pasa el total de la cotización al monto del presupuesto. */
export async function usarPrecioCotizado(presupuestoId: string, datos: Cotizacion): Promise<Resultado> {
  const u = await requerirEdicion()
  const guardada = await guardarCotizacion(presupuestoId, datos)
  if (!guardada.ok) return guardada
  const total = calcular(sanear(datos)).total
  const p = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, presupuestoId), columns: { monto: true, moneda: true } })
  if (!p) return { ok: false, error: 'No existe el presupuesto.' }
  await db.update(presupuestos).set({ monto: total, moneda: 'USD', updatedAt: new Date() }).where(eq(presupuestos.id, presupuestoId))
  await registrarEvento(db, { presupuestoId, tipo: 'sistema', texto: `Monto tomado del cotizador: ${p.monto != null ? `${dinero(p.monto, p.moneda)} → ` : ''}${dinero(total, 'USD')}`, usuarioId: u.id })
  revalidatePath('/', 'layout')
  return { ok: true }
}

// ── Base de precios y textos ──────────────────────────────────────

export async function guardarItem(id: string | null, i: { categoria: string; nombre: string; costo: number | string; notas?: string }): Promise<Resultado> {
  await requerirEdicion()
  const nombre = textoLimpio(i.nombre)
  if (!nombre) return { ok: false, error: 'Falta el nombre.' }
  const datos = { categoria: i.categoria in CATEGORIAS ? i.categoria : 'otro', nombre, costo: num(String(i.costo).replace(',', '.')), notas: textoLimpio(i.notas), updatedAt: new Date() }
  if (id) await db.update(cotizadorItems).set(datos).where(eq(cotizadorItems.id, id))
  else await db.insert(cotizadorItems).values({ ...datos, orden: 999 })
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}

export async function archivarItem(id: string, activo: boolean): Promise<Resultado> {
  await requerirEdicion()
  await db.update(cotizadorItems).set({ activo, updatedAt: new Date() }).where(eq(cotizadorItems.id, id))
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}

export async function guardarBase(id: string | null, b: { tipo: string; paradas: number | string; precio: number | string; detalle?: string; fuente?: string }): Promise<Resultado> {
  await requerirEdicion()
  const paradas = Math.round(num(b.paradas))
  if (!(b.tipo in TIPOS_EQUIPO) || paradas < 1) return { ok: false, error: 'Elegí el tipo y la cantidad de paradas.' }
  const datos = { tipo: b.tipo, paradas, precio: num(String(b.precio).replace(',', '.')), detalle: textoLimpio(b.detalle), fuente: textoLimpio(b.fuente), updatedAt: new Date() }
  try {
    if (id) await db.update(cotizadorBases).set(datos).where(eq(cotizadorBases.id, id))
    else await db.insert(cotizadorBases).values(datos)
  } catch {
    return { ok: false, error: 'Ya hay un precio para ese tipo y cantidad de paradas.' }
  }
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}

export async function eliminarBase(id: string): Promise<Resultado> {
  await requerirEdicion()
  await db.delete(cotizadorBases).where(eq(cotizadorBases.id, id))
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}

export async function guardarTexto(id: string, t: { variante: string; texto: string; porDefecto: boolean }): Promise<Resultado> {
  await requerirEdicion()
  const texto = textoLimpio(t.texto)
  if (!texto) return { ok: false, error: 'El texto no puede quedar vacío.' }
  const actual = await db.query.cotizadorTextos.findFirst({ where: eq(cotizadorTextos.id, id) })
  if (!actual) return { ok: false, error: 'No existe ese texto.' }
  await db.transaction(async (tx) => {
    // Una sola variante por defecto por sección y grupo de tipos.
    if (t.porDefecto) await tx.update(cotizadorTextos).set({ porDefecto: false }).where(and(eq(cotizadorTextos.seccion, actual.seccion), eq(cotizadorTextos.grupo, actual.grupo), sql`${cotizadorTextos.tipos} is not distinct from ${actual.tipos}`))
    await tx
      .update(cotizadorTextos)
      .set({ variante: textoLimpio(t.variante) ?? actual.variante, texto, porDefecto: t.porDefecto, updatedAt: new Date() })
      .where(eq(cotizadorTextos.id, id))
  })
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}

export async function guardarParametros(valores: { coeficiente: number; redondeo: number; iva: string; validez: string; pago: string; plazo: string; lugar: string; moFijo: number; moPorParada: number }): Promise<Resultado> {
  await requerirEdicion()
  const filas: [string, unknown][] = [
    ['coeficiente', num(valores.coeficiente, 1.2)],
    ['redondeo', num(valores.redondeo, 50)],
    ['iva', str(valores.iva, 20)],
    ['validez', str(valores.validez, 60)],
    ['pago', str(valores.pago, 300)],
    ['plazo', str(valores.plazo, 300)],
    ['lugar', str(valores.lugar, 60)],
    ['mano_obra', { fijo: num(valores.moFijo), por_parada: num(valores.moPorParada) }],
  ]
  for (const [clave, valor] of filas) {
    await db.insert(cotizadorConfig).values({ clave, valor }).onConflictDoUpdate({ target: cotizadorConfig.clave, set: { valor, updatedAt: new Date() } })
  }
  revalidatePath('/cotizador', 'layout')
  return { ok: true }
}
