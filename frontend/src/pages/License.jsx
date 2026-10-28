import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, Sparkles, Clock, ShieldCheck, Plus } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Aviso, formatDate } from '../components/ui'

const FILAS = [
  ['Acceso a las 7 áreas', true, true],
  ['1 material físico por área (visor web)', true, true],
  ['1 herramienta digital por área', true, true],
  ['Toda la biblioteca de cada área', false, true],
  ['Descarga de fichas, plantillas y guías', false, true],
  ['Herramientas interactivas premium', false, true],
  ['Novedades durante todo el curso', false, true],
]

const FAQ = [
  ['¿Cómo se paga la licencia?', 'Al solicitarla te enviamos por email las instrucciones de pago. En cuanto se confirma, tu cuenta se desbloquea durante 365 días.'],
  ['¿Puedo usar los materiales con mis grupos?', 'Sí. Puedes imprimir y usar los materiales en tu trabajo con personas usuarias, grupos y alumnado. Lo que no está permitido es revenderlos o publicarlos.'],
  ['¿Qué pasa cuando termina el año?', 'Tu cuenta vuelve al modo demo, sin perder nada. Si renuevas, el nuevo año se suma al tiempo que te quede.'],
  ['¿Hay licencias para centros o equipos?', 'Sí, escríbenos desde Contacto indicando cuántas personas sois y te preparamos una propuesta.'],
]

export default function License() {
  const { user, license, setUser } = useAuth()
  const [estado, setEstado] = useState({ enviando: false, error: '' })
  const precio = license?.price ?? 49

  const solicitar = async () => {
    setEstado({ enviando: true, error: '' })
    try {
      const d = await api('license/request', { method: 'POST' })
      setUser(d.user)
      setEstado({ enviando: false, error: '' })
    } catch (err) {
      setEstado({ enviando: false, error: err.message })
    }
  }

  let accion
  if (!user) {
    accion = (
      <Link to="/registro?next=/licencia" className="btn btn-calido w-full">
        Crear cuenta y solicitar
      </Link>
    )
  } else if (user.license_active) {
    accion = (
      <div className="rounded-2xl bg-salvia-100 px-4 py-3 text-sm text-salvia-700">
        <ShieldCheck size={16} className="mr-1.5 inline" />
        {user.role === 'admin' ? 'Acceso completo de administración.' : `Licencia activa hasta el ${formatDate(user.license_until)}.`}
      </div>
    )
  } else if (user.license_requested_at) {
    accion = (
      <div className="rounded-2xl bg-mostaza-100 px-4 py-3 text-sm text-mostaza-700">
        <Clock size={16} className="mr-1.5 inline" />
        Solicitud recibida el {formatDate(user.license_requested_at)}. Te escribiremos a <strong>{user.email}</strong> con las instrucciones de
        pago; tu acceso se activará al confirmarlo.
      </div>
    )
  } else {
    accion = (
      <button onClick={solicitar} disabled={estado.enviando} className="btn btn-calido w-full">
        {estado.enviando ? 'Enviando solicitud…' : 'Solicitar licencia anual'}
      </button>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
      <header className="max-w-3xl animate-aparece">
        <p className="etiqueta text-mostaza-700">Licencia anual</p>
        <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
          Toda la biblioteca, <em className="text-terracota">un año entero</em>.
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-tinta-2">
          Empieza gratis con las demos. Cuando lo tengas claro, la licencia desbloquea la visualización completa, el uso interactivo y las
          descargas de todos los recursos.
        </p>
      </header>

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]">
        {/* Plan gratuito */}
        <section className="hoja p-7 sm:p-9 lg:mt-10">
          <p className="etiqueta text-tinta-3">Modo demo</p>
          <p className="mt-3 font-serif text-5xl">
            0 €<span className="ml-2 font-sans text-base text-tinta-3">siempre</span>
          </p>
          <p className="mt-3 text-tinta-2">Para conocer el estilo de los materiales y probar las herramientas.</p>
          <ul className="mt-7 grid gap-3">
            {FILAS.map(([t, demo]) => (
              <li key={t} className={`flex items-start gap-3 text-[0.95rem] ${demo ? '' : 'text-tinta-3'}`}>
                {demo ? <Check size={18} className="mt-0.5 shrink-0 text-salvia-700" /> : <Minus size={18} className="mt-0.5 shrink-0" />}
                {t}
              </li>
            ))}
          </ul>
          {!user && (
            <Link to="/registro" className="btn btn-claro mt-8 w-full">
              Empezar gratis
            </Link>
          )}
        </section>

        {/* Plan anual */}
        <section className="relative overflow-hidden rounded-[2rem] bg-tinta p-7 text-papel shadow-flota sm:p-10">
          <svg viewBox="0 0 200 200" className="absolute -right-16 -top-20 w-72 opacity-20" aria-hidden="true">
            <path fill="#c2643f" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
          </svg>
          <div className="relative">
            <p className="etiqueta text-mostaza">
              <Sparkles size={14} /> Licencia anual
            </p>
            <p className="mt-3 font-serif text-6xl">
              {precio} €<span className="ml-2 font-sans text-base text-papel/60">/ año</span>
            </p>
            <p className="mt-3 text-papel/75">Menos de lo que cuesta una tarde preparando materiales desde cero.</p>
            <ul className="mt-8 grid gap-3">
              {FILAS.map(([t]) => (
                <li key={t} className="flex items-start gap-3 text-[0.97rem]">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mostaza text-tinta">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-9 [&_.btn-calido]:shadow-none">
              {estado.error && (
                <div className="mb-3">
                  <Aviso>{estado.error}</Aviso>
                </div>
              )}
              {accion}
            </div>
          </div>
        </section>
      </div>

      <section className="mt-24 grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
        <h2 className="text-4xl leading-tight">Preguntas frecuentes</h2>
        <div className="border-t border-lino-2">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-lino-2">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl [&::-webkit-details-marker]:hidden">
                {q}
                <Plus size={20} className="shrink-0 text-terracota transition-transform duration-500 ease-suave group-open:rotate-45" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-tinta-2">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
