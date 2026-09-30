'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { KanbanPresupuestos } from '@/components/presupuestos/KanbanPresupuestos'
import { TablaPresupuestos } from '@/components/presupuestos/TablaPresupuestos'
import { FiltrosPresupuestos, filtrarPresupuestos, type FiltrosPresupuestosState } from '@/components/presupuestos/FiltrosPresupuestos'
import { Button } from '@/components/ui/Button'
import { LayoutGrid, List } from 'lucide-react'

const FILTROS_VACIOS: FiltrosPresupuestosState = { busqueda: '', tipologia: '', vendedorId: '', clienteId: '' }

export default function PresupuestosPage() {
  const presupuestos = useStore((s) => s.presupuestos)
  const [vista, setVista] = useState<'kanban' | 'tabla'>('kanban')
  const [filtros, setFiltros] = useState<FiltrosPresupuestosState>(FILTROS_VACIOS)

  const filtrados = filtrarPresupuestos(presupuestos, filtros)

  return (
    <div>
      <PageHeader
        titulo="Presupuestos"
        descripcion="Seguimiento del pipeline comercial"
        acciones={
          <div className="flex items-center gap-1 rounded-[10px] border border-line bg-white p-1">
            <Button variant={vista === 'kanban' ? 'primary' : 'ghost'} size="sm" onClick={() => setVista('kanban')}>
              <LayoutGrid size={15} /> Kanban
            </Button>
            <Button variant={vista === 'tabla' ? 'primary' : 'ghost'} size="sm" onClick={() => setVista('tabla')}>
              <List size={15} /> Tabla
            </Button>
          </div>
        }
      />
      <div className="pt-4">
        <FiltrosPresupuestos value={filtros} onChange={setFiltros} />
        {vista === 'kanban' ? <KanbanPresupuestos presupuestos={filtrados} /> : <div className="py-2"><TablaPresupuestos presupuestos={filtrados} /></div>}
      </div>
    </div>
  )
}
