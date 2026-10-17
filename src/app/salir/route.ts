import { NextResponse } from 'next/server'
import { COOKIE_SESION } from '@/lib/auth/jwt'

// Sesión firmada pero de un usuario borrado o desactivado: se limpia la cookie
// para no quedar rebotando entre / y /login.
export function GET(request: Request) {
  const res = NextResponse.redirect(new URL('/login', request.url))
  res.cookies.delete(COOKIE_SESION)
  return res
}
