import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function PresupuestosPage() {
  return (
    <div>
      <PageHeader titulo="Presupuestos" descripcion="Kanban y tabla de presupuestos" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Vista de presupuestos" descripcion="Se construye en la próxima etapa: kanban, tabla y filtros." />
      </div>
    </div>
  )
}
