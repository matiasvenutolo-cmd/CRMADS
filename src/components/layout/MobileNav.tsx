'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_MOBILE } from './nav'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-white/95 backdrop-blur md:hidden">
      {NAV_MOBILE.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn('flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', active ? 'text-brand-blue' : 'text-muted')}
          >
            <Icon size={19} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
