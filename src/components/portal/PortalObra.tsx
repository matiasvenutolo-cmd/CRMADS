'use client'

import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { formatDate } from '@/lib/format'
import { etapaActual, progresoObra } from '@/lib/obraHelpers'
import { EstadoVacio } from '@/components/EstadoVacio'
import { TONE_ETAPA, LABEL_ETAPA } from '@/lib/badges'
import { Badge } from '@/components/ui/Badge'
import { Check, ImageIcon, FileText } from 'lucide-react'

export function PortalObra({ obraId }: { obraId: string }) {
  const obra = useStore((s) => s.obras.find((o) => o.id === obraId))

  if (!obra) {
    return (
      <div className="p-6">
        <EstadoVacio titulo="No encontramos esta obra" />
      </div>
    )
  }

  const cliente = clientePorId(obra.clienteId)
  const progreso = progresoObra(obra)
  const actual = etapaActual(obra)

  return (
    <div className="mx-auto max-w-3xl p-4 pb-16 md:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{cliente?.nombre}</p>
        <h1 className="font-display text-2xl font-bold text-ink">
          {obra.numero} · {obra.datosTecnicos.direccion}
        </h1>
        <p className="text-sm text-muted">{obra.datosTecnicos.localidad}</p>
      </div>

      <div className="rounded-card border border-line bg-white p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Etapa actual: <span className="font-medium text-ink">{actual?.nombre}</span>
          </span>
          <span className="font-semibold text-ink">{progreso}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${progreso}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted">Puesta en marcha estimada: {formatDate(obra.fechaEstimadaPuestaEnMarcha)}</p>
      </div>

      <div className="mt-6 rounded-card border border-line bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Línea de tiempo</h2>
        <ol className="relative border-l border-line pl-6">
          {obra.etapas.map((e) => (
            <li key={e.id} className="mb-4 last:mb-0">
              <span
                className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                  e.estado === 'completa' ? 'bg-success' : e.estado === 'en_curso' ? 'bg-brand-blue' : e.estado === 'atrasada' ? 'bg-danger' : 'bg-line'
                }`}
              >
                {e.estado === 'completa' && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-ink">{e.nombre}</p>
                <Badge tone={TONE_ETAPA[e.estado]}>{LABEL_ETAPA[e.estado]}</Badge>
              </div>
              <p className="text-xs text-muted">{e.fechaReal ? `Completada el ${formatDate(e.fechaReal)}` : `Prevista para el ${formatDate(e.fechaPrevista)}`}</p>
            </li>
          ))}
        </ol>
      </div>

      {obra.fotos.length > 0 && (
        <div className="mt-6 rounded-card border border-line bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Fotos</h2>
          <div className="grid grid-cols-3 gap-2">
            {obra.fotos.map((f) => (
              <div key={f.id} className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[10px] text-white" style={{ backgroundColor: f.color }}>
                <ImageIcon size={18} className="opacity-80" />
                <span className="px-1 text-center text-[10px] font-medium opacity-90">{f.etiqueta}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {obra.documentos.length > 0 && (
        <div className="mt-6 rounded-card border border-line bg-white p-5">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">Documentos compartidos</h2>
          <div className="space-y-2">
            {obra.documentos.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-[10px] bg-paper px-3 py-2.5 text-sm">
                <FileText size={16} className="text-brand-blue" />
                <span className="text-ink">{d.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
