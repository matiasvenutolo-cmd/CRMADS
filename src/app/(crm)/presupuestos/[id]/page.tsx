import { FichaPresupuesto } from '@/components/presupuestos/FichaPresupuesto'

export default async function FichaPresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FichaPresupuesto id={id} />
}
