'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { CLIENTES } from '@/data/clientes'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EstadoVacio } from '@/components/EstadoVacio'
import { formatMoney, formatDate } from '@/lib/format'
import { todosLosHitos, resumenFacturacion, estaVencido } from '@/lib/facturacionHelpers'
import { saldoPendienteDeCliente } from '@/lib/clienteHelpers'
import { ComprobantePreviewModal } from '@/components/obras/ComprobantePreviewModal'
import { Receipt, Wifi } from 'lucide-react'

export default function FacturacionPage() {
  const obras = useStore((s) => s.obras)
  const facturarHito = useStore((s) => s.facturarHito)
  const [verComprobante, setVerComprobante] = useState<{ obraId: string; hitoId: string } | null>(null)

  const hitos = todosLosHitos(obras)
  const resumen = resumenFacturacion(obras)
  const listosParaFacturar = hitos.filter((h) => h.hito.estado === 'Listo para facturar')
  const comprobantesEmitidos = hitos.filter((h) => h.hito.comprobante).sort((a, b) => (a.hito.comprobante!.fecha < b.hito.comprobante!.fecha ? 1 : -1))
  const hitoVisto = verComprobante ? hitos.find((h) => h.obra.id === verComprobante.obraId && h.hito.id === verComprobante.hitoId) : undefined

  const cuentaCorriente = CLIENTES.map((c) => ({ cliente: c, saldo: saldoPendienteDeCliente(obras.filter((o) => o.clienteId === c.id)) })).filter((r) => r.saldo > 0)

  return (
    <div>
      <PageHeader
        titulo="Facturación"
        descripcion="Hitos de pago de todas las obras"
        acciones={
          <span className="flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1.5 text-xs font-medium text-success">
            <Wifi size={13} /> Conectado a facturación · última sincronización hace 2 min
          </span>
        }
      />

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 md:p-6">
        <Kpi titulo="A facturar" valor={formatMoney(resumen.aFacturar)} tono="orange" />
        <Kpi titulo="Facturado en el mes" valor={formatMoney(resumen.facturadoEnMes)} />
        <Kpi titulo="Pendiente de cobro" valor={formatMoney(resumen.pendienteDeCobro)} />
        <Kpi titulo="Cobrado en el mes" valor={formatMoney(resumen.cobradoEnMes)} tono="success" />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-2 md:p-6 md:pt-0">
        <Card>
          <CardHeader>
            <CardTitle>Listo para facturar</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {listosParaFacturar.length === 0 && <p className="text-sm text-muted">No hay hitos esperando facturación.</p>}
            {listosParaFacturar.map(({ hito, obra }) => (
              <div key={hito.id} className="flex items-center justify-between gap-2 rounded-[10px] bg-paper px-3 py-2.5">
                <div className="min-w-0">
                  <Link href={`/obras/${obra.id}`} className="truncate text-sm font-medium text-ink hover:text-brand-blue">
                    {obra.numero} · {hito.nombre}
                  </Link>
                  <p className="text-xs text-muted">{formatMoney(hito.monto)}</p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    facturarHito(obra.id, hito.id)
                    setVerComprobante({ obraId: obra.id, hitoId: hito.id })
                  }}
                >
                  <Receipt size={13} /> Facturar
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuenta corriente por cliente</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {cuentaCorriente.length === 0 && <p className="text-sm text-muted">Sin saldos pendientes.</p>}
            {cuentaCorriente.map((r) => (
              <Link key={r.cliente.id} href={`/clientes/${r.cliente.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-2 hover:bg-paper">
                <span className="text-sm text-ink">{r.cliente.nombre}</span>
                <span className="text-sm font-medium text-brand-orange">{formatMoney(r.saldo)}</span>
              </Link>
            ))}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comprobantes emitidos</CardTitle>
          </CardHeader>
          <CardBody>
            {comprobantesEmitidos.length === 0 ? (
              <EstadoVacio titulo="Todavía no se emitieron comprobantes" />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <th className="pb-2">Comprobante</th>
                      <th className="pb-2">Obra</th>
                      <th className="pb-2">Fecha</th>
                      <th className="pb-2">Importe</th>
                      <th className="pb-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprobantesEmitidos.map(({ hito, obra }) => {
                      const vencido = estaVencido({ hito, obra })
                      return (
                        <tr key={hito.id} className="border-t border-line">
                          <td className="py-2.5">
                            <button className="text-brand-blue hover:underline" onClick={() => setVerComprobante({ obraId: obra.id, hitoId: hito.id })}>
                              {hito.comprobante!.numero}
                            </button>
                          </td>
                          <td className="py-2.5 text-ink">{obra.numero}</td>
                          <td className={`py-2.5 ${vencido ? 'font-medium text-brand-orange' : 'text-muted'}`}>{formatDate(hito.comprobante!.fecha)}</td>
                          <td className="py-2.5 text-ink">{formatMoney(hito.comprobante!.importe)}</td>
                          <td className="py-2.5">
                            <Badge tone={hito.estado === 'Cobrado' ? 'success' : vencido ? 'orange' : 'blue'}>{vencido ? 'Vencido' : hito.estado}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ComprobantePreviewModal
        comprobante={hitoVisto?.hito.comprobante ?? null}
        clienteId={hitoVisto?.obra.clienteId ?? ''}
        concepto={hitoVisto?.hito.nombre ?? ''}
        onClose={() => setVerComprobante(null)}
      />
    </div>
  )
}

function Kpi({ titulo, valor, tono }: { titulo: string; valor: string; tono?: 'orange' | 'success' }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-muted">{titulo}</p>
        <p className={`font-display text-2xl font-bold ${tono === 'orange' ? 'text-brand-orange' : tono === 'success' ? 'text-success' : 'text-ink'}`}>{valor}</p>
      </CardBody>
    </Card>
  )
}
