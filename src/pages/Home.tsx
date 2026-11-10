import { Link } from 'react-router-dom'
import { useData } from '../lib/data'
import hashtag from '../assets/img/hashtag.png'
import correcaminos from '../assets/img/correcaminos.png'

export default function Home() {
  const { alumnos, programas, registros } = useData()
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div>
            <img className="hero-hash" src={hashtag} alt="#Ingeniería es lo de hoy" />
            <h1>Sistema de constancias de posgrado</h1>
            <p>Facultad de Ingeniería Tampico · Universidad Autónoma de Tamaulipas</p>
            <div className="hero-cta">
              <Link className="btn btn-primary" to="/constancia">Generar constancia</Link>
              <Link className="btn btn-ghost" to="/reportes">Ver reportes</Link>
            </div>
          </div>
          <img className="hero-bird" src={correcaminos} alt="" />
        </div>
      </section>

      <main className="page">
        <div className="stats">
          <div><b>{alumnos.length}</b><span>Tesistas en la base de datos</span></div>
          <div><b>{programas.length}</b><span>Programas académicos</span></div>
          <div><b>{registros.length}</b><span>Constancias emitidas</span></div>
        </div>
        <div className="cards">
          <Link to="/constancia" className="card-link"><h3>Generar constancia</h3><p>Elige al alumno, captura el No. Oficio y descarga o imprime.</p></Link>
          <Link to="/programas" className="card-link"><h3>Programas académicos</h3><p>Agrega, consulta y edita siglas, nombre, No. Referencia y Perfil Rizoma.</p></Link>
          <Link to="/reportes" className="card-link"><h3>Reportes</h3><p>Excel por semestre, programa, alumno y tipo de beca.</p></Link>
          <Link to="/plantilla" className="card-link"><h3>Plantilla</h3><p>Carga la plantilla Word; queda guardada en este equipo.</p></Link>
        </div>
      </main>
    </>
  )
}
