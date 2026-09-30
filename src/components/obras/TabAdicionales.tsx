'use client'

import { useState } from 'react'
import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { formatMoney, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { TONE_ADICIONAL } from '@/lib/badges'
import { EstadoVacio } from '@/components/EstadoVacio'
import { Plus, Check, X } from 'lucide-react'

export function TabAdicionales({ obra }: { obra: Obra }) {
  const agregarAdicional = useStore((s) => s.agregarAdicional)
  const resolverAdicional = useStore((s) => s.resolverAdicional)
  const [abierto, setAbierto] = useState(false)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex justify-end">
        {!abierto ? (
          <Button variant="secondary" size="sm" onClick={() => setAbierto(true)}>
            <Plus size={14} /> Agregar adicional
          </Button>
        ) : null}
      </div>

      {abierto && (
        <div className="mb-4 space-y-3 rounded-card border border-line bg-white p-4">
          <Textarea placeholder="Descripción del cambio pedido por el cliente" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} />
          <Input type="number" placeholder="Monto" value={monto} onChange={(e) => setMonto(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setAbierto(false)
                setDescripcion('')
                setMonto('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!descripcion.trim() || !monto}
              onClick={() => {
                agregarAdicional(obra.id, descripcion.trim(), Number(monto))
                setAbierto(false)
                setDescripcion('')
                setMonto('')
              }}
            >
              Guardar
            </Button>
          </div>
        </div>
      )}

      {obra.adicionales.length === 0 ? (
        <EstadoVacio titulo="Sin adicionales cargados" descripcion="Los cambios que pide el cliente durante la obra se registran acá." />
      ) : (
        <div className="space-y-2">
          {obra.adicionales.map((a) => (
            <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-4">
              <div className="min-w-0">
                <p className="text-ink">{a.descripcion}</p>
                <p className="text-xs text-muted">{formatDate(a.fecha)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold text-ink">{formatMoney(a.monto)}</span>
                <Badge tone={TONE_ADICIONAL[a.estado]}>{a.estado}</Badge>
                {a.estado === 'Pendiente' && (
                  <div className="flex gap-1">
                    <Button variant="secondary" size="sm" onClick={() => resolverAdicional(obra.id, a.id, true)}>
                      <Check size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => resolverAdicional(obra.id, a.id, false)}>
                      <X size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
