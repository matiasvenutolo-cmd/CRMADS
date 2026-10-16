import 'server-only'
import { and, asc, eq, inArray, isNull, lte, gte, ne, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { clientes, etapas, obras, presupuestos } from '@/lib/db/schema'
import { ESTADOS_ACTIVOS } from '@/lib/dominio'
import { hoyISO, sumarDias } from '@/lib/fechas'

const columnasPresupuesto = {
  id: presupuestos.id,
  numero: presupuestos.numero,
  direccion: presupuestos.direccion,
  estado: presupuestos.estado,
  monto: presupuestos.monto,
  moneda: presupuestos.moneda,
  proximoSeguimiento: presupuestos.proximoSeguimiento,
  fechaEnvio: presupuestos.fechaEnvio,
  clienteNombre: clientes.nombre,
}

export async function datosHoy() {
  const hoy = hoyISO()
  const enUnaSemana = sumarDias(hoy, 7)

  const [seguimientos, sinProximoPaso, etapasAtrasadas, etapasSemana, totales, obrasEnCurso] = await Promise.all([
    db
      .select(columnasPresupuesto)
      .from(presupuestos)
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
      .where(and(inArray(presupuestos.estado, ESTADOS_ACTIVOS), lte(presupuestos.proximoSeguimiento, hoy)))
      .orderBy(asc(presupuestos.proximoSeguimiento)),
    db
      .select(columnasPresupuesto)
      .from(presupuestos)
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
      .where(and(inArray(presupuestos.estado, ['enviado', 'negociacion']), isNull(presupuestos.proximoSeguimiento)))
      .orderBy(asc(presupuestos.fechaEnvio)),
    db
      .select({ etapaId: etapas.id, etapa: etapas.nombre, orden: etapas.orden, fechaPrevista: etapas.fechaPrevista, obraId: obras.id, numero: obras.numero, direccion: obras.direccion, clienteNombre: clientes.nombre })
      .from(etapas)
      .innerJoin(obras, eq(obras.id, etapas.obraId))
      .innerJoin(clientes, eq(clientes.id, obras.clienteId))
      .where(and(eq(etapas.estado, 'en_curso'), eq(obras.estado, 'en_curso'), sql`${etapas.fechaPrevista} < ${hoy}`))
      .orderBy(asc(etapas.fechaPrevista)),
    db
      .select({ etapaId: etapas.id, etapa: etapas.nombre, orden: etapas.orden, fechaPrevista: etapas.fechaPrevista, obraId: obras.id, numero: obras.numero, direccion: obras.direccion, clienteNombre: clientes.nombre })
      .from(etapas)
      .innerJoin(obras, eq(obras.id, etapas.obraId))
      .innerJoin(clientes, eq(clientes.id, obras.clienteId))
      .where(and(ne(etapas.estado, 'completa'), eq(obras.estado, 'en_curso'), gte(etapas.fechaPrevista, hoy), lte(etapas.fechaPrevista, enUnaSemana)))
      .orderBy(asc(etapas.fechaPrevista)),
    db
      .select({ moneda: presupuestos.moneda, n: sql<number>`count(*)::int`, total: sql<number>`coalesce(sum(${presupuestos.monto}), 0)::float` })
      .from(presupuestos)
      .where(inArray(presupuestos.estado, ESTADOS_ACTIVOS))
      .groupBy(presupuestos.moneda),
    db.select({ n: sql<number>`count(*)::int` }).from(obras).where(eq(obras.estado, 'en_curso')),
  ])

  return {
    hoy,
    seguimientos,
    sinProximoPaso,
    etapasAtrasadas,
    etapasSemana,
    enJuego: { cantidad: totales.reduce((a, t) => a + t.n, 0), porMoneda: totales.filter((t) => t.total > 0) },
    obrasEnCurso: obrasEnCurso[0]?.n ?? 0,
  }
}

export async function hayDatos() {
  const [p] = await db.select({ n: sql<number>`count(*)::int` }).from(presupuestos)
  const [o] = await db.select({ n: sql<number>`count(*)::int` }).from(obras)
  return (p?.n ?? 0) + (o?.n ?? 0) > 0
}
