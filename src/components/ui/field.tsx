import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const CONTROL =
  'w-full rounded-control border border-line-strong bg-surface px-3 text-[14px] text-ink placeholder:text-ink-3/70 transition-[border-color,box-shadow] duration-150 hover:border-ink/30 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10 disabled:bg-subtle disabled:text-ink-3'

export function Field({ label, hint, error, htmlFor, children, className }: { label: string; hint?: string; error?: string; htmlFor?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-2">
        {label}
      </label>
      {children}
      {error ? <p className="text-[12.5px] text-bad">{error}</p> : hint ? <p className="text-[12.5px] text-ink-3">{hint}</p> : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(CONTROL, 'h-10', className)} {...props} />
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select ref={ref} className={cn(CONTROL, 'h-10 cursor-pointer appearance-none pr-9', className)} {...props}>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(CONTROL, 'min-h-[88px] resize-y py-2.5 leading-relaxed', className)} {...props} />
})
