'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { NAV_OBRAS, NAV_HERRAMIENTAS } from './nav'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-line px-5 py-5">
        <Image src="/logo/ads-logo.png" alt="ADS" width={64} height={36} className="shrink-0" />
        <div>
          <p className="font-display text-sm font-bold leading-tight text-ink">ADS Obras</p>
          <p className="text-[11px] leading-tight text-muted">CRM de obras</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Obras</p>
          <ul className="flex flex-col gap-0.5">
            {NAV_OBRAS.map((item) => (
              <NavItem key={item.href} item={item} active={pathname === item.href} />
            ))}
          </ul>
        </div>
        <div>
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Herramientas</p>
          <ul className="flex flex-col gap-0.5">
            {NAV_HERRAMIENTAS.map((item) => (
              <NavItem key={item.href} item={item} active={pathname === item.href} />
            ))}
            <li>
              <Link
                href="/#asistente"
                className="flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-paper hover:text-ink"
              >
                <Sparkles size={17} />
                Asistente
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="border-t border-line px-4 py-4">
        <p className="rounded-[8px] bg-paper px-3 py-2 text-center text-[11px] font-medium text-muted">Prototipo · datos de ejemplo</p>
      </div>
    </aside>
  )
}

function NavItem({ item, active }: { item: { href: string; label: string; icon: React.ComponentType<{ size?: number }> }; active: boolean }) {
  const Icon = item.icon
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors',
          active ? 'bg-brand-blue text-white' : 'text-muted hover:bg-paper hover:text-ink'
        )}
      >
        <Icon size={17} />
        {item.label}
      </Link>
    </li>
  )
}
