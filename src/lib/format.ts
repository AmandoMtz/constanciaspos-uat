import type { Alumno, Datos, Programa } from './types'

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const pad = (n: number) => String(n).padStart(2, '0')

export const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const fechaLarga = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${pad(d)} de ${MESES[m - 1]} de ${y}`
}

export const fechaCorta = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** Semestre: enero–junio = 1, julio–diciembre = 2 */
export const semestreDe = (iso: string) => {
  const [y, m] = iso.split('-').map(Number)
  return `${y}-${m <= 6 ? 1 : 2}`
}

export const semestreLabel = (s: string) => {
  const [y, n] = s.split('-')
  return `${y}-${n} (${n === '1' ? 'enero – junio' : 'julio – diciembre'})`
}

export const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const nombreCompleto = (a: Alumno) =>
  [a.nombre, a.apellidoP, a.apellidoM].filter(Boolean).join(' ')

const U = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince',
  'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco',
  'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const D = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const letras = (n: number): string => (n < 30 ? U[n] : D[Math.floor(n / 10)] + (n % 10 ? ' y ' + U[n % 10] : ''))

/** "a los seis días del mes de noviembre del dos mil veintiséis" */
export function fechaEnLetra(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  const dia = d === 1 ? 'al primer día' : `a los ${d === 21 ? 'veintiún' : d === 31 ? 'treinta y un' : letras(d)} días`
  const r = y % 100
  const anio = y >= 2000 && y < 2100 ? 'dos mil' + (r ? ' ' + letras(r) : '') : String(y)
  return `${dia} del mes de ${MESES[m - 1]} del ${anio}`
}

const FEMENINOS = new Set(['ANAI','ANGELES','ARACELY','ARELY','CARMEN','CELESTE','CITLALI','EVELYN','GRISELD','INGRID','ITZEL','ITZERERI','JEANNETTE','JUDITH','KAREN','LESLIE','LEXISS','LIZBETH','LIZETH','LUZ','MADELYN','NADINE','NALLELY','NATALY','ROCIO','SUEMY','SUSAN','MARY','ANEL','CHAREL','YATLANEZI'])
/** Sugerencia de género por el primer nombre; la persona puede corregirla. */
export const adivinarGenero = (a: Alumno): 'F' | 'M' => {
  const n = a.nombre.trim().split(/\s+/)[0].toUpperCase()
  return FEMENINOS.has(n) || (n.endsWith('A') && n !== 'JOSHUA' && n !== 'LUCA') ? 'F' : 'M'
}

export const SEMESTRES = ['Primer', 'Segundo', 'Tercer', 'Cuarto', 'Quinto', 'Sexto', 'Séptimo', 'Octavo']

export const nombreLista = (a: Alumno) =>
  [a.apellidoP, a.apellidoM, a.nombre].filter(Boolean).join(' ')

export const esBecado = (a: Alumno) => a.grupo === 'A'

export interface Extras {
  genero: 'F' | 'M'
  matricula: string
  semestre: string
}

export function datosConstancia(
  a: Alumno,
  p: Programa | undefined,
  fechaISO: string,
  oficio: string,
  ex: Extras,
): Datos {
  const fecha = fechaLarga(fechaISO)
  const f = ex.genero === 'F'
  const prog = (p?.nombre?.trim() || a.programa).toUpperCase()
  const fem = /^(MAESTR|ESPECIALIDAD)/.test(norm(prog).toUpperCase())
  const m = Number(fechaISO.split('-')[1])
  return {
    fecha,
    fecha_letra: fechaEnLetra(fechaISO),
    lugar_fecha: `Tampico, Tamaulipas, a ${fecha}`,
    mes: MESES[m - 1] ?? '',
    anio: fechaISO.split('-')[0],
    oficio: oficio.trim(),
    nombre: nombreLista(a),
    nombre_normal: nombreCompleto(a),
    matricula: ex.matricula.trim(),
    semestre: ex.semestre,
    la_el: f ? 'la' : 'el',
    alumno_a: f ? 'alumna' : 'alumno',
    interesado_a: f ? 'interesada' : 'interesado',
    del_de_la: f ? 'de la' : 'del',
    programa: prog,
    programa_de: (fem ? 'de la ' : 'del ') + prog,
    siglas: a.programa,
    referencia: p?.referencia ?? '',
    rizoma: p?.rizoma ?? '',
    generacion: a.generacion ? String(a.generacion) : '',
  }
}

export const nuevoId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`)

export function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export const slug = (s: string) =>
  norm(s).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
