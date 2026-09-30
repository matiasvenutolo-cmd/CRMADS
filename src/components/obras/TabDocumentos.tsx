import type { Obra } from '@/types'
import { formatDate } from '@/lib/format'
import { EstadoVacio } from '@/components/EstadoVacio'
import { FileText, ScrollText, Award, FileSignature } from 'lucide-react'

const ICONOS: Record<Obra['documentos'][number]['tipo'], React.ComponentType<{ size?: number; className?: string }>> = {
  plano: ScrollText,
  presupuesto: FileText,
  certificado: Award,
  acta: FileSignature,
}

const LABELS: Record<Obra['documentos'][number]['tipo'], string> = {
  plano: 'Plano',
  presupuesto: 'Presupuesto',
  certificado: 'Certificado',
  acta: 'Acta',
}

export function TabDocumentos({ obra }: { obra: Obra }) {
  if (obra.documentos.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Todavía no hay documentos cargados" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 md:p-6 lg:grid-cols-3">
      {obra.documentos.map((doc) => {
        const Icon = ICONOS[doc.tipo]
        return (
          <div key={doc.id} className="flex items-center gap-3 rounded-card border border-line bg-white p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-blue/10 text-brand-blue">
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{doc.nombre}</p>
              <p className="text-xs text-muted">
                {LABELS[doc.tipo]} · {formatDate(doc.fecha)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
