import { FichaObra } from '@/components/obras/FichaObra'

export default async function FichaObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <FichaObra id={id} />
}
