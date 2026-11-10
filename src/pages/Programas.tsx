import { useState } from 'react'
import { useData } from '../lib/data'
import type { Programa } from '../lib/types'

const vacio: Programa = { codigo: '', nombre: '', referencia: '000000', rizoma: '000000' }

export default function ProgramasPage() {
  const { programas, alumnos, addPrograma, updatePrograma, deletePrograma } = useData()
  const [nuevo, setNuevo] = useState<Programa>(vacio)
  const [editando, setEditando] = useState<string | null>(null)
  const [borrador, setBorrador] = useState<Programa>(vacio)
  const [err, setErr] = useState('')
  const [ok, setOk] = useState('')

  const conteo = (c: string) => alumnos.filter((a) => a.programa === c).length

  const agregar = (e: React.FormEvent) => {
    e.preventDefault()
    const r = addPrograma(nuevo)
    setErr(r ?? ''); setOk(r ? '' : `Programa ${nuevo.codigo.toUpperCase()} agregado.`)
    if (!r) setNuevo(vacio)
  }
  const guardar = (codigo: string) => {
    const r = updatePrograma(codigo, borrador)
    setErr(r ?? ''); setOk(r ? '' : 'Cambios guardados.')
    if (!r) setEditando(null)
  }
  const eliminar = (c: string) => {
    if (!confirm(`¿Eliminar el programa ${c}?`)) return
    const r = deletePrograma(c)
    setErr(r ?? ''); setOk(r ? '' : `Programa ${c} eliminado.`)
  }

  return (
    <main className="page">
      <h1 className="h1">Programas académicos</h1>
      <p className="lead">Cada programa define el <b>No. Referencia</b> y el <b>Perfil Rizoma</b> que se llenan automáticamente en la constancia. Por ahora todos usan <code>000000</code>.</p>

      <form className="panel add" onSubmit={agregar}>
        <h3>Agregar programa</h3>
        <div className="grid4">
          <label>Siglas<input className="input" value={nuevo.codigo} onChange={(e) => setNuevo({ ...nuevo, codigo: e.target.value.toUpperCase() })} placeholder="MCC" maxLength={8} /></label>
          <label className="span2">Nombre del programa<input className="input" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Maestría en …" /></label>
          <label>No. Referencia<input className="input" value={nuevo.referencia} onChange={(e) => setNuevo({ ...nuevo, referencia: e.target.value })} /></label>
          <label>Perfil Rizoma<input className="input" value={nuevo.rizoma} onChange={(e) => setNuevo({ ...nuevo, rizoma: e.target.value })} /></label>
          <div className="add-btn"><button className="btn btn-primary">Agregar</button></div>
        </div>
      </form>

      {err && <div className="alert alert-err">{err}</div>}
      {ok && <div className="alert alert-ok">{ok}</div>}

      <div className="panel tablewrap">
        <table className="table">
          <thead><tr><th>Siglas</th><th>Nombre del programa</th><th>No. Referencia</th><th>Perfil Rizoma</th><th className="num">Alumnos</th><th></th></tr></thead>
          <tbody>
            {programas.map((p) =>
              editando === p.codigo ? (
                <tr key={p.codigo} className="editing">
                  <td><input className="input" value={borrador.codigo} onChange={(e) => setBorrador({ ...borrador, codigo: e.target.value.toUpperCase() })} maxLength={8} /></td>
                  <td><input className="input" value={borrador.nombre} onChange={(e) => setBorrador({ ...borrador, nombre: e.target.value })} /></td>
                  <td><input className="input" value={borrador.referencia} onChange={(e) => setBorrador({ ...borrador, referencia: e.target.value })} /></td>
                  <td><input className="input" value={borrador.rizoma} onChange={(e) => setBorrador({ ...borrador, rizoma: e.target.value })} /></td>
                  <td className="num">{conteo(p.codigo)}</td>
                  <td className="row-actions">
                    <button className="btn btn-sm btn-primary" onClick={() => guardar(p.codigo)}>Guardar</button>
                    <button className="btn btn-sm btn-ghost-dark" onClick={() => { setEditando(null); setErr('') }}>Cancelar</button>
                  </td>
                </tr>
              ) : (
                <tr key={p.codigo}>
                  <td><span className="chip">{p.codigo}</span></td>
                  <td>{p.nombre || <span className="hint-warn">Falta capturar el nombre</span>}</td>
                  <td>{p.referencia}</td>
                  <td>{p.rizoma}</td>
                  <td className="num">{conteo(p.codigo)}</td>
                  <td className="row-actions">
                    <button className="btn btn-sm btn-ghost-dark" onClick={() => { setEditando(p.codigo); setBorrador(p); setErr(''); setOk('') }}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={() => eliminar(p.codigo)}>Eliminar</button>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
