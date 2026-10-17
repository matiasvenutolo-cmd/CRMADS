import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const VARIANTES = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:bg-ink/40',
  accent: 'bg-accent text-white hover:bg-accent-hover disabled:bg-accent/40',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-subtle hover:border-ink/25',
  ghost: 'text-ink-2 hover:bg-ink/[0.05] hover:text-ink',
  danger: 'text-bad hover:bg-bad-soft',
}
const TAMANOS = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-[14px] gap-2',
  lg: 'h-12 px-5 text-[15px] gap-2',
  icon: 'h-9 w-9 justify-center',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: keyof typeof VARIANTES
  tamano?: keyof typeof TAMANOS
  cargando?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variante = 'secondary', tamano = 'md', cargando, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || cargando}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-control font-medium transition-colors duration-150 disabled:cursor-not-allowed',
        VARIANTES[variante],
        TAMANOS[tamano],
        className
      )}
      {...props}
    >
      {cargando && <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />}
      {children}
    </button>
  )
})
