import type { Metadata } from 'next'
import { getCatalogo } from '@/lib/data/cotizador'
import { PageHead } from '@/components/comun/page-head'
import { PreciosYTextos } from '@/components/cotizador/precios'

export const metadata: Metadata = { title: 'Precios y textos' }

export default async function PreciosPage() {
  const catalogo = await getCatalogo()
  return (
    <div>
      <PageHead
        volver={{ href: '/cotizador', label: 'Cotizador' }}
        titulo="Precios y textos"
        descripcion="La base del cotizador: lo que antes estaba repartido en los Excel y Word. Se cargó con lo que se usó en los presupuestos de ADS."
      />
      <PreciosYTextos catalogo={catalogo} />
    </div>
  )
}
