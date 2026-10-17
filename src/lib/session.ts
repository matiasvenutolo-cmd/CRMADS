import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { usuarios, type Usuario } from '@/lib/db/schema'
import { COOKIE_SESION, firmarSesion, verificarSesion } from '@/lib/auth/jwt'

const MAX_AGE = 60 * 60 * 24 * 30

export async function crearSesion(usuarioId: string) {
  const jar = await cookies()
  jar.set(COOKIE_SESION, await firmarSesion(usuarioId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export async function destruirSesion() {
  const jar = await cookies()
  jar.delete(COOKIE_SESION)
}

// El proxy sólo valida la firma; acá se confirma contra la base que el usuario siga activo.
export const getUsuarioActual = cache(async (): Promise<Usuario> => {
  const jar = await cookies()
  const sesion = await verificarSesion(jar.get(COOKIE_SESION)?.value)
  const usuario = sesion ? await db.query.usuarios.findFirst({ where: eq(usuarios.id, sesion.usuarioId) }) : undefined
  if (!usuario || !usuario.activo) redirect('/salir')
  return usuario
})
