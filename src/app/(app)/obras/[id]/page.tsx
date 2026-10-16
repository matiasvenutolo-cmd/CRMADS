import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getObra } from '@/lib/data/obras'
import { codigoObra, codigoPresupuesto } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { fechaCorta, hoyISO } from '@/lib/fechas'
import { PageHead, Codigo } from '@/components/comun/page-head'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { Bitacora } from '@/components/comun/bitacora'
import { Composer } from '@/components/comun/composer'
import { Archivos } from '@/components/comun/archivos'
import { ContactoRapido } from '@/components/comun/contacto-rapido'
import { Recorrido } from '@/components/obra/recorrido'
import { EtapaActual } from '@/components/obra/etapa-actual'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const o = await getObra((await params).id)
  return { title: o ? `${o.direccion} · ${codigoObra(o.numero)}` : 'Obra' }
}

export default async function ObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const o = await getObra(id)
  if (!o) notFound()
  const hoy = hoyISO()

  const historial = o.historial.map((h) => ({ ...h, origen: h.obraId ? undefined : 'presupuesto' }))
  const ficha = [
    ['Tipología', o.tipologia],
    ['Equipos', String(o.cantidadEquipos)],
    ['Carga', o.cargaKg ? `${o.cargaKg} kg` : null],
    ['Paradas', o.paradas ? String(o.paradas) : null],
    ['Velocidad', o.velocidad],
    ['Inicio', fechaCorta(o.fechaInicio)],
    ['Puesta en marcha estimada', o.fechaFinEstimada ? fechaCorta(o.fechaFinEstimada) : null],
  ].filter((f): f is [string, string] => Boolean(f[1]))

  return (
    <div>
      <PageHead
        volver={{ href: '/obras', label: 'Obras' }}
        antetitulo={
          <>
            <Link href={`/clientes/${o.cliente.id}`} className="font-medium text-ink-2 hover:text-ink hover:underline">
              {o.cliente.nombre}
            </Link>
            <span aria-hidden>·</span>
            <Codigo>{codigoObra(o.numero)}</Codigo>
            {o.presupuesto && (
              <>
                <span aria-hidden>·</span>
                <Link href={`/presupuestos/${o.presupuesto.id}`} className="hover:text-ink hover:underline">
                  desde <span className="font-mono text-[12px]">{codigoPresupuesto(o.presupuesto.numero)}</span>
                </Link>
              </>
            )}
          </>
        }
        titulo={
          <>
            {o.direccion}
            {o.localidad && <span className="text-ink-3">, {o.localidad}</span>}
          </>
        }
      />

      <EtapaActual obra={o} etapas={o.etapas} hoy={hoy} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="order-2 flex flex-col gap-5 lg:order-none">
          <Surface>
            <SurfaceHeader titulo="Recorrido de la obra" accion={<span className="text-[12.5px] text-ink-3">{o.resumen.completas} de {o.resumen.total}</span>} />
            <div className="px-4 py-2.5">
              <Recorrido obraId={o.id} etapas={o.etapas} hoy={hoy} />
            </div>
          </Surface>
          <Surface>
            <SurfaceHeader titulo="Ficha técnica" />
            <dl className="divide-y divide-line">
              {ficha.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-2.5 text-[13.5px]">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
              {o.presupuesto?.monto != null && (
                <div className="flex justify-between gap-4 px-5 py-2.5 text-[13.5px]">
                  <dt className="text-ink-3">Monto presupuestado</dt>
                  <dd className="tabular text-right font-medium text-ink">{dinero(o.presupuesto.monto, o.presupuesto.moneda)}</dd>
                </div>
              )}
            </dl>
          </Surface>
          <Surface>
            <SurfaceHeader titulo="Cliente" />
            <div className="px-5 py-4">
              <p className="text-[15px] font-medium text-ink">{o.cliente.nombre}</p>
              {o.cliente.contacto && <p className="text-[13.5px] text-ink-2">{o.cliente.contacto}</p>}
              <ContactoRapido telefono={o.cliente.telefono} email={o.cliente.email} />
            </div>
          </Surface>
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-8 lg:order-none">
          <section>
            <h2 className="mb-3 font-serif text-[24px] text-ink">Fotos y archivos</h2>
            <Surface className="p-4">
              <Archivos destino={{ obraId: o.id }} archivos={o.adjuntos} />
            </Surface>
          </section>
          <section>
            <h2 className="mb-3 font-serif text-[24px] text-ink">Bitácora</h2>
            <div className="mb-6">
              <Composer destino={{ obraId: o.id }} hoy={hoy} />
            </div>
            <Bitacora items={historial} />
          </section>
          {o.notas && (
            <Surface>
              <SurfaceHeader titulo="Notas" />
              <p className="whitespace-pre-line px-5 py-4 text-[14px] leading-relaxed text-ink-2">{o.notas}</p>
            </Surface>
          )}
        </div>
      </div>
    </div>
  )
}
