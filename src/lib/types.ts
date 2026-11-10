export interface Alumno {
  id: number
  nombre: string
  apellidoP: string
  apellidoM: string
  programa: string // siglas, p. ej. MCC
  grupo: string // A = Grupo A, B = Grupo B
  generacion: number | null
  activo: boolean
}

export interface Programa {
  codigo: string // siglas
  nombre: string
  referencia: string // No. Referencia
  rizoma: string // Perfil Rizoma
}

export interface Registro {
  id: string
  creado: string // ISO datetime
  fecha: string // yyyy-mm-dd (fecha impresa en la constancia)
  semestre: string // 2026-2
  oficio: string
  alumnoId: number
  alumno: string
  programa: string
  referencia: string
  rizoma: string
  becado: boolean
}

export type Datos = Record<string, string>
