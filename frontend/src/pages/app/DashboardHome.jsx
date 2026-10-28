import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Lock, Sparkles } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { SECTIONS } from '../../lib/sections'
import { Glifo } from '../../components/Brand'
import { Revela } from '../../components/ui'

function saludo() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 14) return 'Buenos días'
  if (h < 21) return 'Buenas tardes'
  return 'Buenas noches'
}

export default function DashboardHome() {
  const { user, license } = useAuth()
  const [conteo, setConteo] = useState({})

  useEffect(() => {
    api('sections')
      .then((d) => setConteo(Object.fromEntries(d.sections.map((s) => [s.slug, s]))))
      .catch(() => {})
  }, [])

  const nombre = user.name.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-14">
      <header className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <div className="animate-aparece">
          <p className="etiqueta text-terracota-700">{saludo()}</p>
          <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">
            Hola, <em className="text-terracota">{nombre}</em>.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-tinta-2">¿Con qué vas a trabajar hoy? Elige un área para ver sus materiales.</p>
        </div>

        {!user.license_active && (
          <Link
            to="/licencia"
            className="group relative animate-aparece overflow-hidden rounded-[1.6rem] bg-tinta p-6 text-papel shadow-flota transition-transform duration-500 ease-suave [animation-delay:120ms] hover:-translate-y-1"
          >
            <svg viewBox="0 0 200 200" className="absolute -right-10 -top-12 w-44 opacity-25 transition-transform duration-700 group-hover:rotate-12" aria-hidden="true">
              <path fill="#d9a441" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
            </svg>
            <p className="etiqueta relative text-mostaza">
              <Sparkles size={14} /> Estás en modo demo
            </p>
            <p className="relative mt-2 font-serif text-xl leading-snug">
              {user.license_requested_at
                ? 'Tu solicitud de licencia está en revisión. En cuanto se confirme el pago, todo se desbloquea.'
                : `Tienes 2 materiales abiertos por área. Desbloquea la biblioteca completa por ${license?.price ?? 49} € al año.`}
            </p>
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mostaza">
              Ver la licencia <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </Link>
        )}
      </header>

      {/* Áreas en composición asimétrica */}
      <section className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6" aria-label="Áreas de trabajo">
        {SECTIONS.map((s, i) => {
          const c = conteo[s.slug]
          const abiertos = c ? (user.license_active ? c.total : c.demos) : null
          // Ritmo: dos piezas anchas, luego tres, luego dos
          const span = i < 2 ? 'lg:col-span-3' : i < 5 ? 'lg:col-span-2' : 'lg:col-span-3'
          return (
            <Revela key={s.slug} delay={i * 70} className={span}>
              <Link
                to={`/app/${s.slug}`}
                className="group relative flex h-full min-h-[13rem] flex-col justify-between overflow-hidden rounded-[1.6rem] p-6 transition-all duration-500 ease-suave hover:-translate-y-1.5 hover:shadow-flota"
                style={{ background: s.tint }}
              >
                <svg
                  viewBox="0 0 200 200"
                  className="absolute -bottom-16 -right-12 w-48 opacity-20 transition-all duration-700 ease-suave group-hover:-bottom-10 group-hover:opacity-30"
                  aria-hidden="true"
                >
                  <path fill={s.color} d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
                </svg>
                <div className="relative flex items-start justify-between">
                  <span className="font-serif text-sm tabular-nums" style={{ color: s.color }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <Glifo slug={s.slug} size={36} color={s.color} className="transition-transform duration-700 ease-suave group-hover:-rotate-12 group-hover:scale-110" />
                </div>
                <div className="relative">
                  <h2 className="text-3xl">{s.name}</h2>
                  <p className="mt-1.5 max-w-sm text-sm text-tinta-2">{s.blurb}</p>
                  {c && (
                    <p className="mt-4 flex items-center gap-2 text-xs font-semibold" style={{ color: s.color }}>
                      {abiertos < c.total && <Lock size={13} />}
                      {abiertos} de {c.total} materiales disponibles
                    </p>
                  )}
                </div>
              </Link>
            </Revela>
          )
        })}
      </section>
    </div>
  )
}
