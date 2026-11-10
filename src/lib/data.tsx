import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import alumnosJson from '../data/alumnos.json'
import type { Alumno, Programa, Registro } from './types'

const alumnos = alumnosJson as Alumno[]

// Siglas tomadas de la base de datos. Los nombres completos se capturan en "Programas".
const CODIGOS = ['DCC', 'DCI', 'DII', 'ETG', 'MAI', 'MC', 'MCC', 'MCI', 'MIN', 'MIP']
const NOMBRES: Record<string, string> = { DCI: 'DOCTORADO EN CIENCIAS DE LA INGENIERÍA' }
const semilla = (): Programa[] =>
  CODIGOS.map((c) => ({ codigo: c, nombre: NOMBRES[c] ?? '', referencia: '000000', rizoma: '000000' }))

function useLS<T>(key: string, init: () => T) {
  const [v, setV] = useState<T>(() => {
    try {
      const r = localStorage.getItem(key)
      if (r) return JSON.parse(r) as T
    } catch { /* sin almacenamiento */ }
    return init()
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignorar */ }
  }, [key, v])
  return [v, setV] as const
}

interface Ctx {
  alumnos: Alumno[]
  programas: Programa[]
  programaDe: (codigo: string) => Programa | undefined
  addPrograma: (p: Programa) => string | null
  updatePrograma: (codigo: string, p: Programa) => string | null
  deletePrograma: (codigo: string) => string | null
  registros: Registro[]
  addRegistro: (r: Registro) => void
  deleteRegistro: (id: string) => void
  extras: Record<number, Partial<{ genero: 'F' | 'M'; matricula: string }>>
  setExtra: (id: number, e: Partial<{ genero: 'F' | 'M'; matricula: string }>) => void
  textoBase: string
  setTextoBase: (t: string) => void
}

export const TEXTO_BASE_DEFAULT =
  'A QUIEN CORRESPONDA:\n\n' +
  'Por medio de la presente se hace constar que el(la) C. {nombre} es alumno(a) del programa de {programa} ' +
  'en la Facultad de Ingeniería Tampico de la Universidad Autónoma de Tamaulipas, con perfil Rizoma {rizoma}.\n\n' +
  'Se extiende la presente constancia a petición del interesado para los fines legales y administrativos que a este convengan.'

const DataCtx = createContext<Ctx>(null as unknown as Ctx)
export const useData = () => useContext(DataCtx)

export function DataProvider({ children }: { children: ReactNode }) {
  const [programas, setProgramas] = useLS<Programa[]>('uat.programas.v2', semilla)
  const [registros, setRegistros] = useLS<Registro[]>('uat.registros.v1', () => [])
  const [extras, setExtras] = useLS<Ctx['extras']>('uat.extras.v1', () => ({}))
  const [textoBase, setTextoBase] = useLS<string>('uat.textoBase.v1', () => TEXTO_BASE_DEFAULT)

  const value = useMemo<Ctx>(() => ({
    alumnos,
    programas,
    programaDe: (c) => programas.find((p) => p.codigo === c),
    addPrograma: (p) => {
      const codigo = p.codigo.trim().toUpperCase()
      if (!codigo) return 'Escribe las siglas del programa.'
      if (programas.some((x) => x.codigo === codigo)) return `Ya existe un programa con las siglas ${codigo}.`
      setProgramas([...programas, { ...p, codigo }])
      return null
    },
    updatePrograma: (viejo, p) => {
      const codigo = p.codigo.trim().toUpperCase()
      if (!codigo) return 'Escribe las siglas del programa.'
      if (codigo !== viejo && programas.some((x) => x.codigo === codigo)) return `Ya existe un programa con las siglas ${codigo}.`
      if (codigo !== viejo && alumnos.some((a) => a.programa === viejo))
        return 'Este programa tiene alumnos asignados en la base de datos; no se pueden cambiar sus siglas.'
      setProgramas(programas.map((x) => (x.codigo === viejo ? { ...p, codigo } : x)))
      return null
    },
    deletePrograma: (codigo) => {
      if (alumnos.some((a) => a.programa === codigo)) return 'No se puede eliminar: hay alumnos asignados a este programa.'
      setProgramas(programas.filter((x) => x.codigo !== codigo))
      return null
    },
    registros,
    addRegistro: (r) =>
      setRegistros((prev) =>
        prev.some((x) => x.alumnoId === r.alumnoId && x.oficio === r.oficio && x.fecha === r.fecha) ? prev : [r, ...prev],
      ),
    deleteRegistro: (id) => setRegistros((prev) => prev.filter((x) => x.id !== id)),
    extras,
    setExtra: (id, e) => setExtras((p) => ({ ...p, [id]: { ...p[id], ...e } })),
    textoBase,
    setTextoBase,
  }), [programas, registros, extras, setExtras, textoBase, setProgramas, setRegistros, setTextoBase])

  return <DataCtx.Provider value={value}>{children}</DataCtx.Provider>
}
