import type { Obra } from '@/types'
import { EstadoVacio } from '@/components/EstadoVacio'
import { ImageIcon } from 'lucide-react'

export function TabFotos({ obra }: { obra: Obra }) {
  if (obra.fotos.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Todavía no hay fotos cargadas" descripcion="El responsable de obra puede subirlas desde el parte de obra." />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:p-6 lg:grid-cols-4">
      {obra.fotos.map((foto) => (
        <div key={foto.id} className="aspect-square overflow-hidden rounded-card border border-line">
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white" style={{ backgroundColor: foto.color }}>
            <ImageIcon size={22} className="opacity-80" />
            <span className="px-2 text-center text-xs font-medium opacity-90">{foto.etiqueta}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
