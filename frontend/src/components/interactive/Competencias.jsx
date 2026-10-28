import { useState } from 'react'
import { RotateCcw, TrendingUp, Sprout } from 'lucide-react'

const COMPETENCIAS = [
  { k: 'comunicacion', label: 'Comunicación', tip: 'Practica presentarte en un minuto: quién eres, qué sabes hacer y qué buscas.' },
  { k: 'equipo', label: 'Trabajo en equipo', tip: 'Busca un voluntariado o actividad grupal donde colaborar con otras personas.' },
  { k: 'responsabilidad', label: 'Responsabilidad', tip: 'Usa una agenda semanal y revisa cada viernes qué compromisos has cumplido.' },
  { k: 'iniciativa', label: 'Iniciativa', tip: 'Proponte una acción nueva cada semana: llamar a una empresa, pedir información…' },
  { k: 'adaptacion', label: 'Adaptación', tip: 'Recuerda un cambio difícil que superaste: es un buen ejemplo para una entrevista.' },
  { k: 'problemas', label: 'Resolución de problemas', tip: 'Ante un problema, escribe tres posibles soluciones antes de elegir una.' },
  { k: 'digital', label: 'Competencia digital', tip: 'Crea un correo profesional y aprende a adjuntar tu CV en PDF desde el móvil.' },
  { k: 'organizacion', label: 'Organización', tip: 'Divide la búsqueda de empleo en tareas pequeñas con un horario fijo.' },
]

const NIVELES = ['', 'Muy poco', 'Poco', 'Regular', 'Bastante', 'Mucho']
const INICIAL = Object.fromEntries(COMPETENCIAS.map((c) => [c.k, 3]))

const CX = 180
const CY = 180
const RMAX = 128

function punto(i, valor) {
  const ang = (i / COMPETENCIAS.length) * Math.PI * 2 - Math.PI / 2
  const r = (valor / 5) * RMAX
  return [CX + Math.cos(ang) * r, CY + Math.sin(ang) * r]
}

export default function Competencias({ color, tint }) {
  const [valores, setValores] = useState(INICIAL)
  const [nombre, setNombre] = useState('')

  const poligono = COMPETENCIAS.map((c, i) => punto(i, valores[c.k]).join(',')).join(' ')
  const ordenadas = [...COMPETENCIAS].sort((a, b) => valores[b.k] - valores[a.k])
  const fuertes = ordenadas.slice(0, 2)
  const mejora = ordenadas.slice(-2).reverse()
  const media = (Object.values(valores).reduce((a, b) => a + b, 0) / COMPETENCIAS.length).toFixed(1)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr]">
      <div className="grid content-start gap-5">
        <div>
          <label className="campo-label" htmlFor="comp-nombre">
            Nombre (opcional)
          </label>
          <input id="comp-nombre" className="campo" value={nombre} maxLength={40} onChange={(e) => setNombre(e.target.value)} placeholder="¿De quién es este perfil?" />
        </div>
        <p className="text-sm text-tinta-2">¿Cuánto crees que dominas cada competencia? Mueve cada barra del 1 al 5.</p>
        {COMPETENCIAS.map((c) => (
          <div key={c.k}>
            <div className="flex items-baseline justify-between">
              <label htmlFor={`r-${c.k}`} className="text-sm font-semibold">
                {c.label}
              </label>
              <span className="text-xs text-tinta-3">{NIVELES[valores[c.k]]}</span>
            </div>
            <input
              id={`r-${c.k}`}
              type="range"
              min="1"
              max="5"
              step="1"
              value={valores[c.k]}
              onChange={(e) => setValores({ ...valores, [c.k]: Number(e.target.value) })}
              className="mt-2 w-full cursor-pointer"
              style={{ accentColor: color }}
            />
          </div>
        ))}
        <button onClick={() => setValores(INICIAL)} className="btn btn-texto btn-sm justify-self-start text-tinta-2">
          <RotateCcw size={14} /> Reiniciar
        </button>
      </div>

      <div className="grid content-start gap-6">
        <div className="rounded-[1.6rem] p-4 sm:p-6" style={{ background: tint }}>
          <p className="text-center font-serif text-xl">{nombre ? `Perfil de ${nombre}` : 'Tu perfil de competencias'}</p>
          <svg viewBox="0 0 360 360" className="mx-auto mt-2 w-full max-w-[380px]" role="img" aria-label={`Gráfico radar. Media ${media} sobre 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <polygon
                key={n}
                points={COMPETENCIAS.map((_, i) => punto(i, n).join(',')).join(' ')}
                fill={n === 5 ? '#fbf8f2' : 'none'}
                stroke="#d9ccb6"
                strokeWidth={n === 5 ? 1.5 : 1}
                strokeDasharray={n === 5 ? undefined : '2 4'}
              />
            ))}
            {COMPETENCIAS.map((c, i) => {
              const [x, y] = punto(i, 5)
              const [lx, ly] = punto(i, 6.15)
              return (
                <g key={c.k}>
                  <line x1={CX} y1={CY} x2={x} y2={y} stroke="#e8decc" />
                  <text x={lx} y={ly} textAnchor={Math.abs(lx - CX) < 10 ? 'middle' : lx > CX ? 'start' : 'end'} dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#4b5561">
                    {c.label.split(' ')[0]}
                  </text>
                </g>
              )
            })}
            <polygon points={poligono} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2.5" strokeLinejoin="round" style={{ transition: 'all .6s cubic-bezier(.22,.8,.32,1)' }} />
            {COMPETENCIAS.map((c, i) => {
              const [x, y] = punto(i, valores[c.k])
              return <circle key={c.k} cx={x} cy={y} r="4.5" fill="#fffdf8" stroke={color} strokeWidth="2.5" style={{ transition: 'all .6s cubic-bezier(.22,.8,.32,1)' }} />
            })}
          </svg>
          <p className="text-center text-sm text-tinta-2">
            Media: <strong className="font-serif text-lg text-tinta">{media}</strong> / 5
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-salvia-100 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-salvia-700">
              <TrendingUp size={16} /> Tus puntos fuertes
            </p>
            <ul className="mt-2 grid gap-1 font-serif text-lg">
              {fuertes.map((c) => (
                <li key={c.k}>{c.label}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-salvia-700/90">Úsalos como argumento en tu CV y en las entrevistas.</p>
          </div>
          <div className="rounded-2xl bg-mostaza-100 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-mostaza-700">
              <Sprout size={16} /> Para seguir creciendo
            </p>
            <ul className="mt-2 grid gap-3 text-sm">
              {mejora.map((c) => (
                <li key={c.k}>
                  <span className="font-serif text-lg">{c.label}</span>
                  <span className="block text-tinta-2">{c.tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
