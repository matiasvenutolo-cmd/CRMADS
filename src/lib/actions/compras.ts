'use server'

import { and, count, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { compras, obras } from '@/lib/db/schema'
import { requerirEdicion } from '@/lib/session'
import { fechaCorta } from '@/lib/fechas'
import { fechaOpcional, registrarEvento, textoLimpio, type Resultado } from './comun'

const MAX_PROVEEDORES = 10

export type CompraInput = { proveedor: string; detalle?: string; compraPrevista?: string; fechaCompra?: string; finProduccion?: string }

export async function guardarCompra(obraId: string, id: string | null, input: CompraInput): Promise<Resultado> {
  const u = await requerirEdicion()
  const proveedor = textoLimpio(input.proveedor)
  if (!proveedor) return { ok: false, error: 'Falta el proveedor.' }
  const datos = {
    proveedor,
    detalle: textoLimpio(input.detalle),
    compraPrevista: fechaOpcional(input.compraPrevista),
    fechaCompra: fechaOpcional(input.fechaCompra),
    finProduccion: fechaOpcional(input.finProduccion),
  }
  if (!id) {
    const [{ n }] = await db.select({ n: count() }).from(compras).where(eq(compras.obraId, obraId))
    if (n >= MAX_PROVEEDORES) return { ok: false, error: `Hasta ${MAX_PROVEEDORES} proveedores por obra.` }
  }

  await db.transaction(async (tx) => {
    if (id) await tx.update(compras).set(datos).where(and(eq(compras.id, id), eq(compras.obraId, obraId)))
    else await tx.insert(compras).values({ ...datos, obraId })
    await tx.update(obras).set({ updatedAt: new Date() }).where(eq(obras.id, obraId))
    const partes = [
      datos.detalle,
      datos.fechaCompra ? `comprado el ${fechaCorta(datos.fechaCompra)}` : datos.compraPrevista && `comprar antes del ${fechaCorta(datos.compraPrevista)}`,
      datos.finProduccion && `producción lista ~${fechaCorta(datos.finProduccion)}`,
    ].filter(Boolean)
    await registrarEvento(tx, { obraId, tipo: 'sistema', texto: `Compra ${id ? 'actualizada' : 'cargada'} · ${proveedor}${partes.length ? `: ${partes.join(' · ')}` : ''}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function eliminarCompra(obraId: string, id: string): Promise<Resultado> {
  const u = await requerirEdicion()
  const [c] = await db.delete(compras).where(and(eq(compras.id, id), eq(compras.obraId, obraId))).returning({ proveedor: compras.proveedor })
  if (!c) return { ok: false, error: 'No existe esa compra.' }
  await registrarEvento(db, { obraId, tipo: 'sistema', texto: `Compra eliminada · ${c.proveedor}`, usuarioId: u.id })
  revalidatePath('/', 'layout')
  return { ok: true }
}
