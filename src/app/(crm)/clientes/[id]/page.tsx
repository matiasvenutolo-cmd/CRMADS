import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default async function FichaClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div>
      <PageHeader titulo={`Cliente ${id}`} />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Ficha de cliente" descripcion="Se construye en la próxima etapa." />
      </div>
    </div>
  )
}
