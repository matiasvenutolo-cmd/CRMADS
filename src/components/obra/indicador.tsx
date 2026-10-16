import { cn } from '@/lib/utils'

type EtapaMini = { orden: number; estado: string }

/** Indicador compacto de pisos: un segmento por etapa, la actual resaltada. */
export function IndicadorEtapas({ etapas, atrasada, className }: { etapas: EtapaMini[]; atrasada?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-[3px]', className)} aria-hidden>
      {[...etapas]
        .sort((a, b) => a.orden - b.orden)
        .map((e) => (
          <span
            key={e.orden}
            className={cn(
              'h-[14px] w-[5px] rounded-[1.5px]',
              e.estado === 'completa' && 'bg-ink/80',
              e.estado === 'en_curso' && (atrasada ? 'bg-warn-dot' : 'bg-accent'),
              e.estado === 'pendiente' && 'bg-line-strong'
            )}
          />
        ))}
    </div>
  )
}
