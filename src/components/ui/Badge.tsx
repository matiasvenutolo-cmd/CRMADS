import { cn } from '@/lib/utils'
import { TONE_CLASSES, type BadgeTone } from '@/lib/badges'

export function Badge({ tone = 'muted', children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap', TONE_CLASSES[tone], className)}>
      {children}
    </span>
  )
}
