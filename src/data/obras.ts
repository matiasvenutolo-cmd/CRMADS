import type { Obra } from '@/types'
import { ETAPAS_OBRA_NOMBRES, OBRA_CIVIL_ITEMS, EXPEDIENTE_ITEMS } from './constants'
import { PRESUPUESTOS, montoActual } from './presupuestos'

function etapaIds(obraId: string) {
  return ETAPAS_OBRA_NOMBRES.map((_, i) => `${obraId}-et-${i + 1}`)
}

function civilItems(obraId: string, listos: boolean[]): Obra['obraCivil'] {
  return OBRA_CIVIL_ITEMS.map((nombre, i) => ({ id: `${obraId}-civ-${i + 1}`, nombre, listo: listos[i] }))
}

function expedienteItems(obraId: string, completos: boolean[]): Obra['expediente'] {
  return EXPEDIENTE_ITEMS.map((nombre, i) => ({ id: `${obraId}-exp-${i + 1}`, nombre, completo: completos[i] }))
}

function montoDe(preId: string): number {
  return montoActual(PRESUPUESTOS.find((p) => p.id === preId)!)
}

function planAnticipo(monto: number) {
  return Math.round(monto * 0.3)
}
function planCert(monto: number) {
  return Math.round(monto * 0.3)
}
function planCert2(monto: number) {
  return Math.round(monto * 0.2)
}
function planSaldo(monto: number) {
  return Math.round(monto * 0.2)
}

const FOTOS_STOCK = [
  { etiqueta: 'Fachada', color: '#034EA2' },
  { etiqueta: 'Hueco del ascensor', color: '#5C6875' },
  { etiqueta: 'Sala de máquinas', color: '#023D80' },
  { etiqueta: 'Avance de montaje', color: '#FAA61A' },
  { etiqueta: 'Palier planta baja', color: '#34393E' },
]

function fotosDe(obraId: string, cantidad: number): Obra['fotos'] {
  return FOTOS_STOCK.slice(0, cantidad).map((f, i) => ({ id: `${obraId}-foto-${i + 1}`, etiqueta: f.etiqueta, color: f.color }))
}

const monto01 = montoDe('pre-01')
const monto02 = montoDe('pre-02')
const monto03 = montoDe('pre-03')
const monto04 = montoDe('pre-04')
const monto05 = montoDe('pre-05')
const monto06 = montoDe('pre-06')
const monto07 = montoDe('pre-07')
const monto08 = montoDe('pre-08')
const monto09 = montoDe('pre-09')
const monto10 = montoDe('pre-10')

export const OBRAS: Obra[] = [
  {
    id: 'obra-01',
    numero: 'O-2026-001',
    clienteId: 'cli-01',
    presupuestoOrigenId: 'pre-01',
    datosTecnicos: PRESUPUESTOS[0].datosTecnicos,
    responsableId: 'pers-03',
    fechaInicio: '2026-04-09',
    fechaEstimadaPuestaEnMarcha: '2026-10-06',
    compartidaConCliente: true,
    etapas: [
      { id: etapaIds('obra-01')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-04-09', fechaReal: '2026-04-09', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-01-hito-1' },
      { id: etapaIds('obra-01')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-04-20', fechaReal: '2026-04-18', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-01')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-05-08', fechaReal: '2026-05-10', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-01')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-06-15', fechaReal: '2026-06-20', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-01-hito-2' },
      { id: etapaIds('obra-01')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-07-10', fechaReal: '2026-07-08', responsableId: 'pers-03', estado: 'completa' },
      { id: etapaIds('obra-01')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-07-25', fechaReal: '2026-07-27', responsableId: 'pers-03', estado: 'completa' },
      { id: etapaIds('obra-01')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-08-20', fechaReal: '2026-08-22', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-01-hito-3' },
      { id: etapaIds('obra-01')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-09-25', responsableId: 'pers-03', estado: 'en_curso', hitoPagoId: 'obra-01-hito-4', notas: 'Pruebas de carga programadas para el 2/10' },
      { id: etapaIds('obra-01')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-10-06', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [
      ...PRESUPUESTOS[0].historial,
      { id: 'obra-01-h1', fecha: '2026-04-18', tipo: 'sistema', autorId: 'pers-05', descripcion: 'Relevamiento y ingeniería completado' },
      { id: 'obra-01-h2', fecha: '2026-06-20', tipo: 'sistema', autorId: 'pers-03', descripcion: 'Equipo retirado de planta Lanús, en camino a obra' },
      { id: 'obra-01-h3', fecha: '2026-08-22', tipo: 'sistema', autorId: 'pers-03', descripcion: 'Montaje finalizado' },
      { id: 'obra-01-h4', fecha: '2026-09-15', tipo: 'nota', autorId: 'pers-03', descripcion: 'Cliente pide adelantar la puesta en marcha si es posible' },
    ],
    documentos: [
      { id: 'obra-01-doc-1', nombre: 'Presupuesto aprobado P-2026-0101 v2', tipo: 'presupuesto', fecha: '2026-04-02' },
      { id: 'obra-01-doc-2', nombre: 'Plano de instalación - equipo único', tipo: 'plano', fecha: '2026-05-10' },
      { id: 'obra-01-doc-3', nombre: 'Certificado de componentes - tracción y cabina', tipo: 'certificado', fecha: '2026-06-18' },
      { id: 'obra-01-doc-4', nombre: 'Acta de recepción de obra civil', tipo: 'acta', fecha: '2026-07-08' },
    ],
    fotos: fotosDe('obra-01', 5),
    obraCivil: civilItems('obra-01', [true, true, true, true, true]),
    planPagos: [
      { id: 'obra-01-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto01), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-01')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001204', cae: '72345678901234', fecha: '2026-04-09', importe: Math.round(planAnticipo(monto01) * 1.21), iva: Math.round(planAnticipo(monto01) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-04-11' } },
      { id: 'obra-01-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto01), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-01')[3], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001255', cae: '72345678902210', fecha: '2026-06-21', importe: Math.round(planCert(monto01) * 1.21), iva: Math.round(planCert(monto01) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-06-24' } },
      { id: 'obra-01-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto01), estado: 'Facturado', etapaAsociadaId: etapaIds('obra-01')[6], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001301', cae: '72345678903367', fecha: '2026-08-23', importe: Math.round(planCert2(monto01) * 1.21), iva: Math.round(planCert2(monto01) * 0.21) } },
      { id: 'obra-01-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto01), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-01')[7] },
      { id: 'obra-01-hito-adic', nombre: 'Adicional: terminación de botonera en acero cepillado', monto: 1200000, estado: 'Listo para facturar' },
    ],
    adicionales: [{ id: 'obra-01-adic-1', descripcion: 'Cambio de terminación de botonera a acero cepillado', monto: 1200000, estado: 'Aprobado', fecha: '2026-06-10' }],
    expediente: expedienteItems('obra-01', [true, true, true, true, false, false]),
  },
  {
    id: 'obra-02',
    numero: 'O-2026-002',
    clienteId: 'cli-03',
    presupuestoOrigenId: 'pre-02',
    datosTecnicos: PRESUPUESTOS[1].datosTecnicos,
    responsableId: 'pers-04',
    fechaInicio: '2026-04-16',
    fechaEstimadaPuestaEnMarcha: '2026-10-28',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-02')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-04-16', fechaReal: '2026-04-16', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-02-hito-1' },
      { id: etapaIds('obra-02')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-04-28', fechaReal: '2026-04-30', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-02')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-05-18', fechaReal: '2026-05-22', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-02')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-06-25', fechaReal: '2026-07-02', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-02-hito-2' },
      { id: etapaIds('obra-02')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-07-20', fechaReal: '2026-07-24', responsableId: 'pers-04', estado: 'completa' },
      { id: etapaIds('obra-02')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-08-20', responsableId: 'pers-04', estado: 'atrasada', notas: 'La empresa de transporte reprogramó la entrega dos veces' },
      { id: etapaIds('obra-02')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-09-10', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-02-hito-3' },
      { id: etapaIds('obra-02')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-10-10', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-02-hito-4' },
      { id: etapaIds('obra-02')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-10-28', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [
      ...PRESUPUESTOS[1].historial,
      { id: 'obra-02-h1', fecha: '2026-07-24', tipo: 'sistema', autorId: 'pers-04', descripcion: 'Obra civil verificada y aprobada para recibir los equipos' },
      { id: 'obra-02-h2', fecha: '2026-09-02', tipo: 'nota', autorId: 'pers-04', descripcion: 'Transporte reprogramado por el proveedor logístico, segunda vez en el mes' },
    ],
    documentos: [
      { id: 'obra-02-doc-1', nombre: 'Presupuesto aprobado P-2026-0108 v1', tipo: 'presupuesto', fecha: '2026-04-10' },
      { id: 'obra-02-doc-2', nombre: 'Plano de instalación - 2 equipos', tipo: 'plano', fecha: '2026-05-22' },
      { id: 'obra-02-doc-3', nombre: 'Acta de recepción de obra civil', tipo: 'acta', fecha: '2026-07-24' },
    ],
    fotos: fotosDe('obra-02', 4),
    obraCivil: civilItems('obra-02', [true, true, true, true, true]),
    planPagos: [
      { id: 'obra-02-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto02), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-02')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001211', cae: '72345678901355', fecha: '2026-04-16', importe: Math.round(planAnticipo(monto02) * 1.21), iva: Math.round(planAnticipo(monto02) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-04-18' } },
      { id: 'obra-02-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto02), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-02')[3], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001289', cae: '72345678903112', fecha: '2026-07-03', importe: Math.round(planCert(monto02) * 1.21), iva: Math.round(planCert(monto02) * 0.21) }, cobro: { metodo: 'eCheq', fecha: '2026-07-15' } },
      { id: 'obra-02-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto02), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-02')[6] },
      { id: 'obra-02-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto02), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-02')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-02', [true, true, true, false, false, false]),
  },
  {
    id: 'obra-03',
    numero: 'O-2026-003',
    clienteId: 'cli-06',
    presupuestoOrigenId: 'pre-03',
    datosTecnicos: PRESUPUESTOS[2].datosTecnicos,
    responsableId: 'pers-03',
    fechaInicio: '2026-04-29',
    fechaEstimadaPuestaEnMarcha: '2026-11-04',
    compartidaConCliente: true,
    etapas: [
      { id: etapaIds('obra-03')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-04-29', fechaReal: '2026-04-29', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-03-hito-1' },
      { id: etapaIds('obra-03')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-05-12', fechaReal: '2026-05-14', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-03')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-06-02', fechaReal: '2026-06-05', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-03')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-07-10', fechaReal: '2026-07-16', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-03-hito-2' },
      { id: etapaIds('obra-03')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-08-05', fechaReal: '2026-08-05', responsableId: 'pers-03', estado: 'completa' },
      { id: etapaIds('obra-03')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-08-25', fechaReal: '2026-08-28', responsableId: 'pers-03', estado: 'completa' },
      { id: etapaIds('obra-03')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-09-22', responsableId: 'pers-03', estado: 'en_curso', hitoPagoId: 'obra-03-hito-3', notas: 'Montaje de cabina y guías en curso' },
      { id: etapaIds('obra-03')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-10-15', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-03-hito-4' },
      { id: etapaIds('obra-03')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-11-04', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [
      ...PRESUPUESTOS[2].historial,
      { id: 'obra-03-h1', fecha: '2026-08-28', tipo: 'sistema', autorId: 'pers-03', descripcion: 'Entrega de equipo en obra confirmada' },
    ],
    documentos: [
      { id: 'obra-03-doc-1', nombre: 'Presupuesto aprobado P-2026-0112 v1', tipo: 'presupuesto', fecha: '2026-04-22' },
      { id: 'obra-03-doc-2', nombre: 'Plano de instalación', tipo: 'plano', fecha: '2026-06-05' },
      { id: 'obra-03-doc-3', nombre: 'Certificado de componentes - unidad hidráulica', tipo: 'certificado', fecha: '2026-07-18' },
    ],
    fotos: fotosDe('obra-03', 4),
    obraCivil: civilItems('obra-03', [true, true, true, true, true]),
    planPagos: [
      { id: 'obra-03-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto03), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-03')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001218', cae: '72345678901422', fecha: '2026-04-29', importe: Math.round(planAnticipo(monto03) * 1.21), iva: Math.round(planAnticipo(monto03) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-05-02' } },
      { id: 'obra-03-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto03), estado: 'Facturado', etapaAsociadaId: etapaIds('obra-03')[3], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001294', cae: '72345678903456', fecha: '2026-07-17', importe: Math.round(planCert(monto03) * 1.21), iva: Math.round(planCert(monto03) * 0.21) } },
      { id: 'obra-03-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto03), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-03')[6] },
      { id: 'obra-03-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto03), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-03')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-03', [true, true, true, false, false, false]),
  },
  {
    id: 'obra-04',
    numero: 'O-2026-004',
    clienteId: 'cli-05',
    presupuestoOrigenId: 'pre-04',
    datosTecnicos: PRESUPUESTOS[3].datosTecnicos,
    responsableId: 'pers-04',
    fechaInicio: '2026-05-12',
    fechaEstimadaPuestaEnMarcha: '2026-11-20',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-04')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-05-12', fechaReal: '2026-05-12', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-04-hito-1' },
      { id: etapaIds('obra-04')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-05-25', fechaReal: '2026-05-27', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-04')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-06-15', fechaReal: '2026-06-19', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-04')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-08-05', fechaReal: '2026-08-12', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-04-hito-2' },
      { id: etapaIds('obra-04')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-09-05', responsableId: 'pers-04', estado: 'atrasada', notas: 'La constructora todavía no dejó el foso a nivel ni la sala de máquinas cerrada' },
      { id: etapaIds('obra-04')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-09-25', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-04')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-10-20', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-04-hito-3' },
      { id: etapaIds('obra-04')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-11-10', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-04-hito-4' },
      { id: etapaIds('obra-04')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-11-20', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [
      ...PRESUPUESTOS[3].historial,
      { id: 'obra-04-h1', fecha: '2026-08-12', tipo: 'sistema', autorId: 'pers-04', descripcion: 'Fabricación en planta completada, equipo listo para despacho' },
      { id: 'obra-04-h2', fecha: '2026-09-10', tipo: 'llamada', autorId: 'pers-04', descripcion: 'Se avisa al desarrollador que la obra civil está frenando la entrega' },
    ],
    documentos: [
      { id: 'obra-04-doc-1', nombre: 'Presupuesto aprobado P-2026-0119 v2', tipo: 'presupuesto', fecha: '2026-05-05' },
      { id: 'obra-04-doc-2', nombre: 'Plano de instalación - 2 equipos', tipo: 'plano', fecha: '2026-06-19' },
      { id: 'obra-04-doc-3', nombre: 'Certificado de componentes - tracción 1.6 m/s', tipo: 'certificado', fecha: '2026-08-13' },
    ],
    fotos: fotosDe('obra-04', 3),
    obraCivil: civilItems('obra-04', [false, false, true, true, true]),
    planPagos: [
      { id: 'obra-04-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto04), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-04')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001225', cae: '72345678901589', fecha: '2026-05-12', importe: Math.round(planAnticipo(monto04) * 1.21), iva: Math.round(planAnticipo(monto04) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-05-15' } },
      { id: 'obra-04-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto04), estado: 'Listo para facturar', etapaAsociadaId: etapaIds('obra-04')[3] },
      { id: 'obra-04-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto04), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-04')[6] },
      { id: 'obra-04-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto04), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-04')[7] },
    ],
    adicionales: [{ id: 'obra-04-adic-1', descripcion: 'Extensión de recorrido para incluir subsuelo', monto: 3400000, estado: 'Pendiente', fecha: '2026-08-02' }],
    expediente: expedienteItems('obra-04', [true, true, true, false, false, false]),
  },
  {
    id: 'obra-05',
    numero: 'O-2026-005',
    clienteId: 'cli-08',
    presupuestoOrigenId: 'pre-05',
    datosTecnicos: PRESUPUESTOS[4].datosTecnicos,
    responsableId: 'pers-03',
    fechaInicio: '2026-05-20',
    fechaEstimadaPuestaEnMarcha: '2026-11-25',
    compartidaConCliente: true,
    etapas: [
      { id: etapaIds('obra-05')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-05-20', fechaReal: '2026-05-20', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-05-hito-1' },
      { id: etapaIds('obra-05')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-06-02', fechaReal: '2026-06-04', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-05')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-06-22', fechaReal: '2026-06-25', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-05')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-09-15', responsableId: 'pers-03', estado: 'en_curso', hitoPagoId: 'obra-05-hito-2', notas: 'Estructura de montacargas en armado en planta' },
      { id: etapaIds('obra-05')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-10-05', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-05')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-10-20', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-05')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-11-05', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-05-hito-3' },
      { id: etapaIds('obra-05')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-11-18', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-05-hito-4' },
      { id: etapaIds('obra-05')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-11-25', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[4].historial],
    documentos: [{ id: 'obra-05-doc-1', nombre: 'Presupuesto aprobado P-2026-0126 v1', tipo: 'presupuesto', fecha: '2026-05-14' }],
    fotos: fotosDe('obra-05', 2),
    obraCivil: civilItems('obra-05', [false, true, true, false, false]),
    planPagos: [
      { id: 'obra-05-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto05), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-05')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001233', cae: '72345678901677', fecha: '2026-05-20', importe: Math.round(planAnticipo(monto05) * 1.21), iva: Math.round(planAnticipo(monto05) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-05-23' } },
      { id: 'obra-05-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto05), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-05')[3] },
      { id: 'obra-05-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto05), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-05')[6] },
      { id: 'obra-05-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto05), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-05')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-05', [true, true, false, false, false, false]),
  },
  {
    id: 'obra-06',
    numero: 'O-2026-006',
    clienteId: 'cli-11',
    presupuestoOrigenId: 'pre-06',
    datosTecnicos: PRESUPUESTOS[5].datosTecnicos,
    responsableId: 'pers-04',
    fechaInicio: '2026-06-03',
    fechaEstimadaPuestaEnMarcha: '2026-12-01',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-06')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-06-03', fechaReal: '2026-06-03', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-06-hito-1' },
      { id: etapaIds('obra-06')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-06-16', fechaReal: '2026-06-18', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-06')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-07-06', fechaReal: '2026-07-09', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-06')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-09-20', responsableId: 'pers-04', estado: 'en_curso', hitoPagoId: 'obra-06-hito-2' },
      { id: etapaIds('obra-06')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-10-10', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-06')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-10-25', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-06')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-11-10', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-06-hito-3' },
      { id: etapaIds('obra-06')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-11-24', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-06-hito-4' },
      { id: etapaIds('obra-06')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-12-01', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[5].historial],
    documentos: [{ id: 'obra-06-doc-1', nombre: 'Presupuesto aprobado P-2026-0133 v1', tipo: 'presupuesto', fecha: '2026-05-28' }],
    fotos: fotosDe('obra-06', 2),
    obraCivil: civilItems('obra-06', [false, false, true, false, false]),
    planPagos: [
      { id: 'obra-06-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto06), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-06')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001240', cae: '72345678901734', fecha: '2026-06-03', importe: Math.round(planAnticipo(monto06) * 1.21), iva: Math.round(planAnticipo(monto06) * 0.21) }, cobro: { metodo: 'Cheque', fecha: '2026-06-09' } },
      { id: 'obra-06-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto06), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-06')[3] },
      { id: 'obra-06-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto06), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-06')[6] },
      { id: 'obra-06-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto06), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-06')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-06', [true, false, false, false, false, false]),
  },
  {
    id: 'obra-07',
    numero: 'O-2026-007',
    clienteId: 'cli-02',
    presupuestoOrigenId: 'pre-07',
    datosTecnicos: PRESUPUESTOS[6].datosTecnicos,
    responsableId: 'pers-03',
    fechaInicio: '2026-06-16',
    fechaEstimadaPuestaEnMarcha: '2026-12-10',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-07')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-06-16', fechaReal: '2026-06-16', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-07-hito-1' },
      { id: etapaIds('obra-07')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-06-29', fechaReal: '2026-07-02', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-07')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-09-18', responsableId: 'pers-05', estado: 'en_curso', notas: 'A la espera de aprobación municipal del plano' },
      { id: etapaIds('obra-07')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-10-20', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-07-hito-2' },
      { id: etapaIds('obra-07')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-11-05', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-07')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-11-20', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-07')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-12-01', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-07-hito-3' },
      { id: etapaIds('obra-07')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-12-08', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-07-hito-4' },
      { id: etapaIds('obra-07')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-12-10', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[6].historial],
    documentos: [{ id: 'obra-07-doc-1', nombre: 'Presupuesto aprobado P-2026-0141 v1', tipo: 'presupuesto', fecha: '2026-06-09' }],
    fotos: fotosDe('obra-07', 2),
    obraCivil: civilItems('obra-07', [false, false, false, false, false]),
    planPagos: [
      { id: 'obra-07-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto07), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-07')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001248', cae: '72345678901812', fecha: '2026-06-16', importe: Math.round(planAnticipo(monto07) * 1.21), iva: Math.round(planAnticipo(monto07) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-06-19' } },
      { id: 'obra-07-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto07), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-07')[3] },
      { id: 'obra-07-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto07), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-07')[6] },
      { id: 'obra-07-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto07), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-07')[7] },
    ],
    adicionales: [{ id: 'obra-07-adic-1', descripcion: 'Botonera braille adicional en todas las paradas', monto: 850000, estado: 'Rechazado', fecha: '2026-07-05' }],
    expediente: expedienteItems('obra-07', [false, true, false, false, false, false]),
  },
  {
    id: 'obra-08',
    numero: 'O-2026-008',
    clienteId: 'cli-09',
    presupuestoOrigenId: 'pre-08',
    datosTecnicos: PRESUPUESTOS[7].datosTecnicos,
    responsableId: 'pers-04',
    fechaInicio: '2026-06-30',
    fechaEstimadaPuestaEnMarcha: '2026-12-18',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-08')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-06-30', fechaReal: '2026-06-30', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-08-hito-1' },
      { id: etapaIds('obra-08')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-07-13', fechaReal: '2026-07-16', responsableId: 'pers-05', estado: 'completa' },
      { id: etapaIds('obra-08')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-09-22', responsableId: 'pers-05', estado: 'en_curso', notas: 'Aprobación de planos con la administración del consorcio' },
      { id: etapaIds('obra-08')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-10-25', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-08-hito-2' },
      { id: etapaIds('obra-08')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-11-10', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-08')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-11-25', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-08')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2026-12-08', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-08-hito-3' },
      { id: etapaIds('obra-08')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2026-12-16', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-08-hito-4' },
      { id: etapaIds('obra-08')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2026-12-18', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[7].historial],
    documentos: [{ id: 'obra-08-doc-1', nombre: 'Presupuesto aprobado P-2026-0149 v1', tipo: 'presupuesto', fecha: '2026-06-22' }],
    fotos: fotosDe('obra-08', 1),
    obraCivil: civilItems('obra-08', [false, false, false, false, false]),
    planPagos: [
      { id: 'obra-08-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto08), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-08')[0], comprobante: { tipo: 'Factura B', numero: 'B-0003-00000871', cae: '72345678901999', fecha: '2026-06-30', importe: Math.round(planAnticipo(monto08) * 1.21), iva: Math.round(planAnticipo(monto08) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-07-03' } },
      { id: 'obra-08-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto08), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-08')[3] },
      { id: 'obra-08-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto08), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-08')[6] },
      { id: 'obra-08-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto08), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-08')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-08', [false, false, false, false, false, false]),
  },
  {
    id: 'obra-09',
    numero: 'O-2026-009',
    clienteId: 'cli-07',
    presupuestoOrigenId: 'pre-09',
    datosTecnicos: PRESUPUESTOS[8].datosTecnicos,
    responsableId: 'pers-03',
    fechaInicio: '2026-07-10',
    fechaEstimadaPuestaEnMarcha: '2027-01-12',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-09')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-07-10', fechaReal: '2026-07-10', responsableId: 'pers-03', estado: 'completa', hitoPagoId: 'obra-09-hito-1' },
      { id: etapaIds('obra-09')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-09-28', responsableId: 'pers-05', estado: 'en_curso', notas: 'Relevamiento programado para la semana del 28/9' },
      { id: etapaIds('obra-09')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-10-20', responsableId: 'pers-05', estado: 'pendiente' },
      { id: etapaIds('obra-09')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-11-20', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-09-hito-2' },
      { id: etapaIds('obra-09')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-12-10', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-09')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2026-12-22', responsableId: 'pers-03', estado: 'pendiente' },
      { id: etapaIds('obra-09')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2027-01-05', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-09-hito-3' },
      { id: etapaIds('obra-09')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2027-01-10', responsableId: 'pers-03', estado: 'pendiente', hitoPagoId: 'obra-09-hito-4' },
      { id: etapaIds('obra-09')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2027-01-12', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[8].historial],
    documentos: [{ id: 'obra-09-doc-1', nombre: 'Presupuesto aprobado P-2026-0156 v2', tipo: 'presupuesto', fecha: '2026-07-03' }],
    fotos: [],
    obraCivil: civilItems('obra-09', [false, false, false, false, false]),
    planPagos: [
      { id: 'obra-09-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto09), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-09')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001262', cae: '72345678902087', fecha: '2026-07-10', importe: Math.round(planAnticipo(monto09) * 1.21), iva: Math.round(planAnticipo(monto09) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-07-14' } },
      { id: 'obra-09-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto09), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-09')[3] },
      { id: 'obra-09-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto09), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-09')[6] },
      { id: 'obra-09-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto09), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-09')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-09', [false, false, false, false, false, false]),
  },
  {
    id: 'obra-10',
    numero: 'O-2026-010',
    clienteId: 'cli-12',
    presupuestoOrigenId: 'pre-10',
    datosTecnicos: PRESUPUESTOS[9].datosTecnicos,
    responsableId: 'pers-04',
    fechaInicio: '2026-07-24',
    fechaEstimadaPuestaEnMarcha: '2027-01-26',
    compartidaConCliente: false,
    etapas: [
      { id: etapaIds('obra-10')[0], nombre: ETAPAS_OBRA_NOMBRES[0], orden: 1, fechaPrevista: '2026-07-24', fechaReal: '2026-07-24', responsableId: 'pers-04', estado: 'completa', hitoPagoId: 'obra-10-hito-1' },
      { id: etapaIds('obra-10')[1], nombre: ETAPAS_OBRA_NOMBRES[1], orden: 2, fechaPrevista: '2026-10-02', responsableId: 'pers-05', estado: 'en_curso', notas: 'A coordinar con el desarrollador el acceso a la cochera' },
      { id: etapaIds('obra-10')[2], nombre: ETAPAS_OBRA_NOMBRES[2], orden: 3, fechaPrevista: '2026-10-25', responsableId: 'pers-05', estado: 'pendiente' },
      { id: etapaIds('obra-10')[3], nombre: ETAPAS_OBRA_NOMBRES[3], orden: 4, fechaPrevista: '2026-11-25', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-10-hito-2' },
      { id: etapaIds('obra-10')[4], nombre: ETAPAS_OBRA_NOMBRES[4], orden: 5, fechaPrevista: '2026-12-15', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-10')[5], nombre: ETAPAS_OBRA_NOMBRES[5], orden: 6, fechaPrevista: '2027-01-05', responsableId: 'pers-04', estado: 'pendiente' },
      { id: etapaIds('obra-10')[6], nombre: ETAPAS_OBRA_NOMBRES[6], orden: 7, fechaPrevista: '2027-01-18', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-10-hito-3' },
      { id: etapaIds('obra-10')[7], nombre: ETAPAS_OBRA_NOMBRES[7], orden: 8, fechaPrevista: '2027-01-24', responsableId: 'pers-04', estado: 'pendiente', hitoPagoId: 'obra-10-hito-4' },
      { id: etapaIds('obra-10')[8], nombre: ETAPAS_OBRA_NOMBRES[8], orden: 9, fechaPrevista: '2027-01-26', responsableId: 'pers-05', estado: 'pendiente' },
    ],
    historial: [...PRESUPUESTOS[9].historial],
    documentos: [{ id: 'obra-10-doc-1', nombre: 'Presupuesto aprobado P-2026-0163 v1', tipo: 'presupuesto', fecha: '2026-07-17' }],
    fotos: [],
    obraCivil: civilItems('obra-10', [false, false, false, false, false]),
    planPagos: [
      { id: 'obra-10-hito-1', nombre: 'Anticipo', monto: planAnticipo(monto10), estado: 'Cobrado', etapaAsociadaId: etapaIds('obra-10')[0], comprobante: { tipo: 'Factura A', numero: 'A-0003-00001270', cae: '72345678902154', fecha: '2026-07-24', importe: Math.round(planAnticipo(monto10) * 1.21), iva: Math.round(planAnticipo(monto10) * 0.21) }, cobro: { metodo: 'Transferencia', fecha: '2026-07-28' } },
      { id: 'obra-10-hito-2', nombre: 'Certificado de avance - Fabricación', monto: planCert(monto10), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-10')[3] },
      { id: 'obra-10-hito-3', nombre: 'Certificado de avance - Montaje', monto: planCert2(monto10), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-10')[6] },
      { id: 'obra-10-hito-4', nombre: 'Saldo final - Puesta en marcha', monto: planSaldo(monto10), estado: 'Pendiente', etapaAsociadaId: etapaIds('obra-10')[7] },
    ],
    adicionales: [],
    expediente: expedienteItems('obra-10', [false, false, false, false, false, false]),
  },
]

export function obraPorId(id: string): Obra | undefined {
  return OBRAS.find((o) => o.id === id)
}
