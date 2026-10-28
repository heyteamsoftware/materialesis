import { useState } from 'react'
import { ArrowRight, RotateCcw, CheckCircle2, AlertTriangle, CircleSlash } from 'lucide-react'

const ESCENAS = [
  {
    situacion:
      'Samira, 34 años, llega por primera vez al servicio con su hijo de 6. Se sienta en el borde de la silla y mira el reloj: «Me han dicho que aquí me pueden ayudar con el alquiler, pero tengo poco tiempo».',
    opciones: [
      {
        texto: '«Vale, dame tu DNI y el contrato y vamos rellenando la solicitud».',
        puntos: 1,
        feedback: 'Vas directamente al trámite. Es eficiente, pero Samira todavía no sabe quién eres ni por qué debería confiar en ti.',
      },
      {
        texto: '«Gracias por venir. Tenemos unos treinta minutos. ¿Te parece si empezamos por lo que más te preocupa?»',
        puntos: 3,
        feedback: 'Das la bienvenida, encuadras el tiempo y le devuelves el control de la conversación. Es una apertura muy sólida.',
      },
      {
        texto: '«Tranquila, aquí todo el mundo viene con problemas parecidos. Ya verás como se arregla».',
        puntos: 0,
        feedback: 'Querer tranquilizar es comprensible, pero minimizas su situación y prometes algo que no depende de ti.',
      },
    ],
  },
  {
    situacion:
      'Samira cuenta que debe dos meses de alquiler. Se le quiebra la voz: «Me da mucha vergüenza estar aquí». Su hijo empieza a inquietarse y a tirar de su manga.',
    opciones: [
      {
        texto: '«No tienes por qué sentir vergüenza».',
        puntos: 1,
        feedback: 'Está bien intencionado, pero niega su emoción. Es mejor validarla antes de intentar cambiarla.',
      },
      {
        texto: '«Entiendo que no es fácil venir a pedir ayuda. Que estés aquí dice mucho de cómo cuidas de tu familia».',
        puntos: 3,
        feedback: 'Validas la emoción y reconoces una fortaleza. Refuerzas el vínculo sin minimizar lo que siente.',
      },
      {
        texto: 'Ofreces al niño papel y lápices, y esperas unos segundos en silencio.',
        puntos: 2,
        feedback: 'Atender al contexto y respetar el silencio también comunica. Combínalo con una validación verbal para que Samira se sienta escuchada.',
      },
    ],
  },
  {
    situacion:
      'Samira explica que su pareja se fue hace tres meses y que trabaja limpiando por horas, sin contrato. Te pide: «Por favor, eso no lo pongas en ningún papel».',
    opciones: [
      {
        texto: '«No te preocupes, no lo apuntaré».',
        puntos: 0,
        feedback: 'No puedes prometer una confidencialidad absoluta sin conocer su alcance. Ocultar información también puede perjudicarla.',
      },
      {
        texto: '«Te explico qué necesito registrar, para qué se usa y quién puede verlo. Así decides con información qué quieres contarme».',
        puntos: 3,
        feedback: 'Transparencia sobre la confidencialidad y sus límites. Respetas su autonomía y cuidas la confianza.',
      },
      {
        texto: '«Trabajar sin contrato no es legal; deberías regularizarlo cuanto antes».',
        puntos: 0,
        feedback: 'Juzgar en una primera entrevista rompe la confianza. Tu papel aquí es acompañar, no sancionar.',
      },
    ],
  },
  {
    situacion: 'Quedan cinco minutos. El niño está cansado y Samira vuelve a mirar el reloj.',
    opciones: [
      {
        texto: 'Resumes lo hablado, acordáis dos pasos concretos para esta semana y fijáis la próxima cita.',
        puntos: 3,
        feedback: 'Un cierre claro reduce la incertidumbre: Samira sale sabiendo qué va a pasar y qué depende de ella.',
      },
      {
        texto: 'Le das un folleto con todos los recursos de la ciudad para que elija.',
        puntos: 1,
        feedback: 'Mucha información sin acompañamiento puede abrumar justo cuando hay poca energía.',
      },
      {
        texto: '«Ya te llamaré cuando sepa algo».',
        puntos: 1,
        feedback: 'Deja la iniciativa solo de tu lado y sin fecha. Genera incertidumbre en alguien que ya está bajo presión.',
      },
    ],
  },
]

const MAX = ESCENAS.length * 3

function tono(p) {
  if (p === 3) return { Icon: CheckCircle2, clase: 'bg-salvia-100 text-salvia-700', titulo: 'Muy buena decisión' }
  if (p >= 1) return { Icon: AlertTriangle, clase: 'bg-mostaza-100 text-mostaza-700', titulo: 'Se puede mejorar' }
  return { Icon: CircleSlash, clase: 'bg-terracota-100 text-terracota-700', titulo: 'Cuidado' }
}

export default function Entrevista({ color }) {
  const [paso, setPaso] = useState(0)
  const [elegida, setElegida] = useState(null)
  const [historial, setHistorial] = useState([])

  const fin = paso >= ESCENAS.length
  const escena = ESCENAS[paso]
  const total = historial.reduce((s, h) => s + h.puntos, 0)

  const continuar = () => {
    setHistorial([...historial, { ...escena.opciones[elegida], escena: paso }])
    setElegida(null)
    setPaso(paso + 1)
  }
  const reiniciar = () => {
    setPaso(0)
    setElegida(null)
    setHistorial([])
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progreso */}
      <div className="flex items-center gap-2" aria-label={`Escena ${Math.min(paso + 1, ESCENAS.length)} de ${ESCENAS.length}`}>
        {ESCENAS.map((_, i) => (
          <span key={i} className="h-1.5 flex-1 rounded-full transition-all duration-700 ease-suave" style={{ background: i < paso || fin ? color : i === paso ? `${color}66` : '#e8decc' }} />
        ))}
      </div>

      {!fin ? (
        <div key={paso} className="animate-aparece">
          <p className="etiqueta mt-8" style={{ color }}>
            Escena {paso + 1} de {ESCENAS.length}
          </p>
          <p className="mt-3 font-serif text-2xl leading-snug sm:text-[1.65rem]">{escena.situacion}</p>
          <p className="mt-6 text-sm font-semibold text-tinta-2">¿Qué haces?</p>
          <div className="mt-3 grid gap-3">
            {escena.opciones.map((o, i) => {
              const sel = elegida === i
              const bloqueada = elegida !== null
              return (
                <button
                  key={i}
                  disabled={bloqueada && !sel}
                  onClick={() => setElegida(i)}
                  className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-500 ease-suave ${
                    sel ? 'border-transparent bg-tinta text-papel shadow-flota' : 'border-lino-2 bg-papel hover:-translate-y-0.5 hover:border-tinta-3 hover:shadow-suave disabled:opacity-40 disabled:hover:translate-y-0'
                  }`}
                >
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold ${sel ? 'bg-mostaza text-tinta' : 'bg-arena'}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="leading-relaxed">{o.texto}</span>
                </button>
              )
            })}
          </div>

          {elegida !== null && (() => {
            const op = escena.opciones[elegida]
            const t = tono(op.puntos)
            return (
              <div className={`mt-5 animate-aparece rounded-2xl p-5 ${t.clase}`}>
                <p className="flex items-center gap-2 font-semibold">
                  <t.Icon size={18} /> {t.titulo}
                </p>
                <p className="mt-1.5 leading-relaxed">{op.feedback}</p>
                <button onClick={continuar} className="btn btn-primario btn-sm mt-4">
                  {paso === ESCENAS.length - 1 ? 'Ver resultado' : 'Siguiente escena'} <ArrowRight size={15} />
                </button>
              </div>
            )
          })()}
        </div>
      ) : (
        <div className="animate-aparece">
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <div className="relative grid h-28 w-28 place-items-center">
              <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#e8decc" strokeWidth="8" />
                <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(total / MAX) * 276.5} 276.5`} className="transition-all duration-1000" />
              </svg>
              <span className="font-serif text-3xl">
                {total}
                <span className="text-base text-tinta-3">/{MAX}</span>
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-3xl">
                {total >= 10 ? 'Una acogida cálida y profesional.' : total >= 6 ? 'Buen punto de partida.' : 'Hay margen para crecer.'}
              </h3>
              <p className="mt-2 text-tinta-2">
                {total >= 10
                  ? 'Has cuidado el vínculo, la autonomía de Samira y la claridad del proceso.'
                  : 'Revisa la retroalimentación de cada escena y vuelve a intentarlo eligiendo otros caminos.'}
              </p>
            </div>
          </div>
          <ol className="mt-8 grid gap-3">
            {historial.map((h) => {
              const t = tono(h.puntos)
              return (
                <li key={h.escena} className="flex gap-4 rounded-2xl bg-arena/70 p-4">
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${t.clase}`}>
                    <t.Icon size={16} />
                  </span>
                  <span className="text-sm leading-relaxed">
                    <span className="font-semibold">Escena {h.escena + 1}:</span> {h.texto}
                    <span className="mt-1 block text-tinta-2">{h.feedback}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <button onClick={reiniciar} className="btn btn-claro mt-8">
            <RotateCcw size={16} /> Repetir la entrevista
          </button>
        </div>
      )}
    </div>
  )
}
