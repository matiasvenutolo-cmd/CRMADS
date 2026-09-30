'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { EstadoVacio } from '@/components/EstadoVacio'
import { obraAtrasada } from '@/lib/obraHelpers'
import { TabResumen } from './TabResumen'
import { TabEtapas } from './TabEtapas'
import { TabHistorial } from './TabHistorial'
import { TabDocumentos } from './TabDocumentos'
import { TabFotos } from './TabFotos'
import { TabObraCivil } from './TabObraCivil'
import { TabFacturacion } from './TabFacturacion'
import { TabAdicionales } from './TabAdicionales'
import { TabExpediente } from './TabExpediente'
import { Share2, ExternalLink } from 'lucide-react'

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'etapas', label: 'Etapas' },
  { id: 'historial', label: 'Historial' },
  { id: 'facturacion', label: 'Facturación y cobros' },
  { id: 'adicionales', label: 'Adicionales' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'obracivil', label: 'Obra civil' },
  { id: 'expediente', label: 'Expediente técnico' },
]

export function FichaObra({ id }: { id: string }) {
  const obra = useStore((s) => s.obras.find((o) => o.id === id))
  const compartir = useStore((s) => s.compartirConCliente)
  const addToast = useStore((s) => s.addToast)
  const [tab, setTab] = useState('resumen')

  if (!obra) {
    return (
      <div className="p-6">
        <EstadoVacio titulo="No encontramos esa obra" />
      </div>
    )
  }

  const cliente = clientePorId(obra.clienteId)
  const atrasada = obraAtrasada(obra)

  function compartirConCliente() {
    if (!obra) return
    compartir(obra.id)
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(`${window.location.origin}/portal/${obra.id}`).catch(() => {})
    }
    addToast('Link del portal copiado al portapapeles')
  }

  return (
    <div>
      <PageHeader
        titulo={obra.numero}
        descripcion={cliente?.nombre}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            {atrasada && <Badge tone="danger">Atrasada</Badge>}
            {obra.compartidaConCliente && (
              <Link href={`/portal/${obra.id}`} target="_blank">
                <Button variant="secondary" size="sm">
                  <ExternalLink size={14} /> Ver portal
                </Button>
              </Link>
            )}
            <Button variant="primary" size="sm" onClick={compartirConCliente}>
              <Share2 size={14} /> Compartir con el cliente
            </Button>
          </div>
        }
      />
      <Tabs tabs={TABS} activa={tab} onChange={setTab} />
      {tab === 'resumen' && <TabResumen obra={obra} />}
      {tab === 'etapas' && <TabEtapas obra={obra} />}
      {tab === 'historial' && <TabHistorial obra={obra} />}
      {tab === 'facturacion' && <TabFacturacion obra={obra} />}
      {tab === 'adicionales' && <TabAdicionales obra={obra} />}
      {tab === 'documentos' && <TabDocumentos obra={obra} />}
      {tab === 'fotos' && <TabFotos obra={obra} />}
      {tab === 'obracivil' && <TabObraCivil obra={obra} />}
      {tab === 'expediente' && <TabExpediente obra={obra} />}
    </div>
  )
}
