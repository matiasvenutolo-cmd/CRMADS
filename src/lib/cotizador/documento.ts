import { calcular, type Cotizacion } from './modelo'
import { montoEnLetras } from './letras'

// El documento para el cliente, como lista de bloques. Lo usan el Word y el PDF,
// así los dos salen iguales. Sigue la estructura de los presupuestos de ADS.

export type Bloque =
  | { t: 'titulo'; texto: string }
  | { t: 'parrafo'; texto: string; negrita?: boolean }
  | { t: 'ficha'; filas: [string, string][] }
  | { t: 'dato'; etiqueta: string; valor: string }
  | { t: 'precio'; texto: string; monto: string }
  | { t: 'salto' }

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

export function fechaCarta(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return y && m && d ? `${d} de ${MESES[m - 1]} de ${y}` : iso
}

const usd = (v: number) => `USD ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v))}`

/** Separa un texto en párrafos (las líneas en blanco de los Word originales). */
function parrafos(texto: string): string[] {
  return texto
    .split(/\n\s*\n|\n(?=\t|\s{2,}|[a-z]\)\s)/)
    .map((p) => p.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean)
}

export function armarDocumento(c: Cotizacion, info: { numero: string; cliente: string; iva: string }) {
  const r = calcular(c)
  const b: Bloque[] = []
  b.push({ t: 'parrafo', texto: 'De nuestra mayor consideración:' })
  b.push({ t: 'parrafo', texto: 'Tenemos el agrado de dirigirnos a Uds. para someter a vuestra consideración el siguiente presupuesto.' })

  const ficha = c.ficha.filter((f) => f.campo.trim() && f.valor.trim())
  if (ficha.length) {
    b.push({ t: 'titulo', texto: 'Características técnicas' })
    b.push({ t: 'ficha', filas: ficha.map((f) => [f.campo, f.valor]) })
  }

  for (const s of c.secciones.filter((s) => s.grupo === 'tecnica' && s.incluir && s.texto.trim())) {
    b.push({ t: 'titulo', texto: s.titulo })
    for (const p of parrafos(s.texto)) b.push({ t: 'parrafo', texto: p })
  }

  b.push({ t: 'titulo', texto: 'Precio' })
  const porEquipo = r.cantidad > 1 ? ' por equipo' : ''
  b.push({
    t: 'precio',
    texto: `ASCENSORES DEL SUR suministrará e instalará ${r.cantidad > 1 ? `los ${r.cantidad} equipos definidos` : 'el equipo definido'} en las Especificaciones Generales detalladas anteriormente por el precio básico de ${usd(r.unitario)}.-${porEquipo} + Impuestos (Dólares Estadounidenses: ${montoEnLetras(r.unitario)}).-`,
    monto: `${usd(r.unitario)}${porEquipo} + impuestos`,
  })
  if (r.cantidad > 1) b.push({ t: 'parrafo', texto: `Total por ${r.cantidad} equipos: ${usd(r.total)}.- + Impuestos (Dólares Estadounidenses: ${montoEnLetras(r.total)}).-`, negrita: true })
  b.push({ t: 'parrafo', texto: `El precio indicado en el presente presupuesto NO incluye IVA (${info.iva}) ni la correspondiente percepción por Ingresos Brutos.` })
  b.push({ t: 'parrafo', texto: 'El monto indicado con anterioridad se tomará en pesos al cambio del día en que se efectúa el pago. Cotización Dólar Tipo Vendedor Banco de la Nación Argentina.' })

  const alternativas = c.alternativas.filter((a) => a.concepto.trim())
  if (alternativas.length) {
    b.push({ t: 'titulo', texto: alternativas.length > 1 ? 'Precios opcionales' : 'Precio opcional' })
    for (const a of alternativas) b.push({ t: 'dato', etiqueta: a.concepto, valor: a.monto ? `${usd(a.monto)}.- + Impuestos` : '' })
  }

  b.push({ t: 'dato', etiqueta: 'Condiciones de pago', valor: c.condiciones.pago })
  b.push({ t: 'dato', etiqueta: 'Plazos de entrega', valor: c.condiciones.plazo })
  b.push({ t: 'dato', etiqueta: 'Validez de la oferta', valor: c.condiciones.validez })
  b.push({ t: 'parrafo', texto: '' })
  b.push({ t: 'parrafo', texto: 'Sin otro particular y quedando desde ya a vuestras gratas órdenes, aprovechamos la oportunidad para saludarlos muy cordialmente.' })

  const generales = c.secciones.filter((s) => s.grupo === 'condiciones' && s.incluir && s.texto.trim())
  if (generales.length) {
    b.push({ t: 'salto' })
    for (const s of generales) {
      b.push({ t: 'titulo', texto: s.titulo })
      for (const p of parrafos(s.texto)) b.push({ t: 'parrafo', texto: p })
    }
  }

  return {
    numero: info.numero,
    lugarFecha: `${c.encabezado.lugar || 'Lanús'}, ${fechaCarta(c.encabezado.fecha)}`,
    cliente: info.cliente,
    atencion: c.encabezado.atencion,
    referencia: c.encabezado.referencia,
    bloques: b,
  }
}
export type DocumentoCotizacion = ReturnType<typeof armarDocumento>
