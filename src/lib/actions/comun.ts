import 'server-only'
import { db } from '@/lib/db/client'
import { eventos } from '@/lib/db/schema'

export type Resultado<T = undefined> = { ok: true; data?: T } | { ok: false; error: string }

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export async function registrarEvento(
  tx: Tx | typeof db,
  e: { presupuestoId?: string | null; obraId?: string | null; tipo: string; texto: string; usuarioId: string; createdAt?: Date }
) {
  await tx.insert(eventos).values({ presupuestoId: e.presupuestoId ?? null, obraId: e.obraId ?? null, tipo: e.tipo, texto: e.texto, usuarioId: e.usuarioId, createdAt: e.createdAt ?? new Date() })
}

export function textoLimpio(v: unknown): string | null {
  const s = typeof v === 'string' ? v.trim() : ''
  return s.length ? s : null
}

export function enteroOpcional(v: unknown): number | null {
  if (v === '' || v == null) return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null
}

export function fechaOpcional(v: unknown): string | null {
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
}
