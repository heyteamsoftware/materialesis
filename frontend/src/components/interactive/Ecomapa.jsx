import { useState } from 'react'
import { Plus, RotateCcw, X } from 'lucide-react'

const TIPOS = {
  familia: { label: 'Familia', color: '#c2643f' },
  amistades: { label: 'Amistades', color: '#d9a441' },
  salud: { label: 'Salud', color: '#3f6e6b' },
  educacion: { label: 'Educación', color: '#22344a' },
  empleo: { label: 'Empleo', color: '#9a6f17' },
  servicios: { label: 'Servicios sociales', color: '#56694f' },
  ocio: { label: 'Ocio y cultura', color: '#7a4b5c' },
  vecindario: { label: 'Vecindario', color: '#a1702f' },
}

const VINCULOS = {
  fuerte: { label: 'Fuerte', desc: 'Apoyo sólido y frecuente' },
  debil: { label: 'Débil', desc: 'Contacto escaso o irregular' },
  conflictivo: { label: 'Conflictivo', desc: 'Relación con tensión o estrés' },
}

const EJEMPLO = {
  centro: 'Familia de Samira',
  nodos: [
    { id: 1, nombre: 'Abuela materna', tipo: 'familia', vinculo: 'fuerte' },
    { id: 2, nombre: 'Colegio del hijo', tipo: 'educacion', vinculo: 'fuerte' },
    { id: 3, nombre: 'Expareja', tipo: 'familia', vinculo: 'conflictivo' },
    { id: 4, nombre: 'Centro de salud', tipo: 'salud', vinculo: 'debil' },
    { id: 5, nombre: 'Trabajo por horas', tipo: 'empleo', vinculo: 'conflictivo' },
  ],
}

const C = 300 // centro del lienzo
const R = 205 // radio de la órbita

function zigzag(x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const n = Math.max(4, Math.floor(len / 13))
  const px = -dy / len
  const py = dx / len
  let d = `M${x1} ${y1}`
  for (let i = 1; i < n; i++) {
    const t = i / n
    const off = (i % 2 ? 1 : -1) * 6.5
    d += ` L${(x1 + dx * t + px * off).toFixed(1)} ${(y1 + dy * t + py * off).toFixed(1)}`
  }
  return `${d} L${x2} ${y2}`
}

function lineasTexto(texto, max = 13) {
  const palabras = texto.split(/\s+/)
  const lineas = ['']
  for (const p of palabras) {
    const actual = lineas[lineas.length - 1]
    if ((actual + ' ' + p).trim().length > max && actual) lineas.push(p)
    else lineas[lineas.length - 1] = (actual + ' ' + p).trim()
  }
  return lineas.slice(0, 3)
}

export default function Ecomapa({ color }) {
  const [centro, setCentro] = useState(EJEMPLO.centro)
  const [nodos, setNodos] = useState(EJEMPLO.nodos)
  const [nuevo, setNuevo] = useState({ nombre: '', tipo: 'familia', vinculo: 'fuerte' })
  const [activo, setActivo] = useState(null)

  const anadir = (e) => {
    e.preventDefault()
    if (!nuevo.nombre.trim() || nodos.length >= 12) return
    setNodos([...nodos, { ...nuevo, nombre: nuevo.nombre.trim(), id: Date.now() }])
    setNuevo({ ...nuevo, nombre: '' })
  }
  const cambiarVinculo = (id) => {
    const orden = ['fuerte', 'debil', 'conflictivo']
    setNodos(nodos.map((n) => (n.id === id ? { ...n, vinculo: orden[(orden.indexOf(n.vinculo) + 1) % 3] } : n)))
  }
  const quitar = (id) => setNodos(nodos.filter((n) => n.id !== id))

  const posiciones = nodos.map((n, i) => {
    const ang = (i / Math.max(nodos.length, 1)) * Math.PI * 2 - Math.PI / 2
    return { ...n, x: C + Math.cos(ang) * R, y: C + Math.sin(ang) * R, ang }
  })

  return (
    <div className="grid gap-8 xl:grid-cols-[1.25fr_1fr]">
      <div>
        <svg viewBox="0 0 600 600" className="mx-auto w-full max-w-[560px]" role="img" aria-label={`Ecomapa de ${centro} con ${nodos.length} vínculos`}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="#e8decc" strokeDasharray="3 7" />
          {posiciones.map((n) => {
            const x1 = C + Math.cos(n.ang) * 66
            const y1 = C + Math.sin(n.ang) * 66
            const x2 = n.x - Math.cos(n.ang) * 50
            const y2 = n.y - Math.sin(n.ang) * 50
            const dim = activo && activo !== n.id ? 0.25 : 1
            return n.vinculo === 'conflictivo' ? (
              <path key={`l${n.id}`} d={zigzag(x1, y1, x2, y2)} fill="none" stroke="#b4472b" strokeWidth="2.5" strokeLinejoin="round" opacity={dim} className="transition-opacity duration-300" />
            ) : (
              <line
                key={`l${n.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#1e2a36"
                strokeWidth={n.vinculo === 'fuerte' ? 5 : 2}
                strokeDasharray={n.vinculo === 'debil' ? '7 7' : undefined}
                strokeLinecap="round"
                opacity={dim}
                className="transition-opacity duration-300"
              />
            )
          })}

          <circle cx={C} cy={C} r="64" fill={color} />
          {lineasTexto(centro, 12).map((l, i, arr) => (
            <text key={i} x={C} y={C + (i - (arr.length - 1) / 2) * 18 + 5} textAnchor="middle" fill="#fbf8f2" fontFamily="Fraunces, serif" fontSize="16">
              {l}
            </text>
          ))}

          {posiciones.map((n) => (
            <g
              key={n.id}
              onMouseEnter={() => setActivo(n.id)}
              onMouseLeave={() => setActivo(null)}
              onClick={() => cambiarVinculo(n.id)}
              className="cursor-pointer"
              role="button"
              aria-label={`${n.nombre}: vínculo ${VINCULOS[n.vinculo].label}. Pulsa para cambiarlo`}
            >
              <circle cx={n.x} cy={n.y} r={activo === n.id ? 52 : 48} fill="#fffdf8" stroke={TIPOS[n.tipo].color} strokeWidth="3" className="transition-all duration-300" />
              {lineasTexto(n.nombre).map((l, i, arr) => (
                <text key={i} x={n.x} y={n.y + (i - (arr.length - 1) / 2) * 14 + 4} textAnchor="middle" fill="#1e2a36" fontSize="12.5" fontWeight="600">
                  {l}
                </text>
              ))}
            </g>
          ))}
        </svg>
        <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-tinta-2">
          <li className="flex items-center gap-2">
            <svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="#1e2a36" strokeWidth="5" strokeLinecap="round" /></svg> Fuerte
          </li>
          <li className="flex items-center gap-2">
            <svg width="34" height="10"><line x1="0" y1="5" x2="34" y2="5" stroke="#1e2a36" strokeWidth="2" strokeDasharray="6 6" /></svg> Débil
          </li>
          <li className="flex items-center gap-2">
            <svg width="34" height="12"><path d={zigzag(0, 6, 34, 6)} fill="none" stroke="#b4472b" strokeWidth="2" /></svg> Conflictivo
          </li>
          <li className="text-tinta-3">Pulsa un círculo para cambiar su vínculo</li>
        </ul>
      </div>

      <div className="grid content-start gap-6">
        <div>
          <label className="campo-label" htmlFor="eco-centro">
            Persona o familia en el centro
          </label>
          <input id="eco-centro" className="campo" value={centro} maxLength={40} onChange={(e) => setCentro(e.target.value)} />
        </div>

        <form onSubmit={anadir} className="grid gap-4 rounded-2xl bg-arena/70 p-5">
          <p className="font-serif text-lg">Añadir un sistema</p>
          <input className="campo" placeholder="Ej.: Asociación vecinal" value={nuevo.nombre} maxLength={30} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} aria-label="Nombre" />
          <select className="campo" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })} aria-label="Tipo">
            {Object.entries(TIPOS).map(([k, t]) => (
              <option key={k} value={k}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-1 rounded-full bg-papel p-1" role="radiogroup" aria-label="Tipo de vínculo">
            {Object.entries(VINCULOS).map(([k, v]) => (
              <button
                type="button"
                key={k}
                role="radio"
                aria-checked={nuevo.vinculo === k}
                title={v.desc}
                onClick={() => setNuevo({ ...nuevo, vinculo: k })}
                className={`rounded-full px-2 py-2 text-xs font-semibold transition-all duration-300 ${nuevo.vinculo === k ? 'bg-tinta text-papel shadow-suave' : 'text-tinta-2 hover:text-tinta'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primario btn-sm" disabled={!nuevo.nombre.trim() || nodos.length >= 12}>
            <Plus size={16} /> Añadir al ecomapa
          </button>
        </form>

        <div>
          <div className="flex items-center justify-between">
            <p className="etiqueta text-tinta-3">{nodos.length} sistemas</p>
            <button onClick={() => { setNodos(EJEMPLO.nodos); setCentro(EJEMPLO.centro) }} className="flex items-center gap-1.5 text-xs font-semibold text-tinta-2 hover:text-tinta">
              <RotateCcw size={13} /> Ejemplo
            </button>
          </div>
          <ul className="mt-3 flex flex-wrap gap-2">
            {nodos.map((n) => (
              <li
                key={n.id}
                onMouseEnter={() => setActivo(n.id)}
                onMouseLeave={() => setActivo(null)}
                className="flex items-center gap-2 rounded-full border bg-papel py-1 pl-3 pr-1 text-sm"
                style={{ borderColor: TIPOS[n.tipo].color }}
              >
                {n.nombre}
                <button onClick={() => quitar(n.id)} className="rounded-full p-1 text-tinta-3 hover:bg-lino hover:text-tinta" aria-label={`Quitar ${n.nombre}`}>
                  <X size={13} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="rounded-2xl border border-dashed border-lino-2 p-4 text-sm leading-relaxed text-tinta-2">
          <strong className="text-tinta">Para la entrevista:</strong> construid el ecomapa juntos. Preguntad qué vínculo le gustaría reforzar y cuál le
          resta energía: suele abrir conversaciones que no salen con un cuestionario.
        </p>
      </div>
    </div>
  )
}
