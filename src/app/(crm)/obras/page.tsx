'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { ObraCard } from '@/components/obras/ObraCard'
import { Select, Input } from '@/components/ui/Field'
import { EstadoVacio } from '@/components/EstadoVacio'
import { EQUIPO } from '@/data/equipo'
import { LOCALIDADES, ETAPAS_OBRA_NOMBRES } from '@/data/constants'
import { clientePorId } from '@/data/clientes'
import { etapaActual } from '@/lib/obraHelpers'
import { Search } from 'lucide-react'

export default function ObrasPage() {
  const obras = useStore((s) => s.obras)
  const [busqueda, setBusqueda] = useState('')
  const [etapa, setEtapa] = useState('')
  const [responsableId, setResponsableId] = useState('')
  const [localidad, setLocalidad] = useState('')

  const q = busqueda.trim().toLowerCase()
  const filtradas = obras.filter((o) => {
    if (etapa && etapaActual(o).nombre !== etapa) return false
    if (responsableId && o.responsableId !== responsableId) return false
    if (localidad && o.datosTecnicos.localidad !== localidad) return false
    if (q) {
      const cliente = clientePorId(o.clienteId)?.nombre.toLowerCase() ?? ''
      if (!o.numero.toLowerCase().includes(q) && !cliente.includes(q) && !o.datosTecnicos.direccion.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div>
      <PageHeader titulo="Obras" descripcion="Obras en curso y su progreso" />
      <div className="flex flex-wrap items-center gap-2 p-4 md:px-6 md:py-4">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Buscar por cliente, dirección o número..." className="pl-8" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <Select className="w-auto min-w-[190px]" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
          <option value="">Todas las etapas</option>
          {ETAPAS_OBRA_NOMBRES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Select>
        <Select className="w-auto min-w-[160px]" value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
          <option value="">Todos los responsables</option>
          {EQUIPO.filter((p) => p.rol === 'responsable_obra').map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </Select>
        <Select className="w-auto min-w-[150px]" value={localidad} onChange={(e) => setLocalidad(e.target.value)}>
          <option value="">Todas las localidades</option>
          {LOCALIDADES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      <div className="px-4 pb-8 md:px-6">
        {filtradas.length === 0 ? (
          <EstadoVacio titulo="No hay obras con estos filtros" />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtradas.map((o) => (
              <ObraCard key={o.id} obra={o} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
