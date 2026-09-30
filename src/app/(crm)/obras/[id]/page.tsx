import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default async function FichaObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <PageHeader titulo={`Obra ${id}`} />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Ficha de obra" descripcion="Se construye en la próxima etapa." />
      </div>
    </div>
  )
}
