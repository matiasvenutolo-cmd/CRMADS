import 'server-only'
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { archivos, clientes, etapas, eventos, obras, presupuestos, usuarios, type Etapa } from '@/lib/db/schema'
import { hoyISO } from '@/lib/fechas'

export type FiltroObras = 'en_curso' | 'terminadas' | 'todas'

export type ResumenEtapas = { total: number; completas: number; actual: Etapa | null; atrasada: boolean }

export function resumirEtapas(lista: Etapa[], hoy = hoyISO()): ResumenEtapas {
  const ordenadas = [...lista].sort((a, b) => a.orden - b.orden)
  const actual = ordenadas.find((e) => e.estado === 'en_curso') ?? ordenadas.find((e) => e.estado === 'pendiente') ?? null
  return {
    total: ordenadas.length,
    completas: ordenadas.filter((e) => e.estado === 'completa').length,
    actual,
    atrasada: !!actual?.fechaPrevista && actual.fechaPrevista < hoy,
  }
}

export async function listarObras(filtro: FiltroObras, q?: string) {
  const condiciones = []
  if (filtro === 'en_curso') condiciones.push(eq(obras.estado, 'en_curso'))
  if (filtro === 'terminadas') condiciones.push(eq(obras.estado, 'terminada'))
  if (q?.trim()) {
    const like = `%${q.trim()}%`
    condiciones.push(or(ilike(clientes.nombre, like), ilike(obras.direccion, like), ilike(obras.localidad, like), sql`'O-' || lpad(${obras.numero}::text, 4, '0') ilike ${like}`))
  }

  const filas = await db
    .select({
      id: obras.id,
      numero: obras.numero,
      direccion: obras.direccion,
      localidad: obras.localidad,
      tipologia: obras.tipologia,
      cantidadEquipos: obras.cantidadEquipos,
      estado: obras.estado,
      fechaFinEstimada: obras.fechaFinEstimada,
      clienteNombre: clientes.nombre,
    })
    .from(obras)
    .innerJoin(clientes, eq(clientes.id, obras.clienteId))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(desc(obras.createdAt))

  const todas = filas.length ? await db.select().from(etapas).where(inArray(etapas.obraId, filas.map((f) => f.id))).orderBy(asc(etapas.orden)) : []
  const hoy = hoyISO()
  return filas
    .map((f) => {
      const propias = todas.filter((e) => e.obraId === f.id)
      return { ...f, etapas: propias, resumen: resumirEtapas(propias, hoy) }
    })
    .sort((a, b) => Number(b.resumen.atrasada) - Number(a.resumen.atrasada))
}

export async function contarObras() {
  const filas = await db.select({ estado: obras.estado, n: sql<number>`count(*)::int` }).from(obras).groupBy(obras.estado)
  const por = Object.fromEntries(filas.map((f) => [f.estado, f.n])) as Record<string, number>
  return { en_curso: por.en_curso ?? 0, terminadas: por.terminada ?? 0, todas: filas.reduce((a, f) => a + f.n, 0) }
}

export async function getObra(id: string) {
  const o = await db.query.obras.findFirst({ where: eq(obras.id, id) })
  if (!o) return null
  const delPresupuesto = o.presupuestoId ? eq(eventos.presupuestoId, o.presupuestoId) : undefined
  const [cliente, listaEtapas, historial, adjuntos, presupuesto] = await Promise.all([
    db.query.clientes.findFirst({ where: eq(clientes.id, o.clienteId) }),
    db.select().from(etapas).where(eq(etapas.obraId, id)).orderBy(asc(etapas.orden)),
    db
      .select({ id: eventos.id, tipo: eventos.tipo, texto: eventos.texto, createdAt: eventos.createdAt, autor: usuarios.nombre, obraId: eventos.obraId })
      .from(eventos)
      .leftJoin(usuarios, eq(usuarios.id, eventos.usuarioId))
      .where(delPresupuesto ? or(eq(eventos.obraId, id), delPresupuesto) : eq(eventos.obraId, id))
      .orderBy(desc(eventos.createdAt)),
    db
      .select()
      .from(archivos)
      .where(o.presupuestoId ? or(eq(archivos.obraId, id), eq(archivos.presupuestoId, o.presupuestoId)) : eq(archivos.obraId, id))
      .orderBy(desc(archivos.createdAt)),
    o.presupuestoId ? db.query.presupuestos.findFirst({ where: eq(presupuestos.id, o.presupuestoId), columns: { id: true, numero: true, numeroAds: true, monto: true, moneda: true } }) : null,
  ])
  return { ...o, cliente: cliente!, etapas: listaEtapas, resumen: resumirEtapas(listaEtapas), historial, adjuntos, presupuesto: presupuesto ?? null }
}
