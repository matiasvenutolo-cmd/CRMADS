import { PageHeader } from '@/components/layout/PageHeader'
import { EstadoVacio } from '@/components/EstadoVacio'

export default function CotizadorPage() {
  return (
    <div>
      <PageHeader titulo="Cotizador" descripcion="Estimación rápida de presupuesto" />
      <div className="p-4 md:p-6">
        <EstadoVacio titulo="Cotizador guiado" descripcion="Se construye en la última etapa." />
      </div>
    </div>
  )
}
