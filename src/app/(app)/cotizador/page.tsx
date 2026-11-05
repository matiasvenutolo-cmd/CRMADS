import type { Metadata } from 'next'
import Link from 'next/link'
import { desc, eq, inArray } from 'drizzle-orm'
import { ArrowRight } from 'lucide-react'
import { db } from '@/lib/db/client'
import { clientes, cotizaciones, presupuestos } from '@/lib/db/schema'
import { calcular, type Cotizacion } from '@/lib/cotizador/modelo'
import { etiquetaPresupuesto } from '@/lib/dominio'
import { momento } from '@/lib/fechas'
import { PageHead, Codigo } from '@/components/comun/page-head'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { BotonNuevoConCotizador } from '@/components/cotizador/boton-nuevo'

export const metadata: Metadata = { title: 'Cotizador online' }

const usd = (v: number) => `US$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v))}`

export default async function CotizadorInicio() {
  const [hechas, sinCotizar] = await Promise.all([
    db
      .select({ id: presupuestos.id, numero: presupuestos.numero, numeroAds: presupuestos.numeroAds, version: presupuestos.version, direccion: presupuestos.direccion, cliente: clientes.nombre, datos: cotizaciones.datos, updatedAt: cotizaciones.updatedAt })
      .from(cotizaciones)
      .innerJoin(presupuestos, eq(presupuestos.id, cotizaciones.presupuestoId))
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
      .orderBy(desc(cotizaciones.updatedAt))
      .limit(20),
    db
      .select({ id: presupuestos.id, numero: presupuestos.numero, numeroAds: presupuestos.numeroAds, version: presupuestos.version, direccion: presupuestos.direccion, cliente: clientes.nombre })
      .from(presupuestos)
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId))
      .where(inArray(presupuestos.estado, ['borrador', 'enviado', 'negociacion']))
      .orderBy(desc(presupuestos.createdAt))
      .limit(8),
  ])
  const yaCotizados = new Set(hechas.map((h) => h.id))

  return (
    <div>
      <PageHead
        antetitulo={<span className="rounded-full bg-naranja/15 px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-wide text-warn">Nuevo</span>}
        titulo="Cotizador online"
        descripcion="Lo que antes se hacía en el Excel y el Word, ahora en el sistema: costos, precio y el presupuesto listo para mandar."
        acciones={
          <>
            <Link href="/cotizador/precios" className="mr-2 text-[13.5px] font-medium text-ink-3 hover:text-ink">
              Precios y textos
            </Link>
            <BotonNuevoConCotizador />
          </>
        }
      />

      <ol className="mb-8 grid gap-3 md:grid-cols-4">
        {[
          ['Equipo', 'Tipo, paradas y la ficha técnica. Arranca con los valores de siempre.'],
          ['Costos', 'Precio de lista, puertas, adicionales, fletes y mano de obra, como en el Excel.'],
          ['Precio', 'Coeficiente y redondeo: precio sugerido, costo y margen en vivo.'],
          ['Documento', 'Los textos de siempre, editables. Sale en Word y en PDF.'],
        ].map(([t, d], i) => (
          <li key={t} className="rounded-surface border border-line bg-surface p-4 shadow-surface">
            <span className="flex size-9 items-center justify-center rounded-[9px] bg-brand font-mono text-[13px] text-white">{String(i + 1).padStart(2, '0')}</span>
            <p className="mt-3 font-serif text-[20px] leading-none text-ink">{t}</p>
            <p className="mt-1.5 text-[13px] text-ink-3">{d}</p>
          </li>
        ))}
      </ol>

      <div className="grid gap-5 lg:grid-cols-2">
        <Surface>
          <SurfaceHeader titulo={`Cotizaciones${hechas.length ? ` · ${hechas.length}` : ''}`} />
          {hechas.length === 0 ? (
            <p className="px-5 py-5 text-[14px] text-ink-3">Todavía no se armó ninguna. Probá con un presupuesto nuevo o con uno de la derecha.</p>
          ) : (
            <ul className="divide-y divide-line">
              {hechas.map((h) => {
                const r = calcular(h.datos as Cotizacion)
                return (
                  <li key={h.id}>
                    <Link href={`/presupuestos/${h.id}/cotizador`} className="group flex items-center gap-3 px-5 py-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium text-ink group-hover:underline">{h.direccion}</span>
                        <span className="flex gap-2 text-[12.5px] text-ink-3">
                          <Codigo>{etiquetaPresupuesto(h)}</Codigo> {h.cliente} · {momento(h.updatedAt).toLowerCase()}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-medium tabular text-ink">{usd(r.total)}</span>
                        <span className="block text-[12px] text-ink-3">margen {Math.round(r.margenPct * 100)}%</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </Surface>
        <Surface>
          <SurfaceHeader titulo="Cotizar uno en curso" />
          <ul className="divide-y divide-line">
            {sinCotizar
              .filter((p) => !yaCotizados.has(p.id))
              .map((p) => (
                <li key={p.id}>
                  <Link href={`/presupuestos/${p.id}/cotizador`} className="group flex items-center gap-3 px-5 py-3.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14.5px] font-medium text-ink group-hover:underline">{p.direccion}</span>
                      <span className="flex gap-2 text-[12.5px] text-ink-3">
                        <Codigo>{etiquetaPresupuesto(p)}</Codigo> {p.cliente}
                      </span>
                    </span>
                    <ArrowRight className="size-4 text-ink-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
          </ul>
        </Surface>
      </div>
    </div>
  )
}
