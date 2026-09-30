'use client'

import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { HistorialTimeline } from '@/components/HistorialTimeline'
import { AgregarNota } from '@/components/AgregarNota'

export function TabHistorial({ obra }: { obra: Obra }) {
  const agregarNota = useStore((s) => s.agregarNotaObra)

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Historial completo</CardTitle>
          <AgregarNota onAgregar={(texto) => agregarNota(obra.id, texto)} />
        </CardHeader>
        <CardBody>
          <HistorialTimeline eventos={obra.historial} />
        </CardBody>
      </Card>
    </div>
  )
}
