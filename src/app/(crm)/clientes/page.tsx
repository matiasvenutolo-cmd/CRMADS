'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { CLIENTES } from '@/data/clientes'
import { useStore } from '@/store/useStore'
import { Input } from '@/components/ui/Field'
import { presupuestosDeCliente, obrasDeCliente, tasaAprobacion } from '@/lib/clienteHelpers'
import { Search, Building2 } from 'lucide-react'

export default function ClientesPage() {
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)
  const [busqueda, setBusqueda] = useState('')
  const q = busqueda.trim().toLowerCase()

  const clientes = CLIENTES.filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.localidad.toLowerCase().includes(q))

  return (
    <div>
      <PageHeader titulo="Clientes" descripcion="Constructoras, estudios, desarrolladoras y consorcios" />
      <div className="p-4 md:px-6 md:py-4">
        <div className="relative max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Buscar cliente o localidad..." className="pl-8" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2 md:px-6 lg:grid-cols-3">
        {clientes.map((c) => {
          const pres = presupuestosDeCliente(presupuestos, c.id)
          const obs = obrasDeCliente(obras, c.id)
          const tasa = tasaAprobacion(pres)
          return (
            <Link key={c.id} href={`/clientes/${c.id}`} className="rounded-card border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-blue/10 text-brand-blue">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.nombre}</p>
                  <p className="text-xs text-muted">{c.tipo} · {c.localidad}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 text-xs whitespace-nowrap text-muted">
                <span>{pres.length} presupuestos</span>
                <span>{obs.length} obras</span>
                {tasa !== null && <span>{tasa}% aprobación</span>}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
