import 'server-only'
import { asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { clientes, etapas, obras, presupuestos } from '@/lib/db/schema'
import { resumirEtapas } from './obras'

export async function listarClientes(q?: string) {
  return db
    .select({
      id: clientes.id,
      nombre: clientes.nombre,
      contacto: clientes.contacto,
      telefono: clientes.telefono,
      presupuestos: sql<number>`(select count(*)::int from ${presupuestos} where ${presupuestos.clienteId} = ${clientes.id})`,
      activos: sql<number>`(select count(*)::int from ${presupuestos} where ${presupuestos.clienteId} = ${clientes.id} and ${presupuestos.estado} in ('borrador','enviado','negociacion'))`,
      obras: sql<number>`(select count(*)::int from ${obras} where ${obras.clienteId} = ${clientes.id})`,
    })
    .from(clientes)
    .where(q?.trim() ? ilike(clientes.nombre, `%${q.trim()}%`) : undefined)
    .orderBy(asc(clientes.nombre))
}

export async function getCliente(id: string) {
  const c = await db.query.clientes.findFirst({ where: eq(clientes.id, id) })
  if (!c) return null
  const [listaPresupuestos, listaObras] = await Promise.all([
    db.select().from(presupuestos).where(eq(presupuestos.clienteId, id)).orderBy(desc(presupuestos.createdAt)),
    db.select().from(obras).where(eq(obras.clienteId, id)).orderBy(desc(obras.createdAt)),
  ])
  const etapasObras = listaObras.length ? await db.select().from(etapas).where(inArray(etapas.obraId, listaObras.map((o) => o.id))) : []
  return {
    ...c,
    presupuestos: listaPresupuestos,
    obras: listaObras.map((o) => ({ ...o, resumen: resumirEtapas(etapasObras.filter((e) => e.obraId === o.id)) })),
  }
}
