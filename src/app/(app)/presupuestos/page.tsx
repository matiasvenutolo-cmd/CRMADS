import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { listarPresupuestos, contarPresupuestos, type FiltroPresupuestos } from '@/lib/data/presupuestos'
import { etiquetaPresupuesto } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { fechaCorta, hoyISO, relativo } from '@/lib/fechas'
import { PageHead } from '@/components/comun/page-head'
import { Pestanas, BuscadorLista } from '@/components/comun/filtros'
import { BotonNuevo } from '@/components/comun/boton-nuevo'
import { Surface, Vacio } from '@/components/ui/surface'
import { EstadoPresupuestoLabel } from '@/components/ui/estado'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Presupuestos' }

const FILTROS: FiltroPresupuestos[] = ['activos', 'ganados', 'perdidos', 'todos']

export default async function PresupuestosPage({ searchParams }: { searchParams: Promise<{ filtro?: string; q?: string }> }) {
  const sp = await searchParams
  const filtro = (FILTROS.includes(sp.filtro as FiltroPresupuestos) ? sp.filtro : 'activos') as FiltroPresupuestos
  const [lista, conteo] = await Promise.all([listarPresupuestos(filtro, sp.q), contarPresupuestos()])
  const hoy = hoyISO()

  return (
    <div>
      <PageHead titulo="Presupuestos" acciones={<BotonNuevo tipo="presupuesto">Nuevo presupuesto</BotonNuevo>} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Pestanas
          actual={filtro}
          opciones={[
            { valor: 'activos', label: 'En curso', n: conteo.activos },
            { valor: 'ganados', label: 'Ganados', n: conteo.ganados },
            { valor: 'perdidos', label: 'Perdidos', n: conteo.perdidos },
            { valor: 'todos', label: 'Todos', n: conteo.todos },
          ]}
        />
        <BuscadorLista placeholder="Buscar cliente, dirección o número" />
      </div>

      <Surface className="overflow-hidden">
        {lista.length === 0 ? (
          sp.q ? (
            <Vacio titulo="Sin resultados" texto={`No hay presupuestos que coincidan con «${sp.q}».`} />
          ) : conteo.todos === 0 ? (
            <Vacio icono={<FileText className="size-5" />} titulo="Todavía no hay presupuestos" texto="Cargá el primero y empezá a seguirlo desde acá." accion={<BotonNuevo tipo="presupuesto">Nuevo presupuesto</BotonNuevo>} />
          ) : (
            <Vacio titulo="Nada por acá" texto="No hay presupuestos en esta vista." />
          )
        ) : (
          <>
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_150px_140px_150px] gap-4 border-b border-line bg-subtle px-5 py-2.5 text-[12px] font-medium text-ink-3 md:grid">
              <span>Cliente y obra</span>
              <span>Tipología</span>
              <span className="text-right">Monto</span>
              <span>Estado</span>
              <span>Próximo seguimiento</span>
            </div>
            <ul className="divide-y divide-line">
              {lista.map((p) => {
                const vencido = p.proximoSeguimiento && p.proximoSeguimiento <= hoy && ['borrador', 'enviado', 'negociacion'].includes(p.estado)
                return (
                  <li key={p.id}>
                    <Link
                      href={`/presupuestos/${p.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 px-5 py-3.5 transition-colors hover:bg-subtle md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_150px_140px_150px] md:items-center"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-[14.5px] font-medium text-ink">{p.clienteNombre}</span>
                        <span className="flex items-center gap-2 text-[13px] text-ink-3">
                          <span className="truncate">
                            {p.direccion}
                            {p.localidad ? `, ${p.localidad}` : ''}
                          </span>
                          <span className="shrink-0 font-mono text-[11.5px]">{etiquetaPresupuesto(p)}</span>
                        </span>
                      </span>
                      <span className="hidden truncate text-[13.5px] text-ink-2 md:block">
                        {p.tipologia}
                        {p.cantidadEquipos > 1 && <span className="text-ink-3"> × {p.cantidadEquipos}</span>}
                      </span>
                      <span className={cn('tabular text-right text-[14px] font-medium', p.monto == null ? 'text-ink-3' : 'text-ink')}>{p.monto == null ? '—' : dinero(p.monto, p.moneda)}</span>
                      <EstadoPresupuestoLabel estado={p.estado} />
                      <span className={cn('text-right text-[13px] md:text-left', vencido ? 'font-medium text-warn' : 'text-ink-3')}>
                        {p.proximoSeguimiento && ['borrador', 'enviado', 'negociacion'].includes(p.estado) ? (
                          <>
                            {fechaCorta(p.proximoSeguimiento)} <span className="max-md:hidden">· {relativo(p.proximoSeguimiento)}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Surface>
    </div>
  )
}
