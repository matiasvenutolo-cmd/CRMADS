import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function FacturacionPage() {
  return (
    <div>
      <PageHeader titulo="Facturación" descripcion="Conectado a facturación · última sincronización hace 2 min" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Vista de facturación" descripcion="Se construye en la etapa de facturación y cobros." />
      </div>
    </div>
  )
}
