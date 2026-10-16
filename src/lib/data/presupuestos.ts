import 'server-only'
import { and, asc, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { archivos, clientes, eventos, obras, presupuestos, usuarios } from '@/lib/db/schema'
import { ESTADOS_ACTIVOS } from '@/lib/dominio'

export type FiltroPresupuestos = 'activos' | 'ganados' | 'perdidos' | 'todos'

export async function listarPresupuestos(filtro: FiltroPresupuestos, q?: string) {
  const condiciones = []
  if (filtro === 'activos') condiciones.push(inArray(presupuestos.estado, ESTADOS_ACTIVOS))
  if (filtro === 'ganados') condiciones.push(eq(presupuestos.estado, 'ganado'))
  if (filtro === 'perdidos') condiciones.push(eq(presupuestos.estado, 'perdido'))
  if (q?.trim()) {
    const like = `%${q.trim()}%`
    condiciones.push(or(ilike(clientes.nombre, like), ilike(presupuestos.direccion, like), ilike(presupuestos.localidad, like), sql`'P-' || lpad(${presupuestos.numero}::text, 4, '0') ilike ${like}`))
  }

  return db
    .select({
      id: presupuestos.id,
      numero: presupuestos.numero,
      direccion: presupuestos.direccion,
      localidad: presupuestos.localidad,
      tipologia: presupuestos.tipologia,
      cantidadEquipos: presupuestos.cantidadEquipos,
      monto: presupuestos.monto,
      moneda: presupuestos.moneda,
      estado: presupuestos.estado,
      fechaEnvio: presupuestos.fechaEnvio,
      proximoSeguimiento: presupuestos.proximoSeguimiento,
      updatedAt: presupuestos.updatedAt,
      clienteNombre: clientes.nombre,
    })
    .from(presupuestos)
    .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
    .where(condiciones.length ? and(...condiciones) : undefined)
    .orderBy(sql`${presupuestos.proximoSeguimiento} asc nulls last`, desc(presupuestos.updatedAt))
}

export async function contarPresupuestos() {
  const filas = await db.select({ estado: presupuestos.estado, n: sql<number>`count(*)::int` }).from(presupuestos).groupBy(presupuestos.estado)
  const por = Object.fromEntries(filas.map((f) => [f.estado, f.n])) as Record<string, number>
  const activos = ESTADOS_ACTIVOS.reduce((a, e) => a + (por[e] ?? 0), 0)
  return { activos, ganados: por.ganado ?? 0, perdidos: por.perdido ?? 0, todos: filas.reduce((a, f) => a + f.n, 0) }
}

export async function getPresupuesto(id: string) {
  const p = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, id) })
  if (!p) return null
  const [cliente, historial, adjuntos, obra] = await Promise.all([
    db.query.clientes.findFirst({ where: eq(clientes.id, p.clienteId) }),
    db
      .select({ id: eventos.id, tipo: eventos.tipo, texto: eventos.texto, createdAt: eventos.createdAt, autor: usuarios.nombre })
      .from(eventos)
      .leftJoin(usuarios, eq(usuarios.id, eventos.usuarioId))
      .where(eq(eventos.presupuestoId, id))
      .orderBy(desc(eventos.createdAt)),
    db.select().from(archivos).where(eq(archivos.presupuestoId, id)).orderBy(desc(archivos.createdAt)),
    db.query.obras.findFirst({ where: eq(obras.presupuestoId, id), columns: { id: true, numero: true } }),
  ])
  return { ...p, cliente: cliente!, historial, adjuntos, obra: obra ?? null }
}

export async function opcionesClientes() {
  return db.select({ id: clientes.id, nombre: clientes.nombre }).from(clientes).orderBy(asc(clientes.nombre))
}
