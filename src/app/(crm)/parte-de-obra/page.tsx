'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { etapaActual } from '@/lib/obraHelpers'
import { Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { generarId } from '@/lib/utils'
import { Camera, Check, AlertTriangle, ClipboardCheck } from 'lucide-react'

const FOTOS_STOCK = [
  { etiqueta: 'Avance de obra', color: '#034EA2' },
  { etiqueta: 'Detalle técnico', color: '#023D80' },
  { etiqueta: 'Frente de obra', color: '#5C6875' },
]

export default function ParteDeObraPage() {
  const obras = useStore((s) => s.obras)
  const completarEtapa = useStore((s) => s.completarEtapa)
  const toggleObraCivil = useStore((s) => s.toggleObraCivil)
  const registrarAvance = useStore((s) => s.registrarAvanceParteDeObra)
  const addToast = useStore((s) => s.addToast)

  const [obraId, setObraId] = useState(obras[0]?.id ?? '')
  const [incidencia, setIncidencia] = useState('')

  const obra = obras.find((o) => o.id === obraId)
  if (!obra) return null

  const cliente = clientePorId(obra.clienteId)
  const actual = etapaActual(obra)
  const puedeCompletar = actual && (actual.estado === 'en_curso' || actual.estado === 'atrasada')

  function agregarFoto() {
    const stock = FOTOS_STOCK[obra!.fotos.length % FOTOS_STOCK.length]
    useStore.setState((s) => ({
      obras: s.obras.map((o) => (o.id === obra!.id ? { ...o, fotos: [...o.fotos, { id: generarId('foto'), ...stock }] } : o)),
    }))
    addToast('Foto agregada')
  }

  return (
    <div className="mx-auto max-w-md pb-6">
      <PageHeader titulo="Parte de obra" descripcion="Pensado para usar desde el celular, parado en la obra" />

      <div className="space-y-4 p-4">
        <div>
          <Select value={obraId} onChange={(e) => setObraId(e.target.value)} className="text-base">
            {obras.map((o) => (
              <option key={o.id} value={o.id}>
                {o.numero} · {clientePorId(o.clienteId)?.nombre}
              </option>
            ))}
          </Select>
        </div>

        <Card>
          <CardBody>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">{cliente?.nombre}</p>
            <p className="font-display text-lg font-bold text-ink">{obra.datosTecnicos.direccion}</p>
            <p className="mt-1 text-sm text-muted">Etapa actual: {actual?.nombre}</p>
          </CardBody>
        </Card>

        {puedeCompletar && (
          <Button variant="primary" className="h-14 w-full text-base" onClick={() => completarEtapa(obra.id, actual!.id)}>
            <Check size={18} /> Marcar &quot;{actual!.nombre}&quot; como completa
          </Button>
        )}

        <Button variant="secondary" className="h-14 w-full text-base" onClick={agregarFoto}>
          <Camera size={18} /> Sacar foto ({obra.fotos.length} cargadas)
        </Button>

        <Card>
          <CardBody className="space-y-2">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <AlertTriangle size={15} className="text-brand-orange" /> Registrar incidencia
            </p>
            <Textarea rows={3} placeholder="¿Qué pasó?" value={incidencia} onChange={(e) => setIncidencia(e.target.value)} className="text-base" />
            <Button
              variant="primary"
              className="h-12 w-full"
              disabled={!incidencia.trim()}
              onClick={() => {
                registrarAvance(obra.id, `Incidencia: ${incidencia.trim()}`)
                setIncidencia('')
              }}
            >
              Guardar incidencia
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
              <ClipboardCheck size={15} /> Checklist de obra civil
            </p>
            <div className="space-y-2">
              {obra.obraCivil.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleObraCivil(obra.id, item.id)}
                  className="flex w-full items-center gap-3 rounded-[10px] border border-line p-3.5 text-left"
                >
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2', item.listo ? 'border-success bg-success' : 'border-line bg-white')}>
                    {item.listo && <Check size={14} className="text-white" strokeWidth={3} />}
                  </span>
                  <span className={cn('text-sm font-medium', item.listo ? 'text-ink' : 'text-muted')}>{item.nombre}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
