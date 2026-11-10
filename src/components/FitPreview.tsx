import { useEffect, useRef, useState, type ReactNode } from 'react'

/** Escala la hoja (ancho carta) para que quepa en el contenedor. */
export default function FitPreview({ children, sheetWidth = 816 }: { children: ReactNode; sheetWidth?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const [z, setZ] = useState(1)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setZ(Math.min(1, (el.clientWidth - 2) / sheetWidth)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [sheetWidth])
  return (
    <div ref={box} className="fit-box">
      <div className="fit" style={{ zoom: z }}>{children}</div>
    </div>
  )
}
