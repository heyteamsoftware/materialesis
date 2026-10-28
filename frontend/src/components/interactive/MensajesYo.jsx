import { useMemo, useState } from 'react'
import { Copy, Check, AlertTriangle, CheckCircle2, ArrowDown } from 'lucide-react'

const EMOCIONES = ['preocupado/a', 'frustrado/a', 'triste', 'dolido/a', 'agobiado/a', 'enfadado/a', 'inseguro/a', 'decepcionado/a', 'cansado/a', 'nervioso/a']

const EJEMPLOS = [
  {
    tu: '¡Siempre llegas tarde! No te importa nada el grupo.',
    cuando: 'llegas veinte minutos tarde a la reunión del grupo',
    emocion: 'frustrado/a',
    porque: 'necesito que empecemos a la vez para que nos dé tiempo a todo',
    peticion: 'me avises con antelación si vas a retrasarte',
  },
  {
    tu: 'Eres un desordenado, nunca recoges la cocina.',
    cuando: 'encuentro los platos sin fregar al volver de trabajar',
    emocion: 'cansado/a',
    porque: 'necesito llegar a un espacio cuidado para descansar',
    peticion: 'acordemos un turno semanal para la cocina',
  },
]

// Palabras que suelen convertir un mensaje en reproche
const ALERTAS = [
  { re: /\b(siempre|nunca|jamás|todo el rato|todo el mundo)\b/i, msg: 'Evita generalizaciones («siempre», «nunca»): describe una situación concreta.' },
  { re: /\b(eres|estás siendo)\s+(un|una|muy|tan)?\s*\w+/i, msg: 'Evita etiquetas sobre la persona («eres…»). Habla de la conducta, no de cómo es.' },
  { re: /\b(me haces|tú me haces|por tu culpa)\b/i, msg: 'Tu emoción es tuya: mejor «me siento…» que «me haces sentir…».' },
]

function Paso({ n, titulo, color, children }) {
  return (
    <div className="grid grid-cols-[2.25rem_1fr] gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full font-serif text-white" style={{ background: color }}>
        {n}
      </span>
      <div>
        <p className="font-semibold">{titulo}</p>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  )
}

export default function MensajesYo({ color, tint }) {
  const [m, setM] = useState({ tu: '', cuando: '', emocion: '', porque: '', peticion: '' })
  const [copiado, setCopiado] = useState(false)
  const set = (k) => (e) => setM({ ...m, [k]: e.target.value })

  const avisos = useMemo(() => {
    const texto = `${m.cuando} ${m.porque} ${m.peticion}`
    return ALERTAS.filter((a) => a.re.test(texto)).map((a) => a.msg)
  }, [m])

  const completos = [m.cuando, m.emocion, m.porque, m.peticion].filter((x) => x.trim()).length
  const mensaje = completos === 4 ? `Cuando ${m.cuando.trim()}, me siento ${m.emocion.trim()}, porque ${m.porque.trim()}. Me gustaría que ${m.peticion.trim()}.` : ''

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(mensaje)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      /* sin permiso de portapapeles */
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div className="grid content-start gap-6">
        <div className="rounded-2xl bg-terracota-100/70 p-5">
          <label htmlFor="my-tu" className="text-sm font-semibold text-terracota-700">
            El mensaje «tú» (el reproche de partida)
          </label>
          <textarea id="my-tu" rows={2} className="campo mt-2 !bg-papel" value={m.tu} onChange={set('tu')} placeholder="¡Siempre llegas tarde!" />
          <div className="mt-3 flex flex-wrap gap-2">
            {EJEMPLOS.map((ej, i) => (
              <button key={i} onClick={() => setM(ej)} className="rounded-full bg-papel px-3 py-1.5 text-xs font-semibold text-tinta-2 transition hover:text-tinta hover:shadow-suave">
                Cargar ejemplo {i + 1}
              </button>
            ))}
          </div>
        </div>
        <ArrowDown className="mx-auto text-tinta-3" size={20} />

        <Paso color={color} n="1" titulo="Cuando… (describe el hecho, sin juzgar)">
          <input className="campo" value={m.cuando} onChange={set('cuando')} placeholder="llegas veinte minutos tarde a la reunión" />
        </Paso>
        <Paso color={color} n="2" titulo="Me siento… (nombra tu emoción)">
          <div className="flex flex-wrap gap-2">
            {EMOCIONES.map((e) => (
              <button
                key={e}
                onClick={() => setM({ ...m, emocion: e })}
                aria-pressed={m.emocion === e}
                className={`rounded-full border px-3 py-1.5 text-sm transition-all duration-300 ${m.emocion === e ? 'border-transparent text-white shadow-suave' : 'border-lino-2 bg-papel hover:border-tinta-3'}`}
                style={m.emocion === e ? { background: color } : undefined}
              >
                {e}
              </button>
            ))}
          </div>
        </Paso>
        <Paso color={color} n="3" titulo="Porque… (qué necesitas)">
          <input className="campo" value={m.porque} onChange={set('porque')} placeholder="necesito que empecemos a la vez" />
        </Paso>
        <Paso color={color} n="4" titulo="Me gustaría que… (una petición concreta)">
          <input className="campo" value={m.peticion} onChange={set('peticion')} placeholder="me avises si vas a retrasarte" />
        </Paso>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-[1.6rem] p-6 sm:p-8" style={{ background: tint }}>
          <p className="etiqueta" style={{ color }}>
            Tu mensaje «yo»
          </p>
          {mensaje ? (
            <p className="mt-4 animate-aparece font-serif text-2xl leading-snug">«{mensaje}»</p>
          ) : (
            <p className="mt-4 font-serif text-xl leading-snug text-tinta-3">Completa los cuatro pasos ({completos}/4) y aparecerá aquí tu mensaje.</p>
          )}
          {m.tu && mensaje && (
            <p className="mt-5 border-t border-tinta/10 pt-4 text-sm text-tinta-2">
              <span className="font-semibold">Antes:</span> <span className="line-through decoration-terracota/60">{m.tu}</span>
            </p>
          )}
          {mensaje && (
            <button onClick={copiar} className="btn btn-claro btn-sm mt-5">
              {copiado ? <Check size={15} /> : <Copy size={15} />} {copiado ? 'Copiado' : 'Copiar mensaje'}
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-2">
          {avisos.map((a) => (
            <p key={a} className="flex items-start gap-2 rounded-2xl bg-mostaza-100 px-4 py-3 text-sm text-mostaza-700">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {a}
            </p>
          ))}
          {mensaje && avisos.length === 0 && (
            <p className="flex items-start gap-2 rounded-2xl bg-salvia-100 px-4 py-3 text-sm text-salvia-700">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> Sin generalizaciones ni etiquetas: un mensaje asertivo.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
