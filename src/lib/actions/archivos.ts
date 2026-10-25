'use server'

import { eq } from 'drizzle-orm'
import { del } from '@vercel/blob'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { archivos, presupuestos } from '@/lib/db/schema'
import { numeroAdsDeArchivo } from '@/lib/dominio'
import { getUsuarioActual } from '@/lib/session'
import { registrarEvento, type Resultado } from './comun'

export type ArchivoSubido = { nombre: string; pathname: string; thumbPathname?: string | null; contentType: string; tamano: number }

export async function registrarArchivos(destino: { presupuestoId?: string; obraId?: string }, lista: ArchivoSubido[]): Promise<Resultado> {
  const u = await getUsuarioActual()
  if (!destino.presupuestoId && !destino.obraId) return { ok: false, error: 'Falta el destino del archivo.' }
  if (!lista.length) return { ok: true }
  await db.transaction(async (tx) => {
    await tx.insert(archivos).values(
      lista.map((a) => ({
        presupuestoId: destino.presupuestoId ?? null,
        obraId: destino.obraId ?? null,
        nombre: a.nombre.slice(0, 200),
        pathname: a.pathname,
        thumbPathname: a.thumbPathname ?? null,
        contentType: a.contentType,
        tamano: a.tamano,
        usuarioId: u.id,
      }))
    )
    if (destino.presupuestoId) {
      const p = await tx.query.presupuestos.findFirst({ where: eq(presupuestos.id, destino.presupuestoId), columns: { numeroAds: true } })
      const numeros = [...new Set(lista.map((a) => numeroAdsDeArchivo(a.nombre)).filter((n): n is string => Boolean(n)))]
      if (p && !p.numeroAds && numeros.length === 1) {
        await tx.update(presupuestos).set({ numeroAds: numeros[0] }).where(eq(presupuestos.id, destino.presupuestoId))
        await registrarEvento(tx, { presupuestoId: destino.presupuestoId, tipo: 'sistema', texto: `N° ADS ${numeros[0]}, tomado del nombre del archivo`, usuarioId: u.id })
      }
    }
    const fotos = lista.filter((a) => a.contentType.startsWith('image/')).length
    const docs = lista.length - fotos
    const partes = [fotos && `${fotos} foto${fotos > 1 ? 's' : ''}`, docs && `${docs} archivo${docs > 1 ? 's' : ''}`].filter(Boolean)
    await registrarEvento(tx, { ...destino, tipo: 'archivo', texto: `Se subieron ${partes.join(' y ')}: ${lista.map((a) => a.nombre).join(', ')}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function eliminarArchivo(id: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  const a = await db.query.archivos.findFirst({ where: eq(archivos.id, id) })
  if (!a) return { ok: false, error: 'No existe el archivo.' }
  await del([a.pathname, ...(a.thumbPathname ? [a.thumbPathname] : [])])
  await db.delete(archivos).where(eq(archivos.id, id))
  await registrarEvento(db, { presupuestoId: a.presupuestoId, obraId: a.obraId, tipo: 'archivo', texto: `Se eliminó ${a.nombre}`, usuarioId: u.id })
  revalidatePath('/', 'layout')
  return { ok: true }
}
