import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function ObrasPage() {
  return (
    <div>
      <PageHeader titulo="Obras" descripcion="Obras en curso y su progreso" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Lista de obras" descripcion="Se construye en la próxima etapa." />
      </div>
    </div>
  )
}
