import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function ParteDeObraPage() {
  return (
    <div>
      <PageHeader titulo="Parte de obra" descripcion="Pensado para usar desde el celular, parado en la obra" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Parte de obra" descripcion="Se construye en la última etapa." />
      </div>
    </div>
  )
}
