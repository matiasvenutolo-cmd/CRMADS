import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { ContactoRapido } from '@/components/comun/contacto-rapido'
import { getPresupuesto } from '@/lib/data/presupuestos'
import { codigoObra, codigoPresupuesto, etiquetaPresupuesto, velocidadLegible } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { fechaCorta, hoyISO } from '@/lib/fechas'
import { PageHead, Codigo } from '@/components/comun/page-head'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { EstadoPresupuestoLabel } from '@/components/ui/estado'
import { Bitacora } from '@/components/comun/bitacora'
import { Composer } from '@/components/comun/composer'
import { Archivos } from '@/components/comun/archivos'
import { AccionesPresupuesto, SelectorEstado } from '@/components/presupuesto/acciones'
import { FechaAprobacionEditable, FechaEnvioEditable, SeguimientoEditable } from '@/components/presupuesto/seguimiento-editable'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = await getPresupuesto((await params).id)
  return { title: p ? etiquetaPresupuesto(p) : 'Presupuesto' }
}

export default async function PresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const p = await getPresupuesto(id)
  if (!p) notFound()
  const hoy = hoyISO()
  const activo = ['borrador', 'enviado', 'negociacion'].includes(p.estado)
  const conCliente = { ...p, clienteNombre: p.cliente.nombre }

  return (
    <div>
      <PageHead
        volver={{ href: '/presupuestos', label: 'Presupuestos' }}
        antetitulo={
          <>
            <Link href={`/clientes/${p.cliente.id}`} className="font-medium text-ink-2 hover:text-ink hover:underline">
              {p.cliente.nombre}
            </Link>
            <span aria-hidden>·</span>
            <Codigo>{etiquetaPresupuesto(p)}</Codigo>
            {p.numeroAds && <Codigo>{codigoPresupuesto(p.numero)}</Codigo>}
          </>
        }
        titulo={
          <>
            {p.direccion}
            {p.localidad && <span className="text-ink-3">, {p.localidad}</span>}
          </>
        }
        acciones={<AccionesPresupuesto presupuesto={conCliente} hoy={hoy} />}
      />

      {p.obra && (
        <Link href={`/obras/${p.obra.id}`} className="group mb-6 flex items-center justify-between gap-4 rounded-surface border border-ok/20 bg-ok-soft px-5 py-4 transition-colors hover:border-ok/40">
          <span className="text-[14.5px] text-ok">
            <span className="font-medium">Ganado.</span> Este presupuesto es la obra <span className="font-mono text-[13px]">{codigoObra(p.obra.numero)}</span>.
          </span>
          <span className="flex items-center gap-1 text-[13.5px] font-medium text-ok">
            Ir a la obra <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}
      {p.estado === 'perdido' && (
        <div className="mb-6 rounded-surface border border-bad/15 bg-bad-soft px-5 py-4 text-[14.5px] text-bad">
          <span className="font-medium">Perdido</span>
          {p.motivoPerdida && ` · ${p.motivoPerdida}`}
        </div>
      )}

      <Surface className="mb-6 grid grid-cols-2 divide-line max-md:divide-y md:grid-cols-4 md:divide-x">
        <Dato etiqueta="Monto">
          <span className="font-serif text-[28px] leading-none text-ink">{p.monto == null ? <span className="text-ink-3">Sin monto</span> : dinero(p.monto, p.moneda)}</span>
          <span className="mt-1.5 block text-[12.5px] text-ink-3">{p.moneda === 'USD' ? 'Dólares' : 'Pesos'}</span>
        </Dato>
        <Dato etiqueta="Estado">
          <div className="pt-0.5">{activo ? <SelectorEstado presupuesto={conCliente} hoy={hoy} /> : <EstadoPresupuestoLabel estado={p.estado} className="text-[15px]" />}</div>
          {p.fechaEnvio ? <FechaEnvioEditable presupuestoId={p.id} fecha={p.fechaEnvio} hoy={hoy} /> : <span className="mt-2 block text-[12.5px] text-ink-3">Sin enviar</span>}
          {p.estado === 'ganado' && <FechaAprobacionEditable presupuestoId={p.id} fecha={p.fechaAprobacion} hoy={hoy} />}
        </Dato>
        <Dato etiqueta="Próximo seguimiento">{activo ? <SeguimientoEditable presupuestoId={p.id} fecha={p.proximoSeguimiento} hoy={hoy} /> : <span className="font-serif text-[26px] leading-none text-ink-3">—</span>}</Dato>
        <Dato etiqueta="Equipo">
          <span className="block text-[15px] font-medium leading-snug text-ink">{p.tipologia}</span>
          <span className="mt-1 block text-[12.5px] text-ink-3">
            {[p.cantidadEquipos > 1 ? `${p.cantidadEquipos} equipos` : '1 equipo', p.cargaKg && `${p.cargaKg} kg`, p.paradas && `${p.paradas} paradas`, velocidadLegible(p.velocidad)].filter(Boolean).join(' · ')}
          </span>
        </Dato>
      </Surface>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0">
          <h2 className="mb-3 font-serif text-[24px] text-ink">Seguimiento</h2>
          {activo && (
            <div className="mb-6">
              <Composer destino={{ presupuestoId: p.id }} hoy={hoy} seguimientoActual={p.proximoSeguimiento} />
            </div>
          )}
          <Bitacora items={p.historial} />
        </section>

        <aside className="flex flex-col gap-5">
          <Surface>
            <SurfaceHeader titulo="Cliente" accion={<Link href={`/clientes/${p.cliente.id}`} className="text-[13px] font-medium text-ink-3 hover:text-ink">Ver ficha</Link>} />
            <div className="px-5 py-4">
              <p className="text-[15px] font-medium text-ink">{p.cliente.nombre}</p>
              {p.cliente.contacto && <p className="text-[13.5px] text-ink-2">{p.cliente.contacto}</p>}
              <ContactoRapido telefono={p.cliente.telefono} email={p.cliente.email} />
            </div>
          </Surface>
          {p.versiones.length > 0 && (
            <Surface>
              <SurfaceHeader titulo="Versiones" accion={<span className="text-[12.5px] text-ink-3">{p.versiones.length + 1}</span>} />
              <ol className="divide-y divide-line">
                <li className="px-5 py-3">
                  <p className="flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className="font-mono font-semibold text-ink">{etiquetaPresupuesto(p)}</span>
                    <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[11.5px] font-medium text-ok">Vigente</span>
                  </p>
                  <p className="mt-0.5 text-[12.5px] text-ink-3">
                    {[p.fechaEnvio && `Enviada el ${fechaCorta(p.fechaEnvio)}`, p.monto != null && dinero(p.monto, p.moneda)].filter(Boolean).join(' · ')}
                  </p>
                </li>
                {p.versiones.map((v) => (
                  <li key={v.id} className="px-5 py-3">
                    <p className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="font-mono text-ink-2">{etiquetaPresupuesto({ numero: p.numero, numeroAds: p.numeroAds, version: v.version })}</span>
                      <span className="tabular text-ink-2">{v.monto != null ? dinero(v.monto, v.moneda) : 'Sin monto'}</span>
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-ink-3">
                      {[v.fechaEnvio && `Enviada el ${fechaCorta(v.fechaEnvio)}`, `${v.cantidadEquipos} eq.`, v.paradas && `${v.paradas} paradas`].filter(Boolean).join(' · ')}
                    </p>
                    {v.cambios && <p className="mt-1 text-[12.5px] text-ink-2">Después: {v.cambios}</p>}
                  </li>
                ))}
              </ol>
            </Surface>
          )}
          <Surface>
            <SurfaceHeader titulo="Archivos" />
            <div className="p-4">
              <Archivos destino={{ presupuestoId: p.id }} archivos={p.adjuntos} compacto />
            </div>
          </Surface>
          {p.notas && (
            <Surface>
              <SurfaceHeader titulo="Notas" />
              <p className="whitespace-pre-line px-5 py-4 text-[14px] leading-relaxed text-ink-2">{p.notas}</p>
            </Surface>
          )}
        </aside>
      </div>
    </div>
  )
}

function Dato({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <p className="mb-2.5 text-[12px] font-medium text-ink-3">{etiqueta}</p>
      {children}
    </div>
  )
}
