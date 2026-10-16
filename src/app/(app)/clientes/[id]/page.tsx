import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCliente } from '@/lib/data/clientes'
import { codigoObra, codigoPresupuesto } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { PageHead } from '@/components/comun/page-head'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { EstadoPresupuestoLabel } from '@/components/ui/estado'
import { ContactoRapido } from '@/components/comun/contacto-rapido'
import { EditarCliente } from '@/components/comun/editar-cliente'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const c = await getCliente((await params).id)
  return { title: c?.nombre ?? 'Cliente' }
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const c = await getCliente(id)
  if (!c) notFound()

  return (
    <div>
      <PageHead volver={{ href: '/clientes', label: 'Clientes' }} titulo={c.nombre} descripcion={c.contacto} acciones={<EditarCliente cliente={c} />} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Surface className="overflow-hidden">
            <SurfaceHeader titulo={`Obras · ${c.obras.length}`} />
            {c.obras.length === 0 ? (
              <p className="px-5 py-5 text-[14px] text-ink-3">Sin obras todavía.</p>
            ) : (
              <ul className="divide-y divide-line">
                {c.obras.map((o) => (
                  <li key={o.id}>
                    <Link href={`/obras/${o.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-subtle">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14.5px] font-medium text-ink">{o.direccion}</span>
                        <span className="block truncate text-[13px] text-ink-3">
                          <span className="font-mono text-[11.5px]">{codigoObra(o.numero)}</span> · {o.estado === 'terminada' ? 'Terminada' : o.resumen.actual?.nombre}
                        </span>
                      </span>
                      <span className="font-serif text-[22px] leading-none text-ink">
                        {o.estado === 'terminada' ? '✓' : String(o.resumen.actual?.orden ?? 0).padStart(2, '0')}
                        <span className="font-sans text-[11px] text-ink-3">/{o.resumen.total}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Surface>

          <Surface className="overflow-hidden">
            <SurfaceHeader titulo={`Presupuestos · ${c.presupuestos.length}`} />
            {c.presupuestos.length === 0 ? (
              <p className="px-5 py-5 text-[14px] text-ink-3">Sin presupuestos todavía.</p>
            ) : (
              <ul className="divide-y divide-line">
                {c.presupuestos.map((p) => (
                  <li key={p.id}>
                    <Link href={`/presupuestos/${p.id}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-subtle sm:grid-cols-[minmax(0,1fr)_140px_130px]">
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] font-medium text-ink">{p.direccion}</span>
                        <span className="block truncate text-[13px] text-ink-3">
                          <span className="font-mono text-[11.5px]">{codigoPresupuesto(p.numero)}</span> · {p.tipologia}
                        </span>
                      </span>
                      <span className="tabular text-right text-[14px] font-medium text-ink">{p.monto == null ? '—' : dinero(p.monto, p.moneda)}</span>
                      <EstadoPresupuestoLabel estado={p.estado} className="max-sm:col-span-2" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </div>

        <aside className="flex flex-col gap-5">
          <Surface>
            <SurfaceHeader titulo="Contacto" />
            <div className="px-5 py-4">
              {c.contacto && <p className="text-[14.5px] font-medium text-ink">{c.contacto}</p>}
              <ContactoRapido telefono={c.telefono} email={c.email} />
              {c.cuit && <p className="mt-4 text-[13px] text-ink-3">CUIT {c.cuit}</p>}
            </div>
          </Surface>
          {c.notas && (
            <Surface>
              <SurfaceHeader titulo="Notas" />
              <p className="whitespace-pre-line px-5 py-4 text-[14px] leading-relaxed text-ink-2">{c.notas}</p>
            </Surface>
          )}
        </aside>
      </div>
    </div>
  )
}
