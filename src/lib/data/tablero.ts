import 'server-only'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { clientes, etapas, obras, presupuestos } from '@/lib/db/schema'
import { ESTADOS_ACTIVOS, ETAPAS_OBRA, type EstadoPresupuesto } from '@/lib/dominio'
import { diferenciaDias, hoyISO } from '@/lib/fechas'

// El tablero de dirección se calcula en memoria: son cientos de filas, no millones,
// y así cada indicador queda escrito en un solo lugar y es fácil de leer.

const ELECTROMECANICO = 'Ascensor electromecánico'

function mediana(v: number[]) {
  if (!v.length) return 0
  const s = [...v].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2
}

function suma<T>(lista: T[], f: (x: T) => number) {
  return lista.reduce((t, x) => t + f(x), 0)
}

function trimestre(iso: string) {
  const [y, m] = iso.split('-').map(Number)
  return `${y}-T${Math.ceil(m! / 3)}`
}

export async function datosTablero() {
  const hoy = hoyISO()

  const [filas, filasObras, filasEtapas] = await Promise.all([
    db
      .select({
        id: presupuestos.id,
        estado: presupuestos.estado,
        monto: presupuestos.monto,
        moneda: presupuestos.moneda,
        equipos: presupuestos.cantidadEquipos,
        paradas: presupuestos.paradas,
        tipologia: presupuestos.tipologia,
        localidad: presupuestos.localidad,
        clienteId: presupuestos.clienteId,
        cliente: clientes.nombre,
        fechaEnvio: presupuestos.fechaEnvio,
        proximoSeguimiento: presupuestos.proximoSeguimiento,
        motivoPerdida: presupuestos.motivoPerdida,
      })
      .from(presupuestos)
      .innerJoin(clientes, eq(clientes.id, presupuestos.clienteId)),
    db.select({ id: obras.id, estado: obras.estado, equipos: obras.cantidadEquipos, fechaInicio: obras.fechaInicio, fechaFinEstimada: obras.fechaFinEstimada, fechaFin: obras.fechaFin }).from(obras),
    db.select({ obraId: etapas.obraId, orden: etapas.orden, estado: etapas.estado, fechaPrevista: etapas.fechaPrevista }).from(etapas),
  ])

  // Todo el análisis comercial es en dólares (es como cotiza ADS). Lo que esté en pesos se informa aparte.
  const enPesos = filas.filter((p) => p.moneda !== 'USD')
  const usd = filas.filter((p) => p.moneda === 'USD').map((p) => ({ ...p, monto: p.monto ?? 0, estado: p.estado as EstadoPresupuesto }))

  const activos = usd.filter((p) => ESTADOS_ACTIVOS.includes(p.estado))
  const ganados = usd.filter((p) => p.estado === 'ganado')
  const perdidos = usd.filter((p) => p.estado === 'perdido')
  const decididos = ganados.length + perdidos.length
  const montoDecidido = suma(ganados, (p) => p.monto) + suma(perdidos, (p) => p.monto)

  const cierre = {
    porCantidad: decididos ? ganados.length / decididos : null,
    porMonto: montoDecidido ? suma(ganados, (p) => p.monto) / montoDecidido : null,
    decididos,
  }

  const resumen = {
    cartera: { n: activos.length, monto: suma(activos, (p) => p.monto), equipos: suma(activos, (p) => p.equipos) },
    ganado: { n: ganados.length, monto: suma(ganados, (p) => p.monto), equipos: suma(ganados, (p) => p.equipos) },
    perdido: { n: perdidos.length, monto: suma(perdidos, (p) => p.monto) },
    cotizado: { n: usd.length, monto: suma(usd, (p) => p.monto), equipos: suma(usd, (p) => p.equipos) },
    ticketEquipo: ganados.length ? suma(ganados, (p) => p.monto) / Math.max(1, suma(ganados, (p) => p.equipos)) : null,
    // Conservadora: se usa la menor de las dos tasas de cierre.
    proyeccion: cierre.porMonto != null && cierre.porCantidad != null && decididos >= 5 ? suma(activos, (p) => p.monto) * Math.min(cierre.porMonto, cierre.porCantidad) : null,
  }

  const embudo = (['borrador', 'enviado', 'negociacion', 'ganado', 'perdido'] as const).map((estado) => {
    const l = usd.filter((p) => p.estado === estado)
    return { estado, n: l.length, monto: suma(l, (p) => p.monto), equipos: suma(l, (p) => p.equipos) }
  })

  // Salud de la cartera: cuánto hace que se mandó y si tiene un próximo paso.
  const enviados = activos.filter((p) => p.estado !== 'borrador')
  const tramos = [
    { label: 'Hasta 15 días', desde: 0, hasta: 15 },
    { label: '16 a 30 días', desde: 16, hasta: 30 },
    { label: '31 a 60 días', desde: 31, hasta: 60 },
    { label: 'Más de 60 días', desde: 61, hasta: Infinity },
  ].map((t) => {
    const l = enviados.filter((p) => {
      const d = p.fechaEnvio ? diferenciaDias(p.fechaEnvio, hoy) : null
      return d != null && d >= t.desde && d <= t.hasta
    })
    return { label: t.label, n: l.length, monto: suma(l, (p) => p.monto) }
  })
  const salud = {
    tramos,
    sinFecha: enviados.filter((p) => !p.fechaEnvio).length,
    sinProximoPaso: enviados.filter((p) => !p.proximoSeguimiento).length,
    vencidos: enviados.filter((p) => p.proximoSeguimiento && p.proximoSeguimiento < hoy).length,
    enviados: enviados.length,
  }

  // Precio por equipo según paradas (electromecánicos, que son la mayoría y comparables entre sí).
  const puntos = usd
    .filter((p) => p.tipologia === ELECTROMECANICO && p.paradas && p.monto > 0 && p.equipos > 0)
    .map((p) => ({ id: p.id, paradas: p.paradas!, porEquipo: p.monto / p.equipos, estado: p.estado, cliente: p.cliente }))
  const porParadas = [...new Set(puntos.map((p) => p.paradas))]
    .sort((a, b) => a - b)
    .map((paradas) => {
      const l = puntos.filter((p) => p.paradas === paradas)
      return { paradas, n: l.length, mediana: mediana(l.map((p) => p.porEquipo)) }
    })
  const rangos = [
    { label: 'Hasta 9 paradas', desde: 0, hasta: 9 },
    { label: '10 a 13', desde: 10, hasta: 13 },
    { label: '14 a 20', desde: 14, hasta: 20 },
    { label: 'Más de 20', desde: 21, hasta: Infinity },
  ]
    .map((r) => {
      const l = puntos.filter((p) => p.paradas >= r.desde && p.paradas <= r.hasta)
      return { label: r.label, n: l.length, mediana: mediana(l.map((p) => p.porEquipo)) }
    })
    .filter((r) => r.n > 0)
  // ¿Los perdidos estaban caros para su cantidad de paradas? Se compara cada uno con la mediana de su grupo.
  const desvio = (estado: EstadoPresupuesto) => {
    const l = puntos.filter((p) => p.estado === estado)
    const v = l.map((p) => p.porEquipo / (porParadas.find((g) => g.paradas === p.paradas)!.mediana || 1) - 1)
    return v.length >= 3 ? suma(v, (x) => x) / v.length : null
  }
  const precios = { puntos, porParadas, rangos, desvioGanados: desvio('ganado'), desvioPerdidos: desvio('perdido') }

  const tipologias = [...new Set(usd.map((p) => p.tipologia))]
    .map((tipologia) => {
      const l = usd.filter((p) => p.tipologia === tipologia)
      const g = l.filter((p) => p.estado === 'ganado').length
      const d = g + l.filter((p) => p.estado === 'perdido').length
      return { tipologia, n: l.length, equipos: suma(l, (p) => p.equipos), monto: suma(l, (p) => p.monto), ganados: g, cierre: d ? g / d : null }
    })
    .sort((a, b) => b.monto - a.monto)

  const porCliente = new Map<string, { id: string; nombre: string; n: number; ganado: number; enJuego: number; perdido: number; ganados: number; perdidos: number }>()
  for (const p of usd) {
    const c = porCliente.get(p.clienteId) ?? { id: p.clienteId, nombre: p.cliente, n: 0, ganado: 0, enJuego: 0, perdido: 0, ganados: 0, perdidos: 0 }
    c.n++
    if (p.estado === 'ganado') {
      c.ganado += p.monto
      c.ganados++
    } else if (p.estado === 'perdido') {
      c.perdido += p.monto
      c.perdidos++
    } else c.enJuego += p.monto
    porCliente.set(p.clienteId, c)
  }
  const listaClientes = [...porCliente.values()].sort((a, b) => b.ganado + b.enJuego + b.perdido - (a.ganado + a.enJuego + a.perdido))
  const top3Cartera = [...listaClientes].sort((a, b) => b.enJuego - a.enJuego).slice(0, 3)
  const clientesInfo = {
    top: listaClientes.slice(0, 8),
    total: listaClientes.length,
    conGanados: listaClientes.filter((c) => c.ganados > 0).length,
    concentracion: resumen.cartera.monto ? suma(top3Cartera, (c) => c.enJuego) / resumen.cartera.monto : null,
    top3Cartera,
  }

  const motivos = [...new Set(perdidos.map((p) => p.motivoPerdida ?? 'Sin motivo'))]
    .map((motivo) => {
      const l = perdidos.filter((p) => (p.motivoPerdida ?? 'Sin motivo') === motivo)
      return { motivo, n: l.length, monto: suma(l, (p) => p.monto) }
    })
    .sort((a, b) => b.n - a.n)

  const zonas = [...new Set(usd.map((p) => p.localidad?.trim() || 'Sin localidad'))]
    .map((localidad) => {
      const l = usd.filter((p) => (p.localidad?.trim() || 'Sin localidad') === localidad)
      return { localidad, n: l.length, monto: suma(l, (p) => p.monto), ganados: l.filter((p) => p.estado === 'ganado').length }
    })
    .sort((a, b) => b.monto - a.monto)

  // Ritmo comercial: presupuestos enviados por mes, desde el primer envío hasta hoy (últimos 12).
  const envios = usd.filter((p) => p.fechaEnvio)
  const ritmo: { mes: string; enviados: number; montoEnviado: number }[] = []
  if (envios.length) {
    let [y, m] = envios.map((p) => p.fechaEnvio!).sort()[0]!.split('-').map(Number) as [number, number]
    const fin = hoy.slice(0, 7)
    for (let mes = ''; (mes = `${y}-${String(m).padStart(2, '0')}`) <= fin; m === 12 ? ((y += 1), (m = 1)) : (m += 1)) {
      const l = envios.filter((p) => p.fechaEnvio!.startsWith(mes))
      ritmo.push({ mes, enviados: l.length, montoEnviado: suma(l, (p) => p.monto) })
    }
  }
  const mesesConEnvios = ritmo.filter((r) => r.enviados > 0).length

  // Obras: en qué etapa está cada una y cuándo se entregan.
  const enCurso = filasObras.filter((o) => o.estado === 'en_curso')
  const etapaActual = (obraId: string) => {
    const l = filasEtapas.filter((e) => e.obraId === obraId).sort((a, b) => a.orden - b.orden)
    return l.find((e) => e.estado === 'en_curso') ?? l.find((e) => e.estado === 'pendiente') ?? null
  }
  const porEtapa = ETAPAS_OBRA.map((nombre, i) => {
    const l = enCurso.filter((o) => etapaActual(o.id)?.orden === i + 1)
    return { orden: i + 1, nombre, n: l.length, equipos: suma(l, (o) => o.equipos) }
  })
  const atrasadas = enCurso.filter((o) => {
    const e = etapaActual(o.id)
    return !!e?.fechaPrevista && e.fechaPrevista < hoy
  }).length
  const fueraDePlazo = enCurso.filter((o) => o.fechaFinEstimada && o.fechaFinEstimada < hoy).length
  const entregasMap = new Map<string, { trimestre: string; n: number; equipos: number }>()
  for (const o of enCurso) {
    if (!o.fechaFinEstimada || o.fechaFinEstimada < hoy) continue
    const t = trimestre(o.fechaFinEstimada)
    const e = entregasMap.get(t) ?? { trimestre: t, n: 0, equipos: 0 }
    e.n++
    e.equipos += o.equipos
    entregasMap.set(t, e)
  }
  const obrasInfo = {
    enCurso: enCurso.length,
    equipos: suma(enCurso, (o) => o.equipos),
    terminadas: filasObras.filter((o) => o.estado === 'terminada').length,
    porEtapa,
    atrasadas,
    fueraDePlazo,
    sinFechaFin: enCurso.filter((o) => !o.fechaFinEstimada).length,
    entregas: [...entregasMap.values()].sort((a, b) => a.trimestre.localeCompare(b.trimestre)),
  }

  return {
    hoy,
    hayDatos: filas.length > 0,
    enPesos: { n: enPesos.length, monto: suma(enPesos, (p) => p.monto ?? 0) },
    resumen,
    cierre,
    embudo,
    salud,
    precios,
    tipologias,
    clientes: clientesInfo,
    motivos,
    zonas,
    ritmo: ritmo.slice(-12),
    mesesConEnvios,
    obras: obrasInfo,
  }
}

export type DatosTablero = Awaited<ReturnType<typeof datosTablero>>
