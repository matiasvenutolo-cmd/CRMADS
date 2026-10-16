import { SignJWT, jwtVerify } from 'jose'

export const COOKIE_SESION = 'ads_sesion'

function clave() {
  const secret = process.env.AUTH_SECRET
  if (!secret) throw new Error('Falta AUTH_SECRET en el entorno')
  return new TextEncoder().encode(secret)
}

export async function firmarSesion(usuarioId: string): Promise<string> {
  return new SignJWT({ usuarioId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(clave())
}

export async function verificarSesion(token: string | undefined): Promise<{ usuarioId: string } | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ['HS256'] })
    return typeof payload.usuarioId === 'string' ? { usuarioId: payload.usuarioId } : null
  } catch {
    return null
  }
}
