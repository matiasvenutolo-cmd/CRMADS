'use client'

import { createContext, useContext } from 'react'

// Gerardo (dirección) consulta todo pero no modifica nada: los controles de edición se ocultan.
// Las acciones del servidor lo bloquean igual (requerirEdicion), esto es sólo la interfaz.
const Permisos = createContext(true)

export function PermisosProvider({ puedeEditar, children }: { puedeEditar: boolean; children: React.ReactNode }) {
  return <Permisos.Provider value={puedeEditar}>{children}</Permisos.Provider>
}

export function usePuedeEditar() {
  return useContext(Permisos)
}
