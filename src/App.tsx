import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import ConstanciaPage from './pages/Constancia'
import ProgramasPage from './pages/Programas'
import ReportesPage from './pages/Reportes'
import PlantillaPage from './pages/Plantilla'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/constancia/:id?" element={<ConstanciaPage />} />
        <Route path="/programas" element={<ProgramasPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/plantilla" element={<PlantillaPage />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <footer className="foot no-print">
        <div>Facultad de Ingeniería Tampico · Universidad Autónoma de Tamaulipas</div>
        <div>#IngenieríaEsLoDeHoy</div>
      </footer>
    </>
  )
}
