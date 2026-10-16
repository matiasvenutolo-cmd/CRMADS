import type { Metadata } from 'next'
import Link from 'next/link'
import { HardHat } from 'lucide-react'
import { listarObras, contarObras, type FiltroObras } from '@/lib/data/obras'
import { codigoObra } from '@/lib/dominio'
import { fechaCorta, relativo } from '@/lib/fechas'
import { PageHead } from '@/components/comun/page-head'
import { Pestanas, BuscadorLista } from '@/components/comun/filtros'
import { BotonNuevo } from '@/components/comun/boton-nuevo'
import { Surface, Vacio } from '@/components/ui/surface'
import { Aviso } from '@/components/ui/estado'
import { IndicadorEtapas } from '@/components/obra/indicador'

export const metadata: Metadata = { title: 'Obras' }

const FILTROS: FiltroObras[] = ['en_curso', 'terminadas', 'todas']

export default async function ObrasPage({ searchParams }: { searchParams: Promise<{ filtro?: string; q?: string }> }) {
  const sp = await searchParams
  const filtro = (FILTROS.includes(sp.filtro as FiltroObras) ? sp.filtro : 'en_curso') as FiltroObras
  const [lista, conteo] = await Promise.all([listarObras(filtro, sp.q), contarObras()])

  return (
    <div>
      <PageHead titulo="Obras" acciones={<BotonNuevo tipo="obra" variante="secondary">Cargar obra en curso</BotonNuevo>} />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Pestanas
          actual={filtro}
          opciones={[
            { valor: 'en_curso', label: 'En curso', n: conteo.en_curso },
            { valor: 'terminadas', label: 'Terminadas', n: conteo.terminadas },
            { valor: 'todas', label: 'Todas', n: conteo.todas },
          ]}
        />
        <BuscadorLista placeholder="Buscar cliente, dirección o número" />
      </div>

      <Surface className="overflow-hidden">
        {lista.length === 0 ? (
          sp.q ? (
            <Vacio titulo="Sin resultados" texto={`No hay obras que coincidan con «${sp.q}».`} />
          ) : conteo.todas === 0 ? (
            <Vacio
              icono={<HardHat className="size-5" />}
              titulo="Todavía no hay obras"
              texto="Las obras nacen cuando un presupuesto se gana. Si ya tenés obras en marcha, cargalas acá."
              accion={<BotonNuevo tipo="obra" variante="secondary">Cargar obra en curso</BotonNuevo>}
            />
          ) : (
            <Vacio titulo="Nada por acá" texto="No hay obras en esta vista." />
          )
        ) : (
          <ul className="divide-y divide-line">
            {lista.map((o) => {
              const { actual, completas, total, atrasada } = o.resumen
              const terminada = o.estado === 'terminada'
              return (
                <li key={o.id}>
                  <Link href={`/obras/${o.id}`} className="grid gap-x-6 gap-y-3 px-5 py-4 transition-colors hover:bg-subtle md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.2fr)_170px] md:items-center">
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-ink">
                        {o.direccion}
                        {o.localidad && <span className="font-normal text-ink-3">, {o.localidad}</span>}
                      </span>
                      <span className="flex items-center gap-2 text-[13px] text-ink-3">
                        <span className="truncate">{o.clienteNombre}</span>
                        <span className="shrink-0 font-mono text-[11.5px]">{codigoObra(o.numero)}</span>
                      </span>
                    </span>
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="w-[54px] shrink-0 font-serif text-[30px] leading-none text-ink">
                        {terminada ? '✓' : String(actual?.orden ?? total).padStart(2, '0')}
                        <span className="font-sans text-[12px] text-ink-3">/{total}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] text-ink">{terminada ? 'Obra terminada' : actual?.nombre}</span>
                        <IndicadorEtapas etapas={o.etapas} atrasada={atrasada} className="mt-1.5" />
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-2 md:justify-end">
                      {terminada ? (
                        <span className="text-[13px] text-ink-3">{completas} etapas completas</span>
                      ) : atrasada ? (
                        <Aviso>Atrasada desde el {fechaCorta(actual!.fechaPrevista)}</Aviso>
                      ) : actual?.fechaPrevista ? (
                        <span className="text-[13px] text-ink-2">Etapa prevista {relativo(actual.fechaPrevista)}</span>
                      ) : o.fechaFinEstimada ? (
                        <span className="text-[13px] text-ink-3">Puesta en marcha {fechaCorta(o.fechaFinEstimada)}</span>
                      ) : (
                        <span className="text-[13px] text-ink-3">Sin fechas previstas</span>
                      )}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Surface>
    </div>
  )
}
