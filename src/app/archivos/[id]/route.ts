import { get } from '@vercel/blob'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { archivos } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'

// Los archivos viven en un store privado: sólo se sirven con sesión iniciada.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await getUsuarioActual()
  const { id } = await params
  const a = await db.query.archivos.findFirst({ where: eq(archivos.id, id) })
  if (!a) return new Response('No encontrado', { status: 404 })

  const url = new URL(request.url)
  const miniatura = url.searchParams.has('mini') && a.thumbPathname
  const blob = await get(miniatura ? a.thumbPathname! : a.pathname, { access: 'private' })
  if (!blob || blob.statusCode !== 200) return new Response('No encontrado', { status: 404 })

  const descargar = url.searchParams.has('descargar')
  return new Response(blob.stream, {
    headers: {
      'Content-Type': blob.blob.contentType,
      'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': `${descargar ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(a.nombre)}`,
    },
  })
}
