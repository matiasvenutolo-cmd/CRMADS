'use server'

import { ilike, or, sql, eq, desc } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { clientes, obras, presupuestos } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'
import { codigoObra, etiquetaPresupuesto } from '@/lib/dominio'

export type ResultadoBusqueda = { tipo: 'presupuesto' | 'obra' | 'cliente'; id: string; titulo: string; detalle: string; href: string }

export async function buscar(q: string): Promise<ResultadoBusqueda[]> {
  await getUsuarioActual()
  const t = q.trim()
  if (t.length < 2) return []
  const like = `%${t}%`

  const [ps, os, cs] = await Promise.all([
    db
      .select({ id: presupuestos.id, numero: presupuestos.numero, numeroAds: presupuestos.numeroAds, direccion: presupuestos.direccion, cliente: clientes.nombre })
      .from(presupuestos)
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
      .where(or(ilike(presupuestos.direccion, like), ilike(clientes.nombre, like), sql`'P-' || lpad(${presupuestos.numero}::text, 4, '0') ilike ${like}`, sql`'ADS ' || ${presupuestos.numeroAds} ilike ${like}`, sql`${presupuestos.numeroAds} ilike ${`%${t.replace(/^ads[\s\-_.]*/i, '')}%`}`))
      .orderBy(desc(presupuestos.updatedAt))
      .limit(6),
    db
      .select({ id: obras.id, numero: obras.numero, direccion: obras.direccion, cliente: clientes.nombre })
      .from(obras)
      .innerJoin(clientes, eq(clientes.id, obras.clienteId))
      .where(or(ilike(obras.direccion, like), ilike(clientes.nombre, like), sql`'O-' || lpad(${obras.numero}::text, 4, '0') ilike ${like}`))
      .orderBy(desc(obras.updatedAt))
      .limit(6),
    db.select({ id: clientes.id, nombre: clientes.nombre, contacto: clientes.contacto }).from(clientes).where(or(ilike(clientes.nombre, like), ilike(clientes.contacto, like))).limit(5),
  ])

  return [
    ...os.map((o) => ({ tipo: 'obra' as const, id: o.id, titulo: o.direccion, detalle: `${codigoObra(o.numero)} · ${o.cliente}`, href: `/obras/${o.id}` })),
    ...ps.map((p) => ({ tipo: 'presupuesto' as const, id: p.id, titulo: p.direccion, detalle: `${etiquetaPresupuesto(p)} · ${p.cliente}`, href: `/presupuestos/${p.id}` })),
    ...cs.map((c) => ({ tipo: 'cliente' as const, id: c.id, titulo: c.nombre, detalle: c.contacto ?? 'Cliente', href: `/clientes/${c.id}` })),
  ]
}
