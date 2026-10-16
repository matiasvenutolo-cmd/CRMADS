import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { COOKIE_SESION, verificarSesion } from '@/lib/auth/jwt'

const TIPOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'application/acad', 'image/vnd.dwg', 'application/octet-stream']

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const respuesta = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const jar = await cookies()
        if (!(await verificarSesion(jar.get(COOKIE_SESION)?.value))) throw new Error('No autorizado')
        return { allowedContentTypes: TIPOS, maximumSizeInBytes: 60 * 1024 * 1024, addRandomSuffix: true }
      },
    })
    return NextResponse.json(respuesta)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }
}
