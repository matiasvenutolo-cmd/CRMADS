import { PortalObra } from '@/components/portal/PortalObra'

export default async function PortalObraPage({ params }: { params: Promise<{ obra: string }> }) {
  const { obra } = await params
  return <PortalObra obraId={obra} />
}
