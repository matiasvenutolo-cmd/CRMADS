import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function ClientesPage() {
  return (
    <div>
      <PageHeader titulo="Clientes" descripcion="Constructoras, estudios, desarrolladoras y consorcios" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Lista de clientes" descripcion="Se construye en la próxima etapa." />
      </div>
    </div>
  )
}
