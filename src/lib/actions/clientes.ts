'use server'

import { asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { clientes } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'
import { textoLimpio, type Resultado } from './comun'

export type ClienteInput = { nombre: string; contacto?: string; telefono?: string; email?: string; cuit?: string; notas?: string }

function limpiar(i: ClienteInput) {
  return {
    nombre: textoLimpio(i.nombre),
    contacto: textoLimpio(i.contacto),
    telefono: textoLimpio(i.telefono),
    email: textoLimpio(i.email),
    cuit: textoLimpio(i.cuit),
    notas: textoLimpio(i.notas),
  }
}

export async function crearCliente(input: ClienteInput): Promise<Resultado<{ id: string }>> {
  await getUsuarioActual()
  const datos = limpiar(input)
  if (!datos.nombre) return { ok: false, error: 'El nombre del cliente es obligatorio.' }
  const [c] = await db.insert(clientes).values({ ...datos, nombre: datos.nombre }).returning({ id: clientes.id })
  revalidatePath('/clientes')
  return { ok: true, data: { id: c.id } }
}

export async function editarCliente(id: string, input: ClienteInput): Promise<Resultado> {
  await getUsuarioActual()
  const datos = limpiar(input)
  if (!datos.nombre) return { ok: false, error: 'El nombre del cliente es obligatorio.' }
  await db.update(clientes).set({ ...datos, nombre: datos.nombre, updatedAt: new Date() }).where(eq(clientes.id, id))
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function opcionesDeClientes(): Promise<{ id: string; nombre: string }[]> {
  await getUsuarioActual()
  return db.select({ id: clientes.id, nombre: clientes.nombre }).from(clientes).orderBy(asc(clientes.nombre))
}
