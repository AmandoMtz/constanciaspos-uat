import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import type { Datos } from './types'

/* ---------- Almacenamiento persistente de la plantilla (IndexedDB) ---------- */
const DB = 'uat-constancias'
const STORE = 'kv'
const KEY = 'plantilla-docx'

export interface PlantillaGuardada {
  nombre: string
  data: ArrayBuffer
  actualizada: string
  incluida?: boolean
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const rq = indexedDB.open(DB, 1)
    rq.onupgradeneeded = () => rq.result.createObjectStore(STORE)
    rq.onsuccess = () => res(rq.result)
    rq.onerror = () => rej(rq.error)
  })
}

export async function cargarPlantilla(): Promise<PlantillaGuardada | null> {
  try {
    const db = await abrir()
    return await new Promise((res, rej) => {
      const rq = db.transaction(STORE).objectStore(STORE).get(KEY)
      rq.onsuccess = () => res((rq.result as PlantillaGuardada) ?? null)
      rq.onerror = () => rej(rq.error)
    })
  } catch {
    return null
  }
}

export async function guardarPlantilla(p: PlantillaGuardada) {
  const db = await abrir()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(p, KEY)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
  // Pide al navegador que no borre estos datos automáticamente
  try { await navigator.storage?.persist?.() } catch { /* ignorar */ }
}

export async function borrarPlantilla() {
  const db = await abrir()
  await new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

/* ---------- Llenado de la plantilla Word ---------- */
export function llenarDocx(data: ArrayBuffer, datos: Datos): Blob {
  const zip = new PizZip(data)
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  })
  try {
    doc.render(datos)
  } catch (e: unknown) {
    const err = e as { properties?: { errors?: { properties?: { explanation?: string } }[] }; message?: string }
    const det = err.properties?.errors?.map((x) => x.properties?.explanation).filter(Boolean).join(' | ')
    throw new Error(det || err.message || 'No se pudo llenar la plantilla.')
  }
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

export const VARIABLES: { clave: string; desc: string; modo: 'auto' | 'manual' }[] = [
  { clave: 'fecha', desc: '06 de noviembre de 2026', modo: 'auto' },
  { clave: 'fecha_letra', desc: 'a los seis días del mes de noviembre del dos mil veintiséis', modo: 'auto' },
  { clave: 'mes / anio', desc: 'noviembre / 2026', modo: 'auto' },
  { clave: 'oficio', desc: 'No. de Oficio (solo el consecutivo)', modo: 'manual' },
  { clave: 'nombre', desc: 'Apellidos y nombre del alumno', modo: 'auto' },
  { clave: 'matricula', desc: 'Matrícula (se captura una vez por alumno)', modo: 'manual' },
  { clave: 'rizoma', desc: 'Perfil Rizoma', modo: 'auto' },
  { clave: 'semestre', desc: 'Primer, Segundo, Tercer…', modo: 'manual' },
  { clave: 'programa_de', desc: 'del DOCTORADO… / de la MAESTRÍA…', modo: 'auto' },
  { clave: 'programa / siglas', desc: 'Nombre del programa / siglas', modo: 'auto' },
  { clave: 'referencia', desc: 'No. Referencia', modo: 'auto' },
  { clave: 'la_el, alumno_a, interesado_a, del_de_la', desc: 'Concordancia de género', modo: 'auto' },
]
