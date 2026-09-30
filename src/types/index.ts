export type Tipologia =
  | 'Ascensor electromecánico'
  | 'Ascensor hidráulico'
  | 'Sin sala de máquinas'
  | 'Monta vehículos'
  | 'Monta camillas'
  | 'Montacargas'
  | 'Monta platos / papeles'

export type Localidad =
  | 'Lanús Oeste'
  | 'Lanús Este'
  | 'CABA'
  | 'Banfield'
  | 'Avellaneda'
  | 'Villa Gesell'
  | 'Mar del Plata'
  | 'Tortuguitas'

export type TipoPuerta = 'Automática telescópica' | 'Automática central' | 'Batiente manual'

export type RolEquipo = 'comercial' | 'responsable_obra' | 'ingenieria' | 'direccion'

export interface Persona {
  id: string
  nombre: string
  rol: RolEquipo
  iniciales: string
}

export interface Contacto {
  id: string
  nombre: string
  cargo: string
  telefono: string
  email: string
}

export type CondicionIVA = 'Responsable Inscripto' | 'Monotributista' | 'Exento'

export interface Cliente {
  id: string
  nombre: string
  tipo: 'Constructora' | 'Estudio de arquitectura' | 'Desarrolladora' | 'Administración de consorcio'
  cuit: string
  condicionIVA: CondicionIVA
  localidad: Localidad
  contactos: Contacto[]
}

export interface DatosTecnicos {
  tipologia: Tipologia
  cargaKg: number
  paradas: number
  recorridoM: number
  velocidad: string
  tipoPuertas: TipoPuerta
  cantidadEquipos: number
  direccion: string
  localidad: Localidad
}

export type TipoEventoHistorial = 'llamada' | 'mail' | 'reunion' | 'nota' | 'sistema'

export interface EventoHistorial {
  id: string
  fecha: string
  tipo: TipoEventoHistorial
  autorId: string
  descripcion: string
}

export interface VersionPresupuesto {
  version: number
  fecha: string
  monto: number
  nota?: string
}

export type EstadoPresupuesto = 'Borrador' | 'Enviado' | 'En negociación' | 'Aprobado' | 'Perdido'

export type MotivoPerdida = 'Precio' | 'Plazo' | 'Eligió otra empresa' | 'Obra postergada'

export interface Presupuesto {
  id: string
  numero: string
  clienteId: string
  datosTecnicos: DatosTecnicos
  estado: EstadoPresupuesto
  versiones: VersionPresupuesto[]
  fechaEnvio: string
  vendedorId: string
  motivoPerdida?: MotivoPerdida
  proximoPaso?: string
  historial: EventoHistorial[]
  obraId?: string
}

export type EstadoEtapa = 'pendiente' | 'en_curso' | 'completa' | 'atrasada'

export interface EtapaObra {
  id: string
  nombre: string
  orden: number
  fechaPrevista: string
  fechaReal?: string
  responsableId: string
  estado: EstadoEtapa
  notas?: string
  hitoPagoId?: string
}

export type EstadoHitoPago = 'Pendiente' | 'Listo para facturar' | 'Facturado' | 'Cobrado'

export interface Comprobante {
  tipo: 'Factura A' | 'Factura B'
  numero: string
  cae: string
  fecha: string
  importe: number
  iva: number
}

export interface Cobro {
  metodo: 'Transferencia' | 'Cheque' | 'eCheq'
  fecha: string
}

export interface HitoPago {
  id: string
  nombre: string
  monto: number
  estado: EstadoHitoPago
  etapaAsociadaId?: string
  comprobante?: Comprobante
  cobro?: Cobro
}

export type EstadoAdicional = 'Pendiente' | 'Aprobado' | 'Rechazado'

export interface Adicional {
  id: string
  descripcion: string
  monto: number
  estado: EstadoAdicional
  fecha: string
}

export interface ItemObraCivil {
  id: string
  nombre: string
  listo: boolean
}

export interface ItemExpediente {
  id: string
  nombre: string
  completo: boolean
}

export interface Documento {
  id: string
  nombre: string
  tipo: 'plano' | 'presupuesto' | 'certificado' | 'acta'
  fecha: string
}

export interface Foto {
  id: string
  etiqueta: string
  color: string
}

export interface Obra {
  id: string
  numero: string
  clienteId: string
  presupuestoOrigenId: string
  datosTecnicos: DatosTecnicos
  responsableId: string
  fechaInicio: string
  fechaEstimadaPuestaEnMarcha: string
  etapas: EtapaObra[]
  historial: EventoHistorial[]
  documentos: Documento[]
  fotos: Foto[]
  obraCivil: ItemObraCivil[]
  planPagos: HitoPago[]
  adicionales: Adicional[]
  expediente: ItemExpediente[]
  compartidaConCliente: boolean
}
