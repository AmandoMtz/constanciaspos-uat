import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import AlumnoList from './AlumnoList'
import logoUat from '../assets/img/logo-uat.png'
import logoFi from '../assets/img/logo-fi.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const nav = useNavigate()
  const loc = useLocation()

  useEffect(() => { setOpen(false); setMenu(false) }, [loc.pathname])
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <header className="nav no-print">
      <div className="nav-stripe" />
      <div className="nav-in">
        <Link to="/" className="brand" aria-label="Inicio">
          <img src={logoUat} alt="Universidad Autónoma de Tamaulipas" />
          <span className="brand-sep" />
          <img src={logoFi} alt="Facultad de Ingeniería Tampico" />
        </Link>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label="Menú">☰</button>
        <nav className={`links ${menu ? 'show' : ''}`}>
          <NavLink to="/" end>Inicio</NavLink>
          <div className="dd" ref={ref}>
            <button type="button" className={`dd-btn ${open ? 'on' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open}>
              Generar constancia <span className="caret">▾</span>
            </button>
            {open && (
              <div className="dd-panel">
                <div className="dd-title">Selecciona al alumno</div>
                <AlumnoList autoFocus height={320} onSelect={(a) => nav(`/constancia/${a.id}`)} />
              </div>
            )}
          </div>
          <NavLink to="/programas">Programas</NavLink>
          <NavLink to="/reportes">Reportes</NavLink>
          <NavLink to="/plantilla">Plantilla</NavLink>
        </nav>
      </div>
    </header>
  )
}
