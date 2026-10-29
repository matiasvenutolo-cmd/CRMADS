'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Search, FileText, HardHat, Building2, KeyRound, LogOut, ChevronDown } from 'lucide-react'
import { NAV, NAV_DIRECCION, activo } from './nav'
import { useNuevo } from './nuevo'
import { useBusqueda } from './busqueda'
import { Menu, MenuItem } from '@/components/ui/menu'
import { cerrarSesion } from '@/lib/actions/auth'
import { iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { CambiarPassword } from './cambiar-password'

export function Shell({ nombre, direccion, children }: { nombre: string; direccion: boolean; children: React.ReactNode }) {
  const items = direccion ? NAV_DIRECCION : NAV
  const pathname = usePathname()
  const { abrir } = useNuevo()
  const { abrir: abrirBusqueda } = useBusqueda()
  const [password, setPassword] = useState(false)

  const menuNuevo = (cerrar: () => void) => (
    <>
      <MenuItem icono={<FileText />} onClick={() => (cerrar(), abrir('presupuesto'))}>
        Presupuesto
      </MenuItem>
      <MenuItem icono={<HardHat />} onClick={() => (cerrar(), abrir('obra'))}>
        Obra en curso
      </MenuItem>
      <MenuItem icono={<Building2 />} onClick={() => (cerrar(), abrir('cliente'))}>
        Cliente
      </MenuItem>
    </>
  )

  const menuUsuario = (cerrar: () => void) => (
    <>
      <div className="px-2.5 pb-2 pt-1.5">
        <p className="text-[14px] font-medium text-ink">{nombre}</p>
        <p className="text-[12.5px] text-ink-3">{direccion ? 'Dirección · ADS Obras' : 'ADS Obras'}</p>
      </div>
      <div className="my-1 h-px bg-line" />
      <MenuItem icono={<KeyRound />} onClick={() => (cerrar(), setPassword(true))}>
        Cambiar contraseña
      </MenuItem>
      <MenuItem icono={<LogOut />} onClick={() => cerrarSesion()}>
        Salir
      </MenuItem>
    </>
  )

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3 px-4 md:gap-6 md:px-8">
          <Link href={direccion ? '/tablero' : '/'} className="flex shrink-0 items-center gap-2.5" aria-label="Inicio">
            <Image src="/logo/ads-logo.png" alt="ADS" width={48} height={27} priority />
            <span className="hidden font-serif text-[20px] uppercase leading-none tracking-[0.04em] text-ink lg:inline">Obras</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-0.5 rounded-full bg-ink/[0.045] p-1 md:flex">
            {items.map((item) => {
              const on = activo(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={on ? 'page' : undefined}
                  className={cn(
                    'rounded-full px-3.5 py-1.5 text-[13.5px] font-medium transition-all duration-150',
                    on ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(21_23_26/0.08),0_0_0_1px_rgb(21_23_26/0.05)]' : 'text-ink-3 hover:text-ink'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={abrirBusqueda}
              className="hidden h-9 w-56 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 text-[13.5px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 lg:flex"
            >
              <Search className="size-4" />
              Buscar
              <kbd className="ml-auto rounded border border-line px-1.5 font-mono text-[11px] text-ink-3">⌘K</kbd>
            </button>
            <button type="button" onClick={abrirBusqueda} aria-label="Buscar" className="flex size-9 cursor-pointer items-center justify-center rounded-full text-ink-2 hover:bg-ink/5 lg:hidden">
              <Search className="size-[18px]" />
            </button>

            <div className={cn('hidden', !direccion && 'md:block')}>
              <Menu
                disparador={({ alternar, abierto }) => (
                  <button type="button" onClick={alternar} aria-expanded={abierto} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-brand pl-3.5 pr-3 text-[13.5px] font-medium text-white transition-colors hover:bg-brand-hover">
                    <Plus className="size-4" />
                    Nuevo
                    <ChevronDown className={cn('size-3.5 opacity-70 transition-transform', abierto && 'rotate-180')} />
                  </button>
                )}
              >
                {menuNuevo}
              </Menu>
            </div>

            <Menu
              disparador={({ alternar, abierto }) => (
                <button
                  type="button"
                  onClick={alternar}
                  aria-expanded={abierto}
                  aria-label="Cuenta"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-[12.5px] font-semibold text-ink-2 transition-colors hover:border-ink/30"
                >
                  {iniciales(nombre)}
                </button>
              )}
            >
              {menuUsuario}
            </Menu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 pb-32 pt-7 md:px-8 md:pb-16 md:pt-10">{children}</main>

      <nav aria-label="Principal" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        {direccion ? (
          <div className="grid h-16 grid-cols-4 items-center">
            {items.map((item) => (
              <TabMovil key={item.href} {...item} on={activo(pathname, item.href)} />
            ))}
          </div>
        ) : (
          <div className="grid h-16 grid-cols-5 items-center">
            {NAV.slice(0, 2).map((item) => (
              <TabMovil key={item.href} {...item} on={activo(pathname, item.href)} />
            ))}
            <div className="flex justify-center">
              <Menu
                alinear="izquierda"
                className="bottom-[calc(100%+12px)] left-1/2 top-auto -translate-x-1/2"
                disparador={({ alternar, abierto }) => (
                  <button
                    type="button"
                    onClick={alternar}
                    aria-label="Nuevo"
                    aria-expanded={abierto}
                    className="-mt-5 flex size-14 cursor-pointer items-center justify-center rounded-full bg-brand text-white shadow-float transition-transform active:scale-95"
                  >
                    <Plus className={cn('size-6 transition-transform duration-200', abierto && 'rotate-45')} />
                  </button>
                )}
              >
                {menuNuevo}
              </Menu>
            </div>
            {NAV.slice(2).map((item) => (
              <TabMovil key={item.href} {...item} on={activo(pathname, item.href)} />
            ))}
          </div>
        )}
      </nav>

      <CambiarPassword abierto={password} onCerrar={() => setPassword(false)} />
    </div>
  )
}

function TabMovil({ href, label, icono: Icono, on }: { href: string; label: string; icono: React.ComponentType<{ className?: string }>; on: boolean }) {
  return (
    <Link href={href} aria-current={on ? 'page' : undefined} className={cn('flex flex-col items-center gap-1 text-[11px] font-medium', on ? 'text-ink' : 'text-ink-3')}>
      <Icono className={cn('size-[21px]', on && 'stroke-[2.25]')} />
      {label}
    </Link>
  )
}
