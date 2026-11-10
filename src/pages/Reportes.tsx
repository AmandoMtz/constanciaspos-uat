import { useMemo, useState } from 'react'
import { useData } from '../lib/data'
import { descargar, esBecado, fechaCorta, hoyISO, nombreCompleto, nombreLista, semestreDe, semestreLabel } from '../lib/format'

interface Fila {
  semestre: string
  programa: string
  alumno: string
  beca: 'Grupo A' | 'Grupo B'
  generacion: number | null
  estatus: 'Activo' | 'Inactivo'
  constancia: 'Sí' | 'No'
  oficio: string
  fecha: string
  clave: string
}

export default function ReportesPage() {
  const { alumnos, registros, deleteRegistro } = useData()
  const actual = semestreDe(hoyISO())
  const [sem, setSem] = useState(actual)
  const [prog, setProg] = useState('')
  const [beca, setBeca] = useState('')
  const [const_, setConst] = useState('')
  const [busy, setBusy] = useState(false)

  const semestres = useMemo(() => [...new Set([actual, ...registros.map((r) => r.semestre)])].sort().reverse(), [actual, registros])
  const programas = useMemo(() => [...new Set(alumnos.map((a) => a.programa))].sort(), [alumnos])

  const filas = useMemo<Fila[]>(() => {
    const out: Fila[] = []
    for (const a of alumnos) {
      if (prog && a.programa !== prog) continue
      if (beca && (beca === 'A') !== esBecado(a)) continue
      const regs = registros.filter((r) => r.alumnoId === a.id && (!sem || r.semestre === sem))
      const r = regs.sort((x, y) => y.creado.localeCompare(x.creado))[0]
      if (const_ === 'si' && !r) continue
      if (const_ === 'no' && r) continue
      out.push({
        semestre: sem || 'Todos',
        programa: a.programa,
        alumno: nombreCompleto(a),
        beca: esBecado(a) ? 'Grupo A' : 'Grupo B',
        generacion: a.generacion,
        estatus: a.activo ? 'Activo' : 'Inactivo',
        constancia: r ? 'Sí' : 'No',
        oficio: r?.oficio ?? '',
        fecha: r ? fechaCorta(r.fecha) : '',
        clave: nombreLista(a),
      })
    }
    return out.sort((x, y) => x.programa.localeCompare(y.programa) || x.clave.localeCompare(y.clave))
  }, [alumnos, registros, sem, prog, beca, const_])

  const emitidas = useMemo(
    () => registros.filter((r) => (!sem || r.semestre === sem) && (!prog || r.programa === prog) && (!beca || (beca === 'A') === r.becado)),
    [registros, sem, prog, beca],
  )

  const grupoA = filas.filter((f) => f.beca === 'Grupo A').length
  const conConst = filas.filter((f) => f.constancia === 'Sí').length

  const exportar = async () => {
    setBusy(true)
    try {
      const ExcelJS = (await import('exceljs')).default
      const wb = new ExcelJS.Workbook()
      wb.creator = 'Facultad de Ingeniería Tampico · UAT'
      const estilo = (ws: import('exceljs').Worksheet, anchos: number[]) => {
        ws.columns.forEach((c, i) => { c.width = anchos[i] })
        const h = ws.getRow(1)
        h.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        h.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD26027' } }
        h.alignment = { vertical: 'middle' }
        h.height = 22
        ws.views = [{ state: 'frozen', ySplit: 1 }]
        ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: ws.columnCount } }
      }
      const ws = wb.addWorksheet('Reporte')
      ws.columns = [
        { header: 'Semestre', key: 'semestre' }, { header: 'Programa', key: 'programa' }, { header: 'Nombre del alumno', key: 'alumno' },
        { header: 'Grupo', key: 'beca' }, { header: 'Generación', key: 'generacion' }, { header: 'Estatus', key: 'estatus' },
        { header: 'Constancia emitida', key: 'constancia' }, { header: 'No. Oficio', key: 'oficio' }, { header: 'Fecha constancia', key: 'fecha' },
      ]
      filas.forEach(({ clave: _c, ...f }) => ws.addRow(f))
      estilo(ws, [12, 11, 42, 12, 12, 10, 18, 16, 16])

      const w2 = wb.addWorksheet('Constancias emitidas')
      w2.columns = [
        { header: 'Fecha', key: 'fecha' }, { header: 'Semestre', key: 'semestre' }, { header: 'No. Oficio', key: 'oficio' },
        { header: 'Nombre del alumno', key: 'alumno' }, { header: 'Programa', key: 'programa' }, { header: 'Grupo', key: 'beca' },
        { header: 'No. Referencia', key: 'referencia' }, { header: 'Perfil Rizoma', key: 'rizoma' },
      ]
      emitidas.forEach((r) => w2.addRow({ ...r, fecha: fechaCorta(r.fecha), beca: r.becado ? 'Grupo A' : 'Grupo B' }))
      estilo(w2, [14, 12, 16, 42, 11, 12, 16, 16])

      const buf = await wb.xlsx.writeBuffer()
      descargar(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `Reporte_tesistas_${sem || 'todos'}_${hoyISO()}.xlsx`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <h1 className="h1">Reportes</h1>
      <p className="lead">Todos los tesistas por semestre, programa y grupo, con el estatus de su constancia.</p>

      <div className="panel filters">
        <label>Semestre
          <select className="input" value={sem} onChange={(e) => setSem(e.target.value)}>
            <option value="">Todos</option>
            {semestres.map((s) => <option key={s} value={s}>{semestreLabel(s)}</option>)}
          </select>
        </label>
        <label>Programa
          <select className="input" value={prog} onChange={(e) => setProg(e.target.value)}>
            <option value="">Todos</option>{programas.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Grupo
          <select className="input" value={beca} onChange={(e) => setBeca(e.target.value)}>
            <option value="">Todos</option><option value="A">Grupo A</option><option value="B">Grupo B</option>
          </select>
        </label>
        <label>Constancia
          <select className="input" value={const_} onChange={(e) => setConst(e.target.value)}>
            <option value="">Todas</option><option value="si">Con constancia</option><option value="no">Sin constancia</option>
          </select>
        </label>
        <button className="btn btn-primary" onClick={exportar} disabled={busy || filas.length === 0}>{busy ? 'Generando…' : 'Exportar a Excel'}</button>
      </div>

      <div className="stats small">
        <div><b>{filas.length}</b><span>Alumnos</span></div>
        <div><b>{grupoA}</b><span>Grupo A</span></div>
        <div><b>{filas.length - grupoA}</b><span>Grupo B</span></div>
        <div><b>{conConst}</b><span>Con constancia</span></div>
      </div>

      <div className="panel tablewrap">
        <table className="table">
          <thead><tr><th>Semestre</th><th>Programa</th><th>Nombre</th><th>Grupo</th><th>Gen.</th><th>Constancia</th><th>No. Oficio</th><th>Fecha</th></tr></thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td>{f.semestre}</td><td><span className="chip">{f.programa}</span></td>
                <td>{f.alumno}{f.estatus === 'Inactivo' && <span className="chip chip-warn ml">Inactivo</span>}</td>
                <td><span className={`chip ${f.beca === 'Grupo A' ? 'chip-ok' : 'chip-no'}`}>{f.beca}</span></td>
                <td>{f.generacion ?? ''}</td>
                <td>{f.constancia === 'Sí' ? '✔ Sí' : <span className="muted">No</span>}</td>
                <td>{f.oficio}</td><td>{f.fecha}</td>
              </tr>
            ))}
            {filas.length === 0 && <tr><td colSpan={8} className="alist-empty">Sin resultados con estos filtros.</td></tr>}
          </tbody>
        </table>
      </div>

      <h2 className="h2">Historial de constancias emitidas ({emitidas.length})</h2>
      <div className="panel tablewrap">
        <table className="table">
          <thead><tr><th>Fecha</th><th>No. Oficio</th><th>Alumno</th><th>Programa</th><th>Grupo</th><th></th></tr></thead>
          <tbody>
            {emitidas.map((r) => (
              <tr key={r.id}>
                <td>{fechaCorta(r.fecha)}</td><td>{r.oficio}</td><td>{r.alumno}</td><td><span className="chip">{r.programa}</span></td>
                <td>{r.becado ? 'Grupo A' : 'Grupo B'}</td>
                <td className="row-actions"><button className="btn btn-sm btn-danger" onClick={() => confirm('¿Quitar este registro del historial?') && deleteRegistro(r.id)}>Quitar</button></td>
              </tr>
            ))}
            {emitidas.length === 0 && <tr><td colSpan={6} className="alist-empty">Aún no hay constancias emitidas en este filtro.</td></tr>}
          </tbody>
        </table>
      </div>
    </main>
  )
}
