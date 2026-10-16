import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { listarClientes } from '@/lib/data/clientes'
import { PageHead } from '@/components/comun/page-head'
import { BuscadorLista } from '@/components/comun/filtros'
import { BotonNuevo } from '@/components/comun/boton-nuevo'
import { Surface, Vacio } from '@/components/ui/surface'
import { iniciales } from '@/lib/formato'

export const metadata: Metadata = { title: 'Clientes' }

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const lista = await listarClientes(q)

  return (
    <div>
      <PageHead titulo="Clientes" acciones={<BotonNuevo tipo="cliente" variante="secondary">Nuevo cliente</BotonNuevo>} />
      <div className="mb-4 flex justify-end">
        <BuscadorLista placeholder="Buscar cliente" />
      </div>
      <Surface className="overflow-hidden">
        {lista.length === 0 ? (
          q ? (
            <Vacio titulo="Sin resultados" texto={`No hay clientes que coincidan con «${q}».`} />
          ) : (
            <Vacio icono={<Building2 className="size-5" />} titulo="Todavía no hay clientes" texto="Se crean solos al cargar un presupuesto, o podés crearlos acá." accion={<BotonNuevo tipo="cliente" variante="secondary">Nuevo cliente</BotonNuevo>} />
          )
        ) : (
          <ul className="divide-y divide-line">
            {lista.map((c) => (
              <li key={c.id}>
                <Link href={`/clientes/${c.id}`} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-subtle">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-subtle text-[13px] font-semibold text-ink-2">{iniciales(c.nombre)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14.5px] font-medium text-ink">{c.nombre}</span>
                    <span className="block truncate text-[13px] text-ink-3">{[c.contacto, c.telefono].filter(Boolean).join(' · ') || 'Sin datos de contacto'}</span>
                  </span>
                  <span className="hidden shrink-0 gap-6 text-right text-[13px] sm:flex">
                    <span>
                      <span className="tabular block font-medium text-ink">{c.activos}</span>
                      <span className="text-ink-3">en curso</span>
                    </span>
                    <span>
                      <span className="tabular block font-medium text-ink">{c.obras}</span>
                      <span className="text-ink-3">{c.obras === 1 ? 'obra' : 'obras'}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Surface>
    </div>
  )
}
