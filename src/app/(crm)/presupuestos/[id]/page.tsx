import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default async function FichaPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <PageHeader titulo={`Presupuesto ${id}`} />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Ficha de presupuesto" descripcion="Se construye en la próxima etapa." />
      </div>
    </div>
  )
}
