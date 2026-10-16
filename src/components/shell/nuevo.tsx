'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { PresupuestoForm } from '@/components/forms/presupuesto-form'
import { ObraForm } from '@/components/forms/obra-form'
import { ClienteForm } from '@/components/forms/cliente-form'
import { opcionesDeClientes } from '@/lib/actions/clientes'

type Tipo = 'presupuesto' | 'obra' | 'cliente'
const Ctx = createContext<{ abrir: (t: Tipo) => void }>({ abrir: () => {} })

export function useNuevo() {
  return useContext(Ctx)
}

export function NuevoProvider({ hoy, children }: { hoy: string; children: React.ReactNode }) {
  const [tipo, setTipo] = useState<Tipo | null>(null)
  const [vez, setVez] = useState(0)
  const [opciones, setOpciones] = useState<{ id: string; nombre: string }[]>([])

  const abrir = useCallback((t: Tipo) => {
    if (t !== 'cliente') opcionesDeClientes().then(setOpciones)
    setVez((v) => v + 1)
    setTipo(t)
  }, [])
  const cerrar = () => setTipo(null)

  return (
    <Ctx.Provider value={{ abrir }}>
      {children}
      <PresupuestoForm key={`p${vez}`} abierto={tipo === 'presupuesto'} onCerrar={cerrar} opciones={opciones} hoy={hoy} />
      <ObraForm key={`o${vez}`} abierto={tipo === 'obra'} onCerrar={cerrar} opciones={opciones} hoy={hoy} />
      <ClienteForm key={`c${vez}`} abierto={tipo === 'cliente'} onCerrar={cerrar} />
    </Ctx.Provider>
  )
}
