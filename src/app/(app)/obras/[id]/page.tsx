import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getObra } from '@/lib/data/obras'
import { ETAPA, MUNICIPAL, codigoObra, etiquetaPresupuesto, velocidadLegible } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { diferenciaDias, fechaCorta, hoyISO } from '@/lib/fechas'
import { PageHead, Codigo } from '@/components/comun/page-head'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { Bitacora } from '@/components/comun/bitacora'
import { Composer } from '@/components/comun/composer'
import { Archivos } from '@/components/comun/archivos'
import { ContactoRapido } from '@/components/comun/contacto-rapido'
import { Recorrido } from '@/components/obra/recorrido'
import { EtapaActual } from '@/components/obra/etapa-actual'
import { PlanosEnviados } from '@/components/obra/planos-enviados'
import { Compras } from '@/components/obra/compras'
import { FormaDePago } from '@/components/obra/forma-de-pago'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const o = await getObra((await params).id)
  return { title: o ? `${o.direccion} · ${codigoObra(o.numero)}` : 'Obra' }
}

export default async function ObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const o = await getObra(id)
  if (!o) notFound()
  const hoy = hoyISO()

  const historial = o.historial.map((h) => ({ ...h, origen: h.obraId ? undefined : 'presupuesto' }))
  const etapaActual = o.resumen.actual?.orden ?? (o.estado === 'terminada' ? 99 : 1)
  const planos = o.adjuntos.filter((a) => a.categoria === 'planos')
  const actas = o.adjuntos.filter((a) => a.categoria === 'acta')
  const sueltos = o.adjuntos.filter((a) => !a.categoria)
  const etapaPlanos = o.etapas.find((e) => e.orden === ETAPA.planos)
  const verPlanos = planos.length > 0 || !!o.planosEnviados || etapaActual >= ETAPA.planos
  const verCompras = o.compras.length > 0 || etapaActual >= ETAPA.replanteo
  const verActa = actas.length > 0 || etapaActual >= ETAPA.pruebas
  const desvio = o.fechaFin && o.fechaFinEstimada ? diferenciaDias(o.fechaFinEstimada, o.fechaFin) : null
  const municipal = o.municipal === 'si' ? (o.fechaMunicipal ? `Aprobada el ${fechaCorta(o.fechaMunicipal)}` : 'A cargo de ADS · en trámite') : o.municipal === 'no' ? MUNICIPAL.no : null

  const ficha = [
    ['Tipología', o.tipologia],
    ['Equipos', String(o.cantidadEquipos)],
    ['Carga', o.cargaKg ? `${o.cargaKg} kg` : null],
    ['Paradas', o.paradas ? String(o.paradas) : null],
    ['Velocidad', velocidadLegible(o.velocidad)],
    ['Inicio', fechaCorta(o.fechaInicio)],
    ['Plazo pedido por el cliente', o.fechaFinEstimada ? fechaCorta(o.fechaFinEstimada) : null],
    ['Entrega real', o.fechaFin ? `${fechaCorta(o.fechaFin)}${desvio != null ? (desvio <= 0 ? ' · en plazo' : ` · ${desvio} días tarde`) : ''}` : null],
    ['Montador', o.montador],
    ['Aprobación municipal', municipal],
  ].filter((f): f is [string, string] => Boolean(f[1]))

  return (
    <div>
      <PageHead
        volver={{ href: '/obras', label: 'Obras' }}
        antetitulo={
          <>
            <Link href={`/clientes/${o.cliente.id}`} className="font-medium text-ink-2 hover:text-ink hover:underline">
              {o.cliente.nombre}
            </Link>
            <span aria-hidden>·</span>
            <Codigo>{codigoObra(o.numero)}</Codigo>
            {o.presupuesto && (
              <>
                <span aria-hidden>·</span>
                <Link href={`/presupuestos/${o.presupuesto.id}`} className="hover:text-ink hover:underline">
                  desde <span className="font-mono text-[12px]">{etiquetaPresupuesto(o.presupuesto)}</span>
                </Link>
              </>
            )}
          </>
        }
        titulo={
          <>
            {o.direccion}
            {o.localidad && <span className="text-ink-3">, {o.localidad}</span>}
          </>
        }
      />

      <EtapaActual obra={o} etapas={o.etapas} hoy={hoy} montadores={o.montadores} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="order-2 flex flex-col gap-5 lg:order-none">
          <Surface>
            <SurfaceHeader titulo="Recorrido de la obra" accion={<span className="text-[12.5px] text-ink-3">{o.resumen.completas} de {o.resumen.total}</span>} />
            <div className="px-4 py-2.5">
              <Recorrido obraId={o.id} etapas={o.etapas} hoy={hoy} />
            </div>
          </Surface>
          <Surface>
            <SurfaceHeader titulo="Ficha técnica" />
            <dl className="divide-y divide-line">
              {ficha.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-5 py-2.5 text-[13.5px]">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
              {o.presupuesto?.monto != null && (
                <div className="flex justify-between gap-4 px-5 py-2.5 text-[13.5px]">
                  <dt className="text-ink-3">Monto presupuestado</dt>
                  <dd className="tabular text-right font-medium text-ink">{dinero(o.presupuesto.monto, o.presupuesto.moneda)}</dd>
                </div>
              )}
            </dl>
          </Surface>
          <Surface>
            <SurfaceHeader titulo="Cliente" />
            <div className="px-5 py-4">
              <p className="text-[15px] font-medium text-ink">{o.cliente.nombre}</p>
              {o.cliente.contacto && <p className="text-[13.5px] text-ink-2">{o.cliente.contacto}</p>}
              <ContactoRapido telefono={o.cliente.telefono} email={o.cliente.email} />
            </div>
          </Surface>
        </aside>

        <div className="order-1 flex min-w-0 flex-col gap-8 lg:order-none">
          <section>
            <h2 className="mb-3 font-serif text-[24px] text-ink">Forma de pago</h2>
            <Surface className="p-4">
              <FormaDePago obraId={o.id} pagos={o.pagos} etapas={o.etapas} hoy={hoy} presupuestado={o.presupuesto ? { monto: o.presupuesto.monto, moneda: o.presupuesto.moneda } : null} />
            </Surface>
          </section>
          {verPlanos && (
            <section>
              <h2 className="mb-3 font-serif text-[24px] text-ink">Planos de proyecto</h2>
              <Surface className="p-4">
                <dl className="mb-4 grid grid-cols-2 gap-3 text-[13.5px]">
                  <div>
                    <dt className="text-ink-3">Enviados al cliente</dt>
                    <dd className="mt-0.5">
                      <PlanosEnviados obraId={o.id} fecha={o.planosEnviados} hoy={hoy} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Aprobados por el cliente</dt>
                    <dd className={etapaPlanos?.fechaFin ? 'mt-0.5 font-medium text-ink' : 'mt-0.5 text-ink-3'}>
                      {etapaPlanos?.fechaFin ? fechaCorta(etapaPlanos.fechaFin) : etapaPlanos?.estado === 'completa' ? 'Sí' : 'Pendiente'}
                    </dd>
                  </div>
                </dl>
                <Archivos destino={{ obraId: o.id }} archivos={planos} categoria="planos" textoSubir="Subir planos" />
              </Surface>
            </section>
          )}
          {verCompras && (
            <section>
              <h2 className="mb-3 font-serif text-[24px] text-ink">Compras de materiales</h2>
              <Surface className="p-4">
                <Compras obraId={o.id} compras={o.compras} proveedores={o.proveedores} hoy={hoy} />
              </Surface>
            </section>
          )}
          {verActa && (
            <section>
              <h2 className="mb-3 font-serif text-[24px] text-ink">Acta de entrega</h2>
              <Surface className="p-4">
                <Archivos destino={{ obraId: o.id }} archivos={actas} categoria="acta" textoSubir="Subir acta firmada" />
              </Surface>
            </section>
          )}
          <section>
            <h2 className="mb-3 font-serif text-[24px] text-ink">Fotos y archivos</h2>
            <Surface className="p-4">
              <Archivos destino={{ obraId: o.id }} archivos={sueltos} />
            </Surface>
          </section>
          <section>
            <h2 className="mb-3 font-serif text-[24px] text-ink">Bitácora</h2>
            <div className="mb-6">
              <Composer destino={{ obraId: o.id }} hoy={hoy} />
            </div>
            <Bitacora items={historial} />
          </section>
          {o.notas && (
            <Surface>
              <SurfaceHeader titulo="Notas" />
              <p className="whitespace-pre-line px-5 py-4 text-[14px] leading-relaxed text-ink-2">{o.notas}</p>
            </Surface>
          )}
        </div>
      </div>
    </div>
  )
}
