import { getUsuarioActual } from '@/lib/session'
import { hoyISO } from '@/lib/fechas'
import { Shell } from '@/components/shell/shell'
import { NuevoProvider } from '@/components/shell/nuevo'
import { BusquedaProvider } from '@/components/shell/busqueda'
import { ToastProvider } from '@/components/ui/toast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioActual()
  return (
    <ToastProvider>
      <BusquedaProvider>
        <NuevoProvider hoy={hoyISO()}>
          <Shell nombre={usuario.nombre} direccion={usuario.rol === 'direccion'}>{children}</Shell>
        </NuevoProvider>
      </BusquedaProvider>
    </ToastProvider>
  )
}
