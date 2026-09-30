'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Label, Select, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { TIPOLOGIAS, TIPOS_PUERTA, LOCALIDADES } from '@/data/constants'
import { CLIENTES } from '@/data/clientes'
import { useStore } from '@/store/useStore'
import { estimarPrecio } from '@/lib/cotizador'
import { formatMoney } from '@/lib/format'
import { montoActual } from '@/data/presupuestos'
import type { Tipologia, TipoPuerta, Localidad } from '@/types'
import { Calculator, Sparkles } from 'lucide-react'

const VELOCIDADES = ['0.3 m/s', '0.5 m/s', '0.63 m/s', '1 m/s', '1.6 m/s']

export default function CotizadorPage() {
  const obras = useStore((s) => s.obras)
  const presupuestos = useStore((s) => s.presupuestos)
  const crearPresupuesto = useStore((s) => s.crearPresupuestoDesdeCotizador)
  const router = useRouter()

  const [tipologia, setTipologia] = useState<Tipologia>('Ascensor electromecánico')
  const [cargaKg, setCargaKg] = useState(630)
  const [paradas, setParadas] = useState(6)
  const [recorridoM, setRecorridoM] = useState(16)
  const [velocidad, setVelocidad] = useState('1 m/s')
  const [tipoPuertas, setTipoPuertas] = useState<TipoPuerta>('Automática telescópica')
  const [cantidadEquipos, setCantidadEquipos] = useState(1)
  const [direccion, setDireccion] = useState('')
  const [localidad, setLocalidad] = useState<Localidad>('CABA')
  const [clienteId, setClienteId] = useState(CLIENTES[0].id)

  const precio = useMemo(
    () => estimarPrecio({ tipologia, cargaKg, paradas, recorridoM, velocidad, tipoPuertas, cantidadEquipos }),
    [tipologia, cargaKg, paradas, recorridoM, velocidad, tipoPuertas, cantidadEquipos]
  )

  const parecidas = useMemo(() => {
    return obras
      .filter((o) => o.datosTecnicos.tipologia === tipologia)
      .map((o) => ({ obra: o, monto: montoActual(presupuestos.find((p) => p.id === o.presupuestoOrigenId)!) }))
      .sort((a, b) => Math.abs(a.obra.datosTecnicos.cargaKg - cargaKg) - Math.abs(b.obra.datosTecnicos.cargaKg - cargaKg))
      .slice(0, 3)
  }, [obras, presupuestos, tipologia, cargaKg])

  function generar() {
    if (!direccion.trim()) return
    const id = crearPresupuesto({ tipologia, cargaKg, paradas, recorridoM, velocidad, tipoPuertas, cantidadEquipos, direccion, localidad }, clienteId, precio)
    router.push(`/presupuestos/${id}`)
  }

  return (
    <div>
      <PageHeader titulo="Cotizador" descripcion="Estimación rápida a partir de la ficha técnica" />
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-5 md:p-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Ficha técnica</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Tipología</Label>
              <Select value={tipologia} onChange={(e) => setTipologia(e.target.value as Tipologia)}>
                {TIPOLOGIAS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Carga (kg)</Label>
              <Input type="number" min={100} max={2500} value={cargaKg} onChange={(e) => setCargaKg(Number(e.target.value))} />
            </div>
            <div>
              <Label>Paradas</Label>
              <Input type="number" min={2} max={12} value={paradas} onChange={(e) => setParadas(Number(e.target.value))} />
            </div>
            <div>
              <Label>Recorrido (m)</Label>
              <Input type="number" min={1} value={recorridoM} onChange={(e) => setRecorridoM(Number(e.target.value))} />
            </div>
            <div>
              <Label>Velocidad</Label>
              <Select value={velocidad} onChange={(e) => setVelocidad(e.target.value)}>
                {VELOCIDADES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Tipo de puertas</Label>
              <Select value={tipoPuertas} onChange={(e) => setTipoPuertas(e.target.value as TipoPuerta)}>
                {TIPOS_PUERTA.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Cantidad de equipos</Label>
              <Input type="number" min={1} max={4} value={cantidadEquipos} onChange={(e) => setCantidadEquipos(Number(e.target.value))} />
            </div>
            <div>
              <Label>Localidad</Label>
              <Select value={localidad} onChange={(e) => setLocalidad(e.target.value as Localidad)}>
                {LOCALIDADES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Dirección de la obra</Label>
              <Input placeholder="Ej: Av. Mitre 2140" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                {CLIENTES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardBody className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <Calculator size={13} /> Precio estimado
              </p>
              <p className="font-display text-4xl font-bold text-ink">{formatMoney(precio)}</p>
              <p className="mt-1 text-xs text-muted">Estimación automática, sujeta a relevamiento técnico</p>
              <Button variant="primary" className="mt-4 w-full" disabled={!direccion.trim()} onClick={generar}>
                <Sparkles size={15} /> Generar presupuesto en el CRM
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Obras parecidas</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {parecidas.length === 0 && <p className="text-sm text-muted">No hay obras anteriores de esta tipología todavía.</p>}
              {parecidas.map(({ obra, monto }) => (
                <div key={obra.id} className="flex items-center justify-between rounded-[10px] bg-paper px-3 py-2 text-sm">
                  <div>
                    <p className="font-medium text-ink">{obra.numero}</p>
                    <p className="text-xs text-muted">
                      {obra.datosTecnicos.cargaKg} kg · {obra.datosTecnicos.paradas} paradas
                    </p>
                  </div>
                  <span className="font-medium text-ink">{formatMoney(monto)}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
