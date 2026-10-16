'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ValorCliente = { id?: string; nuevo?: string; nombre: string } | null

export function ClienteSelector({ opciones, valor, onChange, id }: { opciones: { id: string; nombre: string }[]; valor: ValorCliente; onChange: (v: ValorCliente) => void; id?: string }) {
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [resaltado, setResaltado] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtradas = useMemo(() => {
    const t = texto.trim().toLowerCase()
    return (t ? opciones.filter((o) => o.nombre.toLowerCase().includes(t)) : opciones).slice(0, 8)
  }, [texto, opciones])
  const exacto = opciones.some((o) => o.nombre.toLowerCase() === texto.trim().toLowerCase())
  const items = [...filtradas.map((o) => ({ tipo: 'existente' as const, ...o })), ...(texto.trim() && !exacto ? [{ tipo: 'nuevo' as const, id: '', nombre: texto.trim() }] : [])]

  function elegir(i: (typeof items)[number]) {
    onChange(i.tipo === 'nuevo' ? { nuevo: i.nombre, nombre: i.nombre } : { id: i.id, nombre: i.nombre })
    setTexto('')
    setAbierto(false)
  }

  if (valor) {
    return (
      <div className="flex h-10 items-center justify-between gap-2 rounded-control border border-line-strong bg-surface pl-3 pr-1.5">
        <span className="flex min-w-0 items-center gap-2 text-[14px] text-ink">
          <span className="truncate font-medium">{valor.nombre}</span>
          {valor.nuevo && <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11.5px] font-medium text-accent">Nuevo</span>}
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
          className="flex size-7 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink"
          aria-label="Cambiar cliente"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        id={id}
        ref={inputRef}
        data-autofocus
        value={texto}
        autoComplete="off"
        placeholder="Buscá o escribí el nombre de un cliente nuevo"
        onFocus={() => setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 120)}
        onChange={(e) => {
          setTexto(e.target.value)
          setResaltado(0)
          setAbierto(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setResaltado((r) => Math.min(r + 1, items.length - 1))
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            setResaltado((r) => Math.max(r - 1, 0))
          }
          if (e.key === 'Enter' && items[resaltado]) {
            e.preventDefault()
            elegir(items[resaltado])
          }
        }}
        role="combobox"
        aria-expanded={abierto}
        aria-controls="cliente-opciones"
        className="h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-[14px] text-ink placeholder:text-ink-3/70 hover:border-ink/30 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
      />
      {abierto && items.length > 0 && (
        <ul id="cliente-opciones" role="listbox" className="absolute inset-x-0 top-[calc(100%+4px)] z-20 max-h-64 animate-enter overflow-y-auto rounded-[12px] border border-line bg-surface p-1.5 shadow-float">
          {items.map((i, idx) => (
            <li key={i.tipo + i.id + i.nombre}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(i)}
                onMouseEnter={() => setResaltado(idx)}
                className={cn('flex w-full cursor-pointer items-center gap-2 rounded-[8px] px-2.5 py-2 text-left text-[14px]', idx === resaltado && 'bg-ink/[0.05]')}
              >
                {i.tipo === 'nuevo' ? (
                  <>
                    <Plus className="size-4 text-accent" />
                    <span>
                      Crear <span className="font-medium">«{i.nombre}»</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Check className="size-4 text-transparent" />
                    {i.nombre}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
