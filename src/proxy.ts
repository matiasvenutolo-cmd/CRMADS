import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE_SESION, verificarSesion } from '@/lib/auth/jwt'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/salir') return NextResponse.next()
  const sesion = await verificarSesion(request.cookies.get(COOKIE_SESION)?.value)

  if (pathname === '/login') {
    return sesion ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }
  if (!sesion) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|logo/).*)'],
}
