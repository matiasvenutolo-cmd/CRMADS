'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db/client'
import { usuarios } from '@/lib/db/schema'
import { hashPassword, verifyPassword } from '@/lib/auth/hash'
import { crearSesion, destruirSesion, getUsuarioActual } from '@/lib/session'

export async function iniciarSesion(_prev: { error?: string; usuario?: string } | undefined, form: FormData): Promise<{ error?: string; usuario?: string }> {
  const usuario = String(form.get('usuario') ?? '').trim().toLowerCase()
  const password = String(form.get('password') ?? '')
  if (!usuario || !password) return { error: 'Completá usuario y contraseña.', usuario }

  const u = await db.query.usuarios.findFirst({ where: eq(usuarios.usuario, usuario) })
  const ok = u && u.activo && (await verifyPassword(password, u.passwordHash))
  if (!ok) return { error: 'Usuario o contraseña incorrectos.', usuario }

  await crearSesion(u.id)
  redirect('/')
}

export async function cerrarSesion() {
  await destruirSesion()
  redirect('/login')
}

export async function cambiarPassword(actual: string, nueva: string): Promise<{ ok: boolean; error?: string }> {
  const u = await getUsuarioActual()
  if (!(await verifyPassword(actual, u.passwordHash))) return { ok: false, error: 'La contraseña actual no es correcta.' }
  if (nueva.length < 8) return { ok: false, error: 'La nueva contraseña tiene que tener al menos 8 caracteres.' }
  await db.update(usuarios).set({ passwordHash: await hashPassword(nueva) }).where(eq(usuarios.id, u.id))
  return { ok: true }
}
