import { create } from 'zustand'
import type {
  Presupuesto,
  Obra,
  EstadoPresupuesto,
  MotivoPerdida,
  EventoHistorial,
  Comprobante,
  DatosTecnicos,
} from '@/types'
import { PRESUPUESTOS as PRESUPUESTOS_INICIALES } from '@/data/presupuestos'
import { OBRAS as OBRAS_INICIALES } from '@/data/obras'
import { clientePorId } from '@/data/clientes'
import { ETAPAS_OBRA_NOMBRES, OBRA_CIVIL_ITEMS, EXPEDIENTE_ITEMS } from '@/data/constants'
import { HOY, formatDate } from '@/lib/format'
import { generarId } from '@/lib/utils'

function clonarPresupuestos(): Presupuesto[] {
  return JSON.parse(JSON.stringify(PRESUPUESTOS_INICIALES))
}
function clonarObras(): Obra[] {
  return JSON.parse(JSON.stringify(OBRAS_INICIALES))
}

export interface Toast {
  id: string
  mensaje: string
  tipo: 'success' | 'info'
}

interface AprobarResultado {
  obraId: string
}

interface Store {
  presupuestos: Presupuesto[]
  obras: Obra[]
  toasts: Toast[]
  comandoAbierto: boolean
  proximaFactura: number
  demoPaso: number | null

  setComandoAbierto: (abierto: boolean) => void
  setDemoPaso: (paso: number | null) => void
  addToast: (mensaje: string, tipo?: Toast['tipo']) => void
  removeToast: (id: string) => void

  reset: () => void

  moverPresupuesto: (id: string, estado: EstadoPresupuesto) => void
  aprobarPresupuesto: (id: string, anticipoPct: number, responsableId: string) => AprobarResultado
  marcarPerdido: (id: string, motivo: MotivoPerdida) => void
  agregarNotaPresupuesto: (id: string, texto: string) => void
  crearPresupuestoDesdeCotizador: (datos: DatosTecnicos, clienteId: string, monto: number) => string

  agregarNotaObra: (obraId: string, texto: string) => void
  completarEtapa: (obraId: string, etapaId: string) => void
  facturarHito: (obraId: string, hitoId: string) => void
  registrarCobro: (obraId: string, hitoId: string, metodo: 'Transferencia' | 'Cheque' | 'eCheq') => void
  toggleObraCivil: (obraId: string, itemId: string) => void
  toggleExpediente: (obraId: string, itemId: string) => void
  agregarAdicional: (obraId: string, descripcion: string, monto: number) => void
  resolverAdicional: (obraId: string, adicionalId: string, aprobado: boolean) => void
  compartirConCliente: (obraId: string) => void
  registrarAvanceParteDeObra: (obraId: string, nota: string) => void
}

export const useStore = create<Store>()((set, get) => ({
  presupuestos: clonarPresupuestos(),
  obras: clonarObras(),
  toasts: [],
  comandoAbierto: false,
  proximaFactura: 1302,
  demoPaso: null,

  setComandoAbierto: (abierto) => set({ comandoAbierto: abierto }),
  setDemoPaso: (paso) => set({ demoPaso: paso }),

  addToast: (mensaje, tipo = 'success') => {
    const id = generarId('toast')
    set((s) => ({ toasts: [...s.toasts, { id, mensaje, tipo }] }))
    setTimeout(() => get().removeToast(id), 3600)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  reset: () => {
    set({ presupuestos: clonarPresupuestos(), obras: clonarObras(), toasts: [] })
    get().addToast('Datos de ejemplo restablecidos', 'info')
  },

  moverPresupuesto: (id, estado) => {
    set((s) => ({
      presupuestos: s.presupuestos.map((p) => (p.id === id ? { ...p, estado } : p)),
    }))
  },

  aprobarPresupuesto: (id, anticipoPct, responsableId) => {
    const pre = get().presupuestos.find((p) => p.id === id)
    if (!pre) throw new Error('Presupuesto no encontrado')
    const monto = pre.versiones[pre.versiones.length - 1].monto
    const obraId = generarId('obra')
    const numeroObra = `O-2026-${String(get().obras.length + 11).padStart(3, '0')}`
    const anticipo = Math.round(monto * anticipoPct)

    const etapas = ETAPAS_OBRA_NOMBRES.map((nombre, i) => ({
      id: `${obraId}-et-${i + 1}`,
      nombre,
      orden: i + 1,
      fechaPrevista: HOY,
      responsableId,
      estado: (i === 0 ? 'completa' : 'pendiente') as 'completa' | 'pendiente',
      fechaReal: i === 0 ? HOY : undefined,
      hitoPagoId: i === 0 ? `${obraId}-hito-1` : undefined,
    }))

    const nuevaObra: Obra = {
      id: obraId,
      numero: numeroObra,
      clienteId: pre.clienteId,
      presupuestoOrigenId: pre.id,
      datosTecnicos: pre.datosTecnicos,
      responsableId,
      fechaInicio: HOY,
      fechaEstimadaPuestaEnMarcha: HOY,
      compartidaConCliente: false,
      etapas,
      historial: [
        ...pre.historial,
        {
          id: generarId('ev'),
          fecha: HOY,
          tipo: 'sistema',
          autorId: responsableId,
          descripcion: `Presupuesto aprobado, anticipo del ${Math.round(anticipoPct * 100)}% confirmado y obra creada`,
        },
      ],
      documentos: [{ id: generarId('doc'), nombre: `Presupuesto aprobado ${pre.numero}`, tipo: 'presupuesto', fecha: HOY }],
      fotos: [],
      obraCivil: OBRA_CIVIL_ITEMS.map((nombre, i) => ({ id: `${obraId}-civ-${i + 1}`, nombre, listo: false })),
      planPagos: [
        {
          id: `${obraId}-hito-1`,
          nombre: 'Anticipo',
          monto: anticipo,
          estado: 'Cobrado',
          etapaAsociadaId: `${obraId}-et-1`,
          comprobante: emitirComprobante(get, set, pre.clienteId, anticipo, HOY),
          cobro: { metodo: 'Transferencia', fecha: HOY },
        },
        { id: `${obraId}-hito-2`, nombre: 'Certificado de avance - Fabricación', monto: Math.round(monto * 0.3), estado: 'Pendiente', etapaAsociadaId: `${obraId}-et-4` },
        { id: `${obraId}-hito-3`, nombre: 'Certificado de avance - Montaje', monto: Math.round(monto * 0.2), estado: 'Pendiente', etapaAsociadaId: `${obraId}-et-7` },
        { id: `${obraId}-hito-4`, nombre: 'Saldo final - Puesta en marcha', monto: Math.round(monto * (1 - anticipoPct - 0.3 - 0.2)), estado: 'Pendiente', etapaAsociadaId: `${obraId}-et-8` },
      ],
      adicionales: [],
      expediente: EXPEDIENTE_ITEMS.map((nombre, i) => ({ id: `${obraId}-exp-${i + 1}`, nombre, completo: false })),
    }

    set((s) => ({
      presupuestos: s.presupuestos.map((p) => (p.id === id ? { ...p, estado: 'Aprobado' as EstadoPresupuesto, obraId } : p)),
      obras: [...s.obras, nuevaObra],
    }))

    return { obraId }
  },

  marcarPerdido: (id, motivo) => {
    set((s) => ({
      presupuestos: s.presupuestos.map((p) =>
        p.id === id
          ? {
              ...p,
              estado: 'Perdido' as EstadoPresupuesto,
              motivoPerdida: motivo,
              historial: [...p.historial, { id: generarId('ev'), fecha: HOY, tipo: 'sistema', autorId: p.vendedorId, descripcion: `Presupuesto marcado como perdido: ${motivo.toLowerCase()}` }],
            }
          : p
      ),
    }))
  },

  agregarNotaPresupuesto: (id, texto) => {
    set((s) => ({
      presupuestos: s.presupuestos.map((p) =>
        p.id === id ? { ...p, historial: [...p.historial, { id: generarId('ev'), fecha: HOY, tipo: 'nota', autorId: p.vendedorId, descripcion: texto } as EventoHistorial] } : p
      ),
    }))
  },

  crearPresupuestoDesdeCotizador: (datos, clienteId, monto) => {
    const id = generarId('pre')
    const numero = `P-2026-0${180 + get().presupuestos.length}`
    const nuevo: Presupuesto = {
      id,
      numero,
      clienteId,
      estado: 'Borrador',
      vendedorId: 'pers-01',
      fechaEnvio: HOY,
      datosTecnicos: datos,
      versiones: [{ version: 1, fecha: HOY, monto }],
      historial: [{ id: generarId('ev'), fecha: HOY, tipo: 'sistema', autorId: 'pers-01', descripcion: 'Presupuesto generado automáticamente desde el cotizador' }],
    }
    set((s) => ({ presupuestos: [...s.presupuestos, nuevo] }))
    return id
  },

  agregarNotaObra: (obraId, texto) => {
    set((s) => ({
      obras: s.obras.map((o) =>
        o.id === obraId ? { ...o, historial: [...o.historial, { id: generarId('ev'), fecha: HOY, tipo: 'nota', autorId: o.responsableId, descripcion: texto } as EventoHistorial] } : o
      ),
    }))
  },

  completarEtapa: (obraId, etapaId) => {
    set((s) => ({
      obras: s.obras.map((o) => {
        if (o.id !== obraId) return o
        const idx = o.etapas.findIndex((e) => e.id === etapaId)
        if (idx === -1) return o
        const etapas = o.etapas.map((e, i) => {
          if (e.id === etapaId) return { ...e, estado: 'completa' as const, fechaReal: HOY }
          if (i === idx + 1 && (e.estado === 'pendiente' || e.estado === 'atrasada')) return { ...e, estado: 'en_curso' as const }
          return e
        })
        const etapaCompletada = o.etapas[idx]
        const planPagos = o.planPagos.map((h) => (h.etapaAsociadaId === etapaCompletada.id && h.estado === 'Pendiente' ? { ...h, estado: 'Listo para facturar' as const } : h))
        const historial = [
          ...o.historial,
          { id: generarId('ev'), fecha: HOY, tipo: 'sistema' as const, autorId: o.responsableId, descripcion: `Etapa completada: ${etapaCompletada.nombre}` },
        ]
        return { ...o, etapas, planPagos, historial }
      }),
    }))
    get().addToast('Etapa marcada como completa')
  },

  facturarHito: (obraId, hitoId) => {
    const obra = get().obras.find((o) => o.id === obraId)
    if (!obra) return
    const hito = obra.planPagos.find((h) => h.id === hitoId)
    if (!hito) return
    const comprobante = emitirComprobante(get, set, obra.clienteId, hito.monto, HOY)
    set((s) => ({
      obras: s.obras.map((o) =>
        o.id === obraId
          ? {
              ...o,
              planPagos: o.planPagos.map((h) => (h.id === hitoId ? { ...h, estado: 'Facturado' as const, comprobante } : h)),
              historial: [...o.historial, { id: generarId('ev'), fecha: HOY, tipo: 'sistema' as const, autorId: o.responsableId, descripcion: `Facturado: ${hito.nombre} (${comprobante.numero})` }],
            }
          : o
      ),
    }))
    get().addToast('Comprobante emitido')
  },

  registrarCobro: (obraId, hitoId, metodo) => {
    set((s) => ({
      obras: s.obras.map((o) =>
        o.id === obraId
          ? {
              ...o,
              planPagos: o.planPagos.map((h) => (h.id === hitoId ? { ...h, estado: 'Cobrado' as const, cobro: { metodo, fecha: HOY } } : h)),
              historial: [...o.historial, { id: generarId('ev'), fecha: HOY, tipo: 'sistema' as const, autorId: o.responsableId, descripcion: `Cobro registrado vía ${metodo}` }],
            }
          : o
      ),
    }))
    get().addToast('Cobro registrado')
  },

  toggleObraCivil: (obraId, itemId) => {
    set((s) => ({
      obras: s.obras.map((o) => (o.id === obraId ? { ...o, obraCivil: o.obraCivil.map((c) => (c.id === itemId ? { ...c, listo: !c.listo } : c)) } : o)),
    }))
  },

  toggleExpediente: (obraId, itemId) => {
    set((s) => ({
      obras: s.obras.map((o) => (o.id === obraId ? { ...o, expediente: o.expediente.map((c) => (c.id === itemId ? { ...c, completo: !c.completo } : c)) } : o)),
    }))
  },

  agregarAdicional: (obraId, descripcion, monto) => {
    set((s) => ({
      obras: s.obras.map((o) =>
        o.id === obraId
          ? { ...o, adicionales: [...o.adicionales, { id: generarId('adic'), descripcion, monto, estado: 'Pendiente', fecha: HOY }] }
          : o
      ),
    }))
  },

  resolverAdicional: (obraId, adicionalId, aprobado) => {
    set((s) => ({
      obras: s.obras.map((o) => {
        if (o.id !== obraId) return o
        const adicional = o.adicionales.find((a) => a.id === adicionalId)
        if (!adicional) return o
        const adicionales = o.adicionales.map((a) => (a.id === adicionalId ? { ...a, estado: aprobado ? ('Aprobado' as const) : ('Rechazado' as const) } : a))
        const planPagos = aprobado
          ? [...o.planPagos, { id: generarId('hito'), nombre: `Adicional: ${adicional.descripcion}`, monto: adicional.monto, estado: 'Listo para facturar' as const }]
          : o.planPagos
        return { ...o, adicionales, planPagos }
      }),
    }))
  },

  compartirConCliente: (obraId) => {
    set((s) => ({ obras: s.obras.map((o) => (o.id === obraId ? { ...o, compartidaConCliente: true } : o)) }))
  },

  registrarAvanceParteDeObra: (obraId, nota) => {
    set((s) => ({
      obras: s.obras.map((o) =>
        o.id === obraId ? { ...o, historial: [...o.historial, { id: generarId('ev'), fecha: HOY, tipo: 'nota' as const, autorId: o.responsableId, descripcion: nota }] } : o
      ),
    }))
    get().addToast('Parte de obra registrado')
  },
}))

function emitirComprobante(get: () => Store, set: (partial: Partial<Store> | ((s: Store) => Partial<Store>)) => void, clienteId: string, monto: number, fecha: string): Comprobante {
  const cliente = clientePorId(clienteId)
  const tipo = cliente?.condicionIVA === 'Responsable Inscripto' ? 'Factura A' : 'Factura B'
  const numero = get().proximaFactura
  set({ proximaFactura: numero + 1 })
  const iva = Math.round(monto * 0.21)
  return {
    tipo,
    numero: `${tipo === 'Factura A' ? 'A' : 'B'}-0003-${String(numero).padStart(8, '0')}`,
    cae: `7234567890${String(numero).padStart(4, '0')}`,
    fecha,
    importe: monto + iva,
    iva,
  }
}

export function fechaFormateada(iso: string): string {
  return formatDate(iso)
}
