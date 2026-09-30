'use client'

import { Select, Input } from '@/components/ui/Field'
import { CLIENTES } from '@/data/clientes'
import { EQUIPO } from '@/data/equipo'
import { TIPOLOGIAS } from '@/data/constants'
import { Search } from 'lucide-react'

export interface FiltrosPresupuestosState {
  busqueda: string
  tipologia: string
  vendedorId: string
  clienteId: string
}

export function FiltrosPresupuestos({ value, onChange }: { value: FiltrosPresupuestosState; onChange: (v: FiltrosPresupuestosState) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-2 md:px-6">
      <div className="relative flex-1 min-w-[180px]">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          placeholder="Buscar por cliente, dirección o número..."
          className="pl-8"
          value={value.busqueda}
          onChange={(e) => onChange({ ...value, busqueda: e.target.value })}
        />
      </div>
      <Select className="w-auto min-w-[160px]" value={value.tipologia} onChange={(e) => onChange({ ...value, tipologia: e.target.value })}>
        <option value="">Todas las tipologías</option>
        {TIPOLOGIAS.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>
      <Select className="w-auto min-w-[150px]" value={value.vendedorId} onChange={(e) => onChange({ ...value, vendedorId: e.target.value })}>
        <option value="">Todos los vendedores</option>
        {EQUIPO.filter((p) => p.rol === 'comercial').map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </Select>
      <Select className="w-auto min-w-[160px]" value={value.clienteId} onChange={(e) => onChange({ ...value, clienteId: e.target.value })}>
        <option value="">Todos los clientes</option>
        {CLIENTES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </Select>
    </div>
  )
}

export function filtrarPresupuestos<T extends { clienteId: string; datosTecnicos: { tipologia: string; direccion: string }; numero: string; vendedorId: string }>(
  items: T[],
  filtros: FiltrosPresupuestosState
): T[] {
  const q = filtros.busqueda.trim().toLowerCase()
  return items.filter((p) => {
    if (filtros.tipologia && p.datosTecnicos.tipologia !== filtros.tipologia) return false
    if (filtros.vendedorId && p.vendedorId !== filtros.vendedorId) return false
    if (filtros.clienteId && p.clienteId !== filtros.clienteId) return false
    if (q) {
      const cliente = CLIENTES.find((c) => c.id === p.clienteId)?.nombre.toLowerCase() ?? ''
      const match = p.numero.toLowerCase().includes(q) || cliente.includes(q) || p.datosTecnicos.direccion.toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })
}
