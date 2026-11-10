import { useRef, useState } from 'react'
import ConstanciaSheet from '../components/ConstanciaSheet'
import FitPreview from '../components/FitPreview'
import { TEXTO_BASE_DEFAULT, useData } from '../lib/data'
import { borrarPlantilla, guardarPlantilla, VARIABLES } from '../lib/plantilla'
import { usePlantilla } from '../lib/usePlantilla'
import { fechaCorta } from '../lib/format'
import type { Datos } from '../lib/types'

const demo: Datos = {
  fecha: '9 de noviembre de 2026', lugar_fecha: 'Tampico, Tamaulipas, a 9 de noviembre de 2026', oficio: '123/2026',
  nombre: 'APELLIDO APELLIDO NOMBRE', programa: 'Nombre del programa', siglas: 'MCC', nombre_normal: 'NOMBRE APELLIDO APELLIDO', matricula: '0000000000', semestre: 'Primer', mes: 'noviembre', anio: '2026', fecha_letra: 'a los nueve días del mes de noviembre del dos mil veintiséis', la_el: 'el', alumno_a: 'alumno', interesado_a: 'interesado', del_de_la: 'del', programa_de: 'del PROGRAMA', referencia: '000000', rizoma: '000000', generacion: '2026',
}

export default function PlantillaPage() {
  const { plantilla, cargando, recargar } = usePlantilla()
  const { textoBase, setTextoBase } = useData()
  const inp = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const subir = async (f?: File) => {
    if (!f) return
    setErr(''); setMsg('')
    if (!f.name.toLowerCase().endsWith('.docx')) { setErr('El archivo debe ser Word (.docx).'); return }
    try {
      await guardarPlantilla({ nombre: f.name, data: await f.arrayBuffer(), actualizada: new Date().toISOString() })
      await recargar()
      setMsg('Plantilla guardada en este equipo. Se usará en todas las constancias.')
    } catch { setErr('No se pudo guardar la plantilla en el navegador.') }
    if (inp.current) inp.current.value = ''
  }
  const quitar = async () => {
    if (!confirm('¿Quitar la plantilla Word guardada?')) return
    await borrarPlantilla(); await recargar(); setMsg('Plantilla eliminada. Se usará la plantilla integrada.')
  }

  return (
    <main className="page">
      <h1 className="h1">Plantilla de constancia</h1>
      <p className="lead">Carga tu plantilla en Word una sola vez; queda guardada en este navegador/equipo hasta que la reemplaces o la quites.</p>

      <div className="two">
        <section className="panel">
          <h3>Plantilla Word (.docx)</h3>
          <div className="tplstate">
            {cargando ? 'Cargando…' : plantilla
              ? <>✔ <b>{plantilla.nombre}</b><br /><span className="muted">{plantilla.incluida ? 'Es la plantilla de Constancias de Vigencia que viene con el sistema.' : `Guardada el ${fechaCorta(plantilla.actualizada.slice(0, 10))}`}</span></>
              : <span className="muted">No hay plantilla cargada: se usa la plantilla integrada.</span>}
          </div>
          <input ref={inp} type="file" accept=".docx" hidden onChange={(e) => void subir(e.target.files?.[0])} />
          <div className="actions row">
            <button className="btn btn-primary" onClick={() => inp.current?.click()}>Cargar otra plantilla</button>
            {plantilla && !plantilla.incluida && <button className="btn btn-danger" onClick={quitar}>Quitar y usar la incluida</button>}
            <a className="btn btn-ghost-dark" href="./plantilla-vigencias.docx" download>Descargar plantilla incluida</a>
          </div>
          {err && <div className="alert alert-err">{err}</div>}
          {msg && <div className="alert alert-ok">{msg}</div>}

          <h4>Cómo marcar los campos en Word</h4>
          <p className="muted">Escribe el nombre del campo entre llaves, tal cual, donde quieras que aparezca el dato. Si tu plantilla tiene los campos resaltados o subrayados, quita el resaltado para que no salga en la constancia final.</p>
          <table className="table compact">
            <thead><tr><th>Escribe</th><th>Se reemplaza por</th><th>Tipo</th></tr></thead>
            <tbody>
              {VARIABLES.map((v) => (
                <tr key={v.clave}><td><code>{`{${v.clave}}`}</code></td><td>{v.desc}</td>
                  <td><span className={`tag tag-${v.modo}`}>{v.modo === 'auto' ? 'Automático' : 'Manual'}</span></td></tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h3>Plantilla integrada</h3>
          <p className="muted">Solo se usa si no hay plantilla Word. Puedes editar el texto con los mismos campos entre llaves.</p>
          <textarea className="input area" rows={11} value={textoBase} onChange={(e) => setTextoBase(e.target.value)} />
          <div className="actions row"><button className="btn btn-ghost-dark" onClick={() => setTextoBase(TEXTO_BASE_DEFAULT)}>Restaurar texto</button></div>
          <FitPreview><ConstanciaSheet datos={demo} texto={textoBase} /></FitPreview>
        </section>
      </div>
    </main>
  )
}
