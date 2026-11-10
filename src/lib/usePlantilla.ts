import { useCallback, useEffect, useState } from 'react'
import { cargarPlantilla, type PlantillaGuardada } from './plantilla'

export function usePlantilla() {
  const [plantilla, setPlantilla] = useState<PlantillaGuardada | null>(null)
  const [cargando, setCargando] = useState(true)
  const recargar = useCallback(async () => {
    setCargando(true)
    let p = await cargarPlantilla()
    if (!p) {
      try {
        const r = await fetch('./plantilla-vigencias.docx')
        if (r.ok) p = { nombre: 'Plantilla de vigencias (incluida)', data: await r.arrayBuffer(), actualizada: '', incluida: true }
      } catch { /* sin plantilla incluida */ }
    }
    setPlantilla(p)
    setCargando(false)
  }, [])
  useEffect(() => { void recargar() }, [recargar])
  return { plantilla, cargando, recargar }
}

export function useHoy(hoyISO: () => string) {
  const [hoy, setHoy] = useState(hoyISO())
  useEffect(() => {
    const check = () => setHoy(hoyISO())
    const t = setInterval(check, 60_000)
    window.addEventListener('focus', check)
    return () => { clearInterval(t); window.removeEventListener('focus', check) }
  }, [hoyISO])
  return hoy
}
