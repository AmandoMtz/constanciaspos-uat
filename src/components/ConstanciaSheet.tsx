import type { ReactNode } from 'react'
import logoUat from '../assets/img/logo-uat.png'
import logoFi from '../assets/img/logo-fi.png'
import type { Datos } from '../lib/types'

export function renderTexto(texto: string, datos: Datos): ReactNode[] {
  return texto.split(/\n\s*\n/).map((par, i) => (
    <p key={i}>
      {par.split(/(\{[a-z_]+\})/g).map((t, j) => {
        const m = t.match(/^\{([a-z_]+)\}$/)
        if (!m) return t
        const v = datos[m[1]]
        return v === undefined ? t : <strong key={j}>{v || '—'}</strong>
      })}
    </p>
  ))
}

/** Plantilla integrada (se usa mientras no se cargue una plantilla Word). */
export default function ConstanciaSheet({ datos, texto }: { datos: Datos; texto: string }) {
  return (
    <div className="sheet">
      <div className="sheet-head">
        <img src={logoUat} alt="UAT" />
        <img src={logoFi} alt="Facultad de Ingeniería Tampico" />
      </div>
      <div className="sheet-rule" />
      <div className="sheet-meta">
        <div>{datos.lugar_fecha}</div>
        <div><span>No. Oficio:</span> <strong>{datos.oficio || '—'}</strong></div>
        <div><span>No. Referencia:</span> <strong>{datos.referencia || '—'}</strong></div>
        <div><span>Programa:</span> <strong>{datos.siglas}</strong></div>
      </div>
      <h2 className="sheet-title">CONSTANCIA</h2>
      <div className="sheet-body">{renderTexto(texto, datos)}</div>
      <div className="sheet-sign">
        <div className="line" />
        <div>ATENTAMENTE</div>
        <div className="small">“Por una humanidad culta”</div>
      </div>
      <div className="sheet-foot">Facultad de Ingeniería Tampico · Universidad Autónoma de Tamaulipas</div>
    </div>
  )
}
