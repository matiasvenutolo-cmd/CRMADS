'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, HardHat, Building2, CornerDownLeft } from 'lucide-react'
import { buscar, type ResultadoBusqueda } from '@/lib/actions/buscar'
import { cn } from '@/lib/utils'

const Ctx = createContext<{ abrir: () => void }>({ abrir: () => {} })
export function useBusqueda() {
  return useContext(Ctx)
}

const ICONOS = { presupuesto: FileText, obra: HardHat, cliente: Building2 }
const GRUPOS = { obra: 'Obras', presupuesto: 'Presupuestos', cliente: 'Clientes' }

export function BusquedaProvider({ children }: { children: React.ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  const abrir = useCallback(() => setAbierto(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAbierto((a) => !a)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <Ctx.Provider value={{ abrir }}>
      {children}
      {abierto && <Paleta onCerrar={() => setAbierto(false)} />}
    </Ctx.Provider>
  )
}

function Paleta({ onCerrar }: { onCerrar: () => void }) {
  const router = useRouter()
  const ref = useRef<HTMLDialogElement>(null)
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState<ResultadoBusqueda[]>([])
  const [buscando, setBuscando] = useState(false)
  const [sel, setSel] = useState(0)

  useEffect(() => {
    ref.current?.showModal()
  }, [])

  useEffect(() => {
    if (q.trim().length < 2) return
    let vigente = true
    const t = setTimeout(async () => {
      setBuscando(true)
      const r = await buscar(q)
      if (vigente) {
        setResultados(r)
        setSel(0)
        setBuscando(false)
      }
    }, 180)
    return () => {
      vigente = false
      clearTimeout(t)
    }
  }, [q])

  const visibles = q.trim().length < 2 ? [] : resultados

  function ir(r: ResultadoBusqueda) {
    onCerrar()
    router.push(r.href)
  }

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => e.target === ref.current && onCerrar()}
      className="m-0 mx-auto mt-[12vh] w-[calc(100%-24px)] max-w-[600px] bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px]"
    >
      <div className="animate-enter overflow-hidden rounded-[16px] border border-line bg-surface shadow-float">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-[18px] shrink-0 text-ink-3" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSel((s) => Math.min(s + 1, visibles.length - 1))
          }
              if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSel((s) => Math.max(s - 1, 0))
          }
              if (e.key === 'Enter' && visibles[sel]) ir(visibles[sel])
            }}
            placeholder="Cliente, dirección o número (P-0012, O-0003)…"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
          />
          {buscando && <span className="size-4 animate-spin rounded-full border-2 border-ink-3 border-r-transparent" />}
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {q.trim().length < 2 ? (
            <p className="px-3 py-8 text-center text-[13.5px] text-ink-3">Escribí al menos dos letras.</p>
          ) : visibles.length === 0 && !buscando ? (
            <p className="px-3 py-8 text-center text-[13.5px] text-ink-3">Nada encontrado para «{q}».</p>
          ) : (
            (['obra', 'presupuesto', 'cliente'] as const).map((tipo) => {
              const grupo = visibles.filter((r) => r.tipo === tipo)
              if (!grupo.length) return null
              const Icono = ICONOS[tipo]
              return (
                <div key={tipo} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink-3">{GRUPOS[tipo]}</p>
                  {grupo.map((r) => {
                    const i = visibles.indexOf(r)
                    return (
                      <button
                        key={r.tipo + r.id}
                        type="button"
                        onMouseEnter={() => setSel(i)}
                        onClick={() => ir(r)}
                        className={cn('flex w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 py-2.5 text-left', i === sel && 'bg-ink/[0.05]')}
                      >
                        <Icono className="size-4 shrink-0 text-ink-3" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-medium text-ink">{r.titulo}</span>
                          <span className="block truncate text-[12.5px] text-ink-3">{r.detalle}</span>
                        </span>
                        {i === sel && <CornerDownLeft className="size-3.5 text-ink-3" />}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </dialog>
  )
}
