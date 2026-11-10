import { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import PizZip from 'pizzip'
import { llenarDocx } from '../lib/plantilla'
import type { Datos } from '../lib/types'

const MIME: Record<string, string> = { jpeg: 'image/jpeg', jpg: 'image/jpeg', png: 'image/png' }
const cache = new WeakMap<ArrayBuffer, string>()

/** Imagen más grande referenciada por los encabezados (el membrete de página completa). */
function membrete(data: ArrayBuffer): string | null {
  const hit = cache.get(data)
  if (hit) return hit
  try {
    const zip = new PizZip(data)
    let best: { name: string; size: number } | null = null
    for (const f of zip.file(/word\/_rels\/header\d*\.xml\.rels$/)) {
      for (const m of f.asText().matchAll(/Target="(media\/[^"]+)"/g)) {
        const img = zip.file('word/' + m[1])
        const size = img ? img.asUint8Array().length : 0
        if (img && (!best || size > best.size)) best = { name: 'word/' + m[1], size }
      }
    }
    if (!best) return null
    const ext = best.name.split('.').pop()!.toLowerCase()
    if (!MIME[ext]) return null
    const url = URL.createObjectURL(new Blob([zip.file(best.name)!.asUint8Array().slice().buffer as ArrayBuffer], { type: MIME[ext] }))
    cache.set(data, url)
    return url
  } catch {
    return null
  }
}

export default function DocxPreview({ data, datos }: { data: ArrayBuffer; datos: Datos }) {
  const ref = useRef<HTMLDivElement>(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const blob = llenarDocx(data, datos)
        if (!vivo || !ref.current) return
        ref.current.innerHTML = ''
        await renderAsync(blob, ref.current, undefined, { className: 'docx', inWrapper: true, breakPages: true })
        // docx-preview no dibuja la imagen de fondo del encabezado (membrete): la ponemos nosotros
        const fondo = membrete(data)
        if (fondo) {
          ref.current.querySelectorAll<HTMLElement>('section.docx').forEach((sec) => {
            sec.style.backgroundImage = `url(${fondo})`
            sec.style.backgroundSize = '100% 100%'
            sec.style.backgroundRepeat = 'no-repeat'
          })
        }
        setErr('')
      } catch (e) {
        setErr((e as Error).message)
      }
    })()
    return () => { vivo = false }
  }, [data, datos])
  return (
    <>
      {err && <div className="alert alert-err">No se pudo mostrar la plantilla: {err}</div>}
      <div ref={ref} className="docx-host" />
    </>
  )
}
