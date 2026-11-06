import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPresupuesto } from '@/lib/data/presupuestos'
import { getCatalogo, getCotizacion } from '@/lib/data/cotizador'
import { nuevaCotizacion } from '@/lib/cotizador/nueva'
import { etiquetaPresupuesto } from '@/lib/dominio'
import { hoyISO, momento } from '@/lib/fechas'
import { PageHead, Codigo } from '@/components/comun/page-head'
import { EditorCotizacion } from '@/components/cotizador/editor'

export const metadata: Metadata = { title: 'Cotizador' }

export default async function CotizadorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const [p, cot, catalogo] = await Promise.all([getPresupuesto(id), getCotizacion(id), getCatalogo()])
  if (!p) notFound()
  const inicial = cot?.datos ?? nuevaCotizacion(catalogo, p, p.cliente, hoyISO())

  return (
    <div>
      <PageHead
        volver={{ href: `/presupuestos/${p.id}`, label: etiquetaPresupuesto(p) }}
        antetitulo={
          <>
            <span className="rounded-full bg-naranja/15 px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-warn">Nuevo</span>
            <span className="font-medium text-ink-2">Cotizador online</span>
            <span aria-hidden>·</span>
            <Link href={`/clientes/${p.cliente.id}`} className="hover:text-ink hover:underline">
              {p.cliente.nombre}
            </Link>
            <Codigo>{etiquetaPresupuesto(p)}</Codigo>
          </>
        }
        titulo={
          <>
            {p.direccion}
            {p.localidad && <span className="text-ink-3">, {p.localidad}</span>}
          </>
        }
        descripcion={cot?.datos.origen?.tipo === 'importada' ? 'Sólo para ver: la cotización de este presupuesto armada con su Excel y su Word.' : cot ? `Guardada ${momento(cot.updatedAt).toLowerCase()}${cot.autor ? ` · ${cot.autor}` : ''}` : 'Armá la cotización acá y descargá el presupuesto en Word o PDF. Arranca con los valores de siempre: revisalos y ajustá lo que haga falta.'}
        acciones={
          <Link href="/cotizador/precios" className="text-[13.5px] font-medium text-ink-3 hover:text-ink">
            Precios y textos →
          </Link>
        }
      />
      <EditorCotizacion
        presupuesto={{ id: p.id, etiqueta: etiquetaPresupuesto(p), direccion: p.direccion, localidad: p.localidad, monto: p.monto, moneda: p.moneda }}
        inicial={inicial}
        guardada={Boolean(cot)}
        catalogo={catalogo}
      />
    </div>
  )
}
