import { useMemo, useState } from 'react'
import { useData } from '../lib/data'
import { esBecado, nombreLista, norm } from '../lib/format'
import type { Alumno } from '../lib/types'

export default function AlumnoList({
  onSelect,
  autoFocus,
  height = 340,
}: {
  onSelect: (a: Alumno) => void
  autoFocus?: boolean
  height?: number
}) {
  const { alumnos } = useData()
  const [q, setQ] = useState('')
  const [prog, setProg] = useState('')
  const programas = useMemo(() => [...new Set(alumnos.map((a) => a.programa))].sort(), [alumnos])

  const lista = useMemo(() => {
    const t = norm(q.trim())
    return alumnos.filter(
      (a) => (!prog || a.programa === prog) && (!t || norm(`${nombreLista(a)} ${a.nombre} ${a.apellidoP} ${a.id}`).includes(t)),
    )
  }, [alumnos, q, prog])

  return (
    <div className="alist">
      <div className="alist-top">
        <input
          autoFocus={autoFocus}
          className="input"
          placeholder="Buscar por nombre, apellido o matrícula…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select className="input" value={prog} onChange={(e) => setProg(e.target.value)} aria-label="Programa">
          <option value="">Todos</option>
          {programas.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="alist-count">{lista.length} alumno(s)</div>
      <ul className="alist-ul" style={{ maxHeight: height }}>
        {lista.map((a) => (
          <li key={a.id}>
            <button type="button" onClick={() => onSelect(a)}>
              <span className="alist-name">{nombreLista(a)}</span>
              <span className="chip">{a.programa}</span>
              <span className={`chip ${esBecado(a) ? 'chip-ok' : 'chip-no'}`}>{esBecado(a) ? 'Grupo A' : 'Grupo B'}</span>
              {!a.activo && <span className="chip chip-warn">Inactivo</span>}
            </button>
          </li>
        ))}
        {lista.length === 0 && <li className="alist-empty">Sin resultados.</li>}
      </ul>
    </div>
  )
}
