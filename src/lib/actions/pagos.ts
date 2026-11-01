'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { obras, pagos } from '@/lib/db/schema'
import { requerirEdicion } from '@/lib/session'
import { ETAPAS_OBRA, MEDIOS_PAGO } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { fechaCorta } from '@/lib/fechas'
import { fechaOpcional, registrarEvento, textoLimpio, type Resultado } from './comun'

export type PagoInput = { concepto: string; medio?: string; monto?: string; moneda?: string; fechaPrevista?: string; etapaOrden?: string; fechaCobro?: string; notas?: string }

export async function guardarPago(obraId: string, id: string | null, input: PagoInput): Promise<Resultado> {
  const u = await requerirEdicion()
  const concepto = textoLimpio(input.concepto)
  if (!concepto) return { ok: false, error: 'Poné un concepto: anticipo, cuota 1, canje…' }
  const monto = input.monto ? Number(String(input.monto).replace(/\./g, '').replace(',', '.')) : null
  if (monto != null && (!Number.isFinite(monto) || monto < 0)) return { ok: false, error: 'Monto no válido.' }
  const etapa = Number(input.etapaOrden) || null
  const datos = {
    concepto,
    medio: input.medio && (MEDIOS_PAGO as readonly string[]).includes(input.medio) ? input.medio : null,
    monto,
    moneda: input.moneda === 'USD' ? 'USD' : 'ARS',
    fechaPrevista: fechaOpcional(input.fechaPrevista),
    etapaOrden: etapa && etapa >= 1 && etapa <= ETAPAS_OBRA.length ? etapa : null,
    fechaCobro: fechaOpcional(input.fechaCobro),
    notas: textoLimpio(input.notas),
  }

  await db.transaction(async (tx) => {
    if (id) await tx.update(pagos).set(datos).where(and(eq(pagos.id, id), eq(pagos.obraId, obraId)))
    else await tx.insert(pagos).values({ ...datos, obraId })
    await tx.update(obras).set({ updatedAt: new Date() }).where(eq(obras.id, obraId))
    const partes = [
      datos.monto != null && dinero(datos.monto, datos.moneda),
      datos.medio,
      datos.fechaCobro ? `cobrado el ${fechaCorta(datos.fechaCobro)}` : datos.fechaPrevista ? `previsto el ${fechaCorta(datos.fechaPrevista)}` : datos.etapaOrden && `al completar «${ETAPAS_OBRA[datos.etapaOrden - 1]}»`,
    ].filter(Boolean)
    await registrarEvento(tx, { obraId, tipo: 'sistema', texto: `Pago ${id ? 'actualizado' : 'cargado'} · ${concepto}${partes.length ? `: ${partes.join(' · ')}` : ''}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function eliminarPago(obraId: string, id: string): Promise<Resultado> {
  const u = await requerirEdicion()
  const [p] = await db.delete(pagos).where(and(eq(pagos.id, id), eq(pagos.obraId, obraId))).returning({ concepto: pagos.concepto })
  if (!p) return { ok: false, error: 'No existe ese pago.' }
  await registrarEvento(db, { obraId, tipo: 'sistema', texto: `Pago eliminado · ${p.concepto}`, usuarioId: u.id })
  revalidatePath('/', 'layout')
  return { ok: true }
}
