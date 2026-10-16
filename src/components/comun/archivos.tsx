'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import { FileText, FileSpreadsheet, File as FileIcon, Upload, Trash2, Camera } from 'lucide-react'
import { registrarArchivos, eliminarArchivo, type ArchivoSubido } from '@/lib/actions/archivos'
import { useToast } from '@/components/ui/toast'
import { tamanoArchivo } from '@/lib/formato'
import { fechaCorta } from '@/lib/fechas'
import type { Archivo } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

const MAX_LADO = 2200
const MAX_MINI = 480

async function redimensionar(file: File, lado: number, calidad: number): Promise<Blob | null> {
  try {
    const bmp = await createImageBitmap(file)
    const escala = Math.min(1, lado / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * escala)
    canvas.height = Math.round(bmp.height * escala)
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    return await new Promise((res) => canvas.toBlob(res, 'image/jpeg', calidad))
  } catch {
    return null
  }
}

function seguro(nombre: string) {
  return nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-80)
}

export function Archivos({ destino, archivos, compacto }: { destino: { presupuestoId?: string; obraId?: string }; archivos: Archivo[]; compacto?: boolean }) {
  const router = useRouter()
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const camara = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState<string | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const [, start] = useTransition()

  const carpeta = destino.obraId ? `obras/${destino.obraId}` : `presupuestos/${destino.presupuestoId}`
  const fotos = archivos.filter((a) => a.contentType.startsWith('image/'))
  const docs = archivos.filter((a) => !a.contentType.startsWith('image/'))

  async function subir(lista: FileList | File[]) {
    const files = Array.from(lista)
    if (!files.length) return
    const subidos: ArchivoSubido[] = []
    let registrados = false
    try {
      for (const [i, f] of files.entries()) {
        setSubiendo(files.length > 1 ? `Subiendo ${i + 1} de ${files.length}…` : 'Subiendo…')
        const esImagen = f.type.startsWith('image/') && f.type !== 'image/heic'
        if (esImagen) {
          const [grande, mini] = await Promise.all([redimensionar(f, MAX_LADO, 0.85), redimensionar(f, MAX_MINI, 0.75)])
          const base = seguro(f.name.replace(/\.[^.]+$/, ''))
          const cuerpo = grande ?? f
          const principal = await upload(`${carpeta}/${base}.jpg`, cuerpo, { access: 'private', handleUploadUrl: '/api/archivos/subir', contentType: grande ? 'image/jpeg' : f.type })
          const chica = mini ? await upload(`${carpeta}/mini-${base}.jpg`, mini, { access: 'private', handleUploadUrl: '/api/archivos/subir', contentType: 'image/jpeg' }) : null
          subidos.push({ nombre: f.name, pathname: principal.pathname, thumbPathname: chica?.pathname ?? null, contentType: grande ? 'image/jpeg' : f.type, tamano: cuerpo.size })
        } else {
          const r = await upload(`${carpeta}/${seguro(f.name)}`, f, { access: 'private', handleUploadUrl: '/api/archivos/subir', contentType: f.type || 'application/octet-stream' })
          subidos.push({ nombre: f.name, pathname: r.pathname, contentType: f.type || 'application/octet-stream', tamano: f.size })
        }
      }
      const r = await registrarArchivos(destino, subidos)
      registrados = true
      if (!r.ok) throw new Error(r.error)
      toast(subidos.length > 1 ? `${subidos.length} archivos subidos` : 'Archivo subido')
      router.refresh()
    } catch (e) {
      toast((e as Error).message.includes('content type') ? 'Ese tipo de archivo no está permitido' : 'No se pudo subir el archivo', 'error')
      // Los que sí llegaron a subirse antes del error quedan registrados igual.
      if (subidos.length && !registrados) {
        await registrarArchivos(destino, subidos)
        router.refresh()
      }
    } finally {
      setSubiendo(null)
      if (input.current) input.current.value = ''
      if (camara.current) camara.current.value = ''
    }
  }

  function borrar(a: Archivo) {
    if (!confirm(`¿Eliminar «${a.nombre}»? No se puede deshacer.`)) return
    start(async () => {
      const r = await eliminarArchivo(a.id)
      if (!r.ok) return toast(r.error, 'error')
      toast('Archivo eliminado')
      router.refresh()
    })
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setArrastrando(true)
      }}
      onDragLeave={() => setArrastrando(false)}
      onDrop={(e) => {
        e.preventDefault()
        setArrastrando(false)
        subir(e.dataTransfer.files)
      }}
      className={cn('rounded-control transition-colors', arrastrando && 'bg-accent-soft ring-2 ring-accent/40')}
    >
      <input ref={input} type="file" multiple hidden onChange={(e) => e.target.files && subir(e.target.files)} />
      <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files && subir(e.target.files)} />

      {fotos.length > 0 && (
        <div className={cn('mb-4 grid gap-2', compacto ? 'grid-cols-3' : 'grid-cols-3 sm:grid-cols-4')}>
          {fotos.map((f) => (
            <div key={f.id} className="group relative aspect-square overflow-hidden rounded-[10px] border border-line bg-subtle">
              <a href={`/archivos/${f.id}`} target="_blank" rel="noopener" title={`${f.nombre} · ${fechaCorta(f.createdAt.toISOString().slice(0, 10))}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/archivos/${f.id}?mini`} alt={f.nombre} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              </a>
              <button
                type="button"
                onClick={() => borrar(f)}
                aria-label={`Eliminar ${f.nombre}`}
                className="absolute right-1.5 top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white opacity-0 backdrop-blur transition-opacity focus:opacity-100 group-hover:opacity-100 max-md:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {docs.length > 0 && (
        <ul className="mb-4 divide-y divide-line rounded-control border border-line">
          {docs.map((d) => {
            const Icono = d.contentType.includes('pdf') ? FileText : d.contentType.includes('sheet') || d.contentType.includes('excel') ? FileSpreadsheet : FileIcon
            return (
              <li key={d.id} className="group flex items-center gap-3 px-3 py-2.5">
                <Icono className="size-[18px] shrink-0 text-ink-3" />
                <a href={`/archivos/${d.id}`} target="_blank" rel="noopener" className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium text-ink hover:underline">{d.nombre}</span>
                  <span className="block text-[12px] text-ink-3">
                    {tamanoArchivo(d.tamano)} · {fechaCorta(d.createdAt.toISOString().slice(0, 10))}
                  </span>
                </a>
                <button type="button" onClick={() => borrar(d)} aria-label={`Eliminar ${d.nombre}`} className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink-3 opacity-0 transition-opacity hover:bg-bad-soft hover:text-bad focus:opacity-100 group-hover:opacity-100 max-md:opacity-100">
                  <Trash2 className="size-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {subiendo ? (
        <div className="flex h-11 items-center justify-center gap-2 rounded-control border border-dashed border-accent/40 bg-accent-soft text-[13.5px] font-medium text-accent">
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {subiendo}
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-control border border-dashed border-line-strong text-[13.5px] font-medium text-ink-2 transition-colors hover:border-ink/30 hover:bg-subtle hover:text-ink"
          >
            <Upload className="size-4" />
            <span className="md:hidden">Subir archivo</span>
            <span className="hidden md:inline">Subir o arrastrar archivos</span>
          </button>
          <button type="button" onClick={() => camara.current?.click()} aria-label="Sacar foto" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-control border border-dashed border-line-strong text-ink-2 hover:bg-subtle md:hidden">
            <Camera className="size-[18px]" />
          </button>
        </div>
      )}
    </div>
  )
}
