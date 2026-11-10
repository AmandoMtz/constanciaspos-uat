import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AlumnoList from '../components/AlumnoList'
import ConstanciaSheet from '../components/ConstanciaSheet'
import DocxPreview from '../components/DocxPreview'
import FitPreview from '../components/FitPreview'
import { useData } from '../lib/data'
import { SEMESTRES, adivinarGenero, datosConstancia, descargar, esBecado, fechaLarga, hoyISO, nombreCompleto, nuevoId, semestreDe, slug } from '../lib/format'
import { llenarDocx } from '../lib/plantilla'
import { useHoy, usePlantilla } from '../lib/usePlantilla'
import type { Alumno } from '../lib/types'

export default function ConstanciaPage() {
  const { id } = useParams()
  const { alumnos } = useData()
  const nav = useNavigate()
  const alumno = alumnos.find((a) => String(a.id) === id)

  if (!alumno) {
    return (
      <main className="page narrow">
        <h1 className="h1">Generar constancia</h1>
        <p className="lead">Selecciona al alumno (también puedes usar el menú “Generar constancia” de arriba).</p>
        <div className="panel"><AlumnoList autoFocus height={460} onSelect={(a) => nav(`/constancia/${a.id}`)} /></div>
      </main>
    )
  }
  return <Formulario key={alumno.id} alumno={alumno} />
}

function Formulario({ alumno }: { alumno: Alumno }) {
  const { programaDe, addRegistro, textoBase, extras, setExtra } = useData()
  const { plantilla, cargando } = usePlantilla()
  const hoy = useHoy(hoyISO)
  const [manual, setManual] = useState(false)
  const [fechaManual, setFechaManual] = useState(hoy)
  const [oficio, setOficio] = useState('')
  const [semestre, setSemestre] = useState('Primer')
  const genero = extras[alumno.id]?.genero ?? adivinarGenero(alumno)
  const matricula = extras[alumno.id]?.matricula ?? ''
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const prog = programaDe(alumno.programa)
  const fechaISO = manual ? fechaManual || hoy : hoy
  const datos = useMemo(
    () => datosConstancia(alumno, prog, fechaISO, oficio, { genero, matricula, semestre }),
    [alumno, prog, fechaISO, oficio, genero, matricula, semestre],
  )
  const listo = oficio.trim().length > 0

  const registrar = () =>
    addRegistro({
      id: nuevoId(),
      creado: new Date().toISOString(),
      fecha: fechaISO,
      semestre: semestreDe(fechaISO),
      oficio: oficio.trim(),
      alumnoId: alumno.id,
      alumno: nombreCompleto(alumno),
      programa: alumno.programa,
      referencia: prog?.referencia ?? '',
      rizoma: prog?.rizoma ?? '',
      becado: esBecado(alumno),
    })

  const descargarDocx = () => {
    if (!plantilla) return
    setErr('')
    try {
      const blob = llenarDocx(plantilla.data, datos)
      descargar(blob, `Constancia_${slug(nombreCompleto(alumno))}_${fechaISO}.docx`)
      registrar()
      setMsg('Constancia descargada y registrada en el historial.')
    } catch (e) {
      setErr((e as Error).message)
    }
  }
  const imprimir = () => {
    registrar()
    setMsg('Registrada en el historial. Para PDF elige “Guardar como PDF” en el cuadro de impresión.')
    setTimeout(() => window.print(), 50)
  }

  return (
    <main className="page wide">
      <div className="crumbs no-print"><Link to="/constancia">← Cambiar alumno</Link></div>
      <h1 className="h1 no-print">Generar constancia</h1>

      <div className="gen">
        <aside className="panel form no-print">
          <div className="alumno-card">
            <div className="alumno-name">{nombreCompleto(alumno)}</div>
            <div className="chips">
              <span className="chip">{alumno.programa}</span>
              <span className={`chip ${esBecado(alumno) ? 'chip-ok' : 'chip-no'}`}>{esBecado(alumno) ? 'Grupo A' : 'Grupo B'}</span>
              {alumno.generacion && <span className="chip">Gen. {alumno.generacion}</span>}
              {!alumno.activo && <span className="chip chip-warn">Inactivo</span>}
            </div>
          </div>

          <Campo etiqueta="Fecha" modo="auto" extra={manual ? 'Manual' : 'Hoy'}>
            {manual ? (
              <input type="date" className="input" value={fechaManual} onChange={(e) => setFechaManual(e.target.value)} />
            ) : (
              <div className="value auto-val">{fechaLarga(hoy)}</div>
            )}
            <button
              type="button"
              className="linkbtn"
              onClick={() => { setManual(!manual); setFechaManual(hoy) }}
            >
              {manual ? '↺ Usar la fecha de hoy (automática)' : '✎ La fecha no es correcta, capturar manualmente'}
            </button>
          </Campo>

          <Campo etiqueta="No. Oficio" modo="manual">
            <input
              className="input input-manual"
              placeholder="Ej. 123/2026"
              value={oficio}
              onChange={(e) => setOficio(e.target.value)}
              autoFocus
            />
          </Campo>

          <Campo etiqueta="Matrícula" modo="manual">
            <input
              className="input input-manual"
              placeholder="Se captura una sola vez por alumno"
              value={matricula}
              onChange={(e) => setExtra(alumno.id, { matricula: e.target.value })}
            />
            {!matricula.trim() && <div className="hint-warn">La matrícula no viene en la base de datos; sin ella saldrá vacía.</div>}
          </Campo>

          <div className="two-col">
            <Campo etiqueta="Semestre" modo="manual">
              <select className="input input-manual" value={semestre} onChange={(e) => setSemestre(e.target.value)}>
                {SEMESTRES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Género" modo="auto">
              <select className="input" value={genero} onChange={(e) => setExtra(alumno.id, { genero: e.target.value as 'F' | 'M' })}>
                <option value="F">Alumna (la C.)</option>
                <option value="M">Alumno (el C.)</option>
              </select>
            </Campo>
          </div>

          <Campo etiqueta="Nombre del alumno" modo="auto"><div className="value auto-val">{datos.nombre}</div></Campo>
          <Campo etiqueta="Programa académico" modo="auto">
            <div className="value auto-val">{datos.programa}</div>
            {!prog?.nombre && <div className="hint-warn">Falta capturar el nombre completo en <Link to="/programas">Programas</Link>.</div>}
          </Campo>
          <Campo etiqueta="No. Referencia" modo="auto"><div className="value auto-val">{datos.referencia || '—'}</div></Campo>
          <Campo etiqueta="Perfil Rizoma" modo="auto"><div className="value auto-val">{datos.rizoma || '—'}</div></Campo>

          {err && <div className="alert alert-err">{err}</div>}
          {msg && <div className="alert alert-ok">{msg}</div>}

          <div className="actions">
            {plantilla && (
              <button className="btn btn-primary" disabled={!listo} onClick={descargarDocx}>Descargar Word (.docx)</button>
            )}
            <button className={`btn ${plantilla ? 'btn-ghost-dark' : 'btn-primary'}`} disabled={!listo} onClick={imprimir}>Imprimir / Guardar PDF</button>
          </div>
          {!listo && <div className="hint">Captura el No. Oficio para habilitar los botones.</div>}
        </aside>

        <section className="preview">
          <div className="preview-bar no-print">
            Vista previa · {cargando ? 'cargando…' : plantilla ? `Plantilla Word: ${plantilla.nombre}` : 'Plantilla integrada (aún no hay plantilla Word cargada)'}
          </div>
          <div className="print-area">
            <FitPreview>
              {plantilla ? <DocxPreview data={plantilla.data} datos={datos} /> : <ConstanciaSheet datos={datos} texto={textoBase} />}
            </FitPreview>
          </div>
        </section>
      </div>
    </main>
  )
}

function Campo({ etiqueta, modo, extra, children }: { etiqueta: string; modo: 'auto' | 'manual'; extra?: string; children: React.ReactNode }) {
  return (
    <div className={`campo campo-${modo}`}>
      <label>
        {etiqueta}
        <span className={`tag tag-${modo}`}>{modo === 'auto' ? `Automático${extra ? ' · ' + extra : ''}` : 'Manual'}</span>
      </label>
      {children}
    </div>
  )
}
