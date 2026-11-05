import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { clientes, presupuestos } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'
import { getCatalogo, getCotizacion } from '@/lib/data/cotizador'
import { armarDocumento } from '@/lib/cotizador/documento'
import { documentoPdf } from '@/lib/cotizador/pdf'
import { documentoWord } from '@/lib/cotizador/word'
import { etiquetaPresupuesto } from '@/lib/dominio'

// Descarga del presupuesto armado con el cotizador: /cotizacion/<id>/pdf o /cotizacion/<id>/word.
export async function GET(request: Request, { params }: { params: Promise<{ id: string; formato: string }> }) {
  await getUsuarioActual()
  const { id, formato } = await params
  if (!/^[0-9a-f-]{36}$/.test(id) || !['pdf', 'word'].includes(formato)) return new Response('No encontrado', { status: 404 })
  const [p, cot, cat] = await Promise.all([db.query.presupuestos.findFirst({ where: eq(presupuestos.id, id) }), getCotizacion(id), getCatalogo()])
  if (!p || !cot) return new Response('No encontrado', { status: 404 })
  const cliente = await db.query.clientes.findFirst({ where: eq(clientes.id, p.clienteId), columns: { nombre: true } })

  const numero = etiquetaPresupuesto(p).replace(/^ADS /, 'ADS – ')
  const doc = armarDocumento(cot.datos, { numero, cliente: cliente?.nombre ?? '', iva: cat.config.iva })
  const nombre = `Presupuesto ${etiquetaPresupuesto(p)}`
  const enLinea = new URL(request.url).searchParams.has('ver')

  if (formato === 'pdf') {
    const buf = await documentoPdf(doc)
    return new Response(new Uint8Array(buf), {
      headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `${enLinea ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(nombre)}.pdf`, 'Cache-Control': 'private, no-store' },
    })
  }
  const buf = await documentoWord(doc)
  return new Response(new Uint8Array(buf), {
    headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(nombre)}.docx`, 'Cache-Control': 'private, no-store' },
  })
}
