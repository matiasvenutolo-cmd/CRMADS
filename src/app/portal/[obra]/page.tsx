import { EstadoVacio } from '@/components/EstadoVacio'

export default async function PortalObraPage({ params }: { params: Promise<{ obra: string }> }) {
  const { obra } = await params
  return (
    <div className="p-6">
      <EstadoVacio titulo={`Portal de la obra ${obra}`} descripcion="Se construye en la última etapa." />
    </div>
  )
}
