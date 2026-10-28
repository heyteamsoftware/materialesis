import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, Eye, MousePointerClick, Download, Quote } from 'lucide-react'
import { ArteHero } from '../components/OrganicArt'
import { Glifo } from '../components/Brand'
import { Revela, Estrellas } from '../components/ui'
import { SECTIONS } from '../lib/sections'
import { useAuth } from '../lib/auth'
import { api } from '../lib/api'

export default function Landing() {
  const { user, license } = useAuth()
  const [opiniones, setOpiniones] = useState([])

  useEffect(() => {
    api('reviews')
      .then((d) => setOpiniones(d.reviews.slice(0, 3)))
      .catch(() => {})
  }, [])

  const destino = (slug) => (user ? `/app/${slug}` : `/registro?next=/app/${slug}`)

  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-6 sm:px-8 md:pt-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-6">
        <div className="animate-aparece">
          <p className="etiqueta text-terracota-700">
            <span className="h-px w-8 bg-terracota" />
            Para integración social, trabajo social y educación
          </p>
          <h1 className="mt-6 text-[2.75rem] leading-[1.02] font-medium sm:text-6xl lg:text-[4.6rem]">
            Materiales que <em className="font-normal text-terracota">acompañan</em> a quien acompaña.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-tinta-2">
            Una biblioteca de fichas, guías y herramientas interactivas listas para tus sesiones. Menos horas preparando, más horas con las
            personas.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to={user ? '/app' : '/registro'} className="btn btn-calido">
              {user ? 'Ir a mi espacio' : 'Probar las demos gratis'} <ArrowRight size={18} />
            </Link>
            <Link to="/licencia" className="btn btn-texto enlace font-semibold">
              Licencia anual · {license?.price ?? 49} €
            </Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-lino-2/70 pt-6">
            {[
              ['7', 'áreas de trabajo'],
              ['14', 'demos abiertas'],
              ['1', 'licencia para todo'],
            ].map(([n, t]) => (
              <div key={t}>
                <dt className="font-serif text-3xl text-tinta">{n}</dt>
                <dd className="mt-1 text-sm leading-snug text-tinta-3">{t}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ArteHero className="mx-auto w-full max-w-[540px] animate-aparece [animation-delay:150ms] lg:ml-auto" />
      </section>

      {/* ---------- Manifiesto ---------- */}
      <section className="relative bg-papel/70 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-[0.8fr_1.2fr]">
          <Revela>
            <p className="etiqueta text-salvia-700">Por qué existe</p>
          </Revela>
          <Revela delay={100}>
            <p className="font-serif text-2xl leading-snug text-tinta sm:text-[2.1rem] sm:leading-[1.25]">
              Quien trabaja en lo social suele preparar sus materiales de noche, sin recursos y desde cero. Aquí encontrarás{' '}
              <span className="bg-[linear-gradient(transparent_62%,#f6e9c9_62%)]">fichas probadas en el aula y en el servicio</span>, listas
              para imprimir o usar en pantalla.
            </p>
          </Revela>
        </div>
      </section>

      {/* ---------- Índice de áreas ---------- */}
      <section id="areas" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Revela>
              <p className="etiqueta text-terracota-700">El índice</p>
              <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Siete áreas, un mismo propósito.</h2>
              <p className="mt-5 max-w-sm leading-relaxed text-tinta-2">
                En cada área tienes abiertos un material físico y uno digital para probarlos sin compromiso. El resto se desbloquea con la
                licencia anual.
              </p>
            </Revela>
          </div>

          <ol className="border-t border-lino-2">
            {SECTIONS.map((s, i) => (
              <Revela as="li" key={s.slug} delay={i * 60} className="border-b border-lino-2">
                <Link
                  to={destino(s.slug)}
                  className="group relative grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 pr-2 transition-colors duration-500 sm:grid-cols-[4rem_1fr_auto] sm:gap-6"
                >
                  <span
                    className="absolute inset-y-0 left-0 w-0 rounded-r-3xl opacity-60 transition-all duration-700 ease-suave group-hover:w-full"
                    style={{ background: s.tint }}
                  />
                  <span className="relative font-serif text-lg text-tinta-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="relative">
                    <span className="flex items-center gap-3">
                      <span className="text-2xl font-serif text-tinta sm:text-3xl">{s.name}</span>
                    </span>
                    <span className="mt-1 block text-sm text-tinta-2 sm:text-[0.95rem]">{s.blurb}</span>
                  </span>
                  <span className="relative flex items-center gap-3">
                    <Glifo slug={s.slug} size={34} color={s.color} className="transition-transform duration-700 ease-suave group-hover:-rotate-6 group-hover:scale-110" />
                    <ArrowUpRight size={20} className="text-tinta-3 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-tinta" />
                  </span>
                </Link>
              </Revela>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Cómo funciona ---------- */}
      <section className="relative overflow-hidden bg-salvia-100/70 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Revela className="max-w-2xl">
            <p className="etiqueta text-salvia-700">Cómo funciona</p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Pruébalo primero. Decide después.</h2>
          </Revela>
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              {
                icon: Eye,
                t: 'Mira el material físico',
                d: 'En cada área, una ficha completa en el visor web: página a página, tal y como la imprimirías.',
                offset: 'md:mt-0',
              },
              {
                icon: MousePointerClick,
                t: 'Usa la herramienta digital',
                d: 'Ecomapas, simuladores, planificadores… plenamente funcionales en el navegador, sin instalar nada.',
                offset: 'md:mt-14',
              },
              {
                icon: Download,
                t: 'Desbloquea toda la biblioteca',
                d: 'Con la licencia anual se abre todo el material, con descargas editables e imprimibles.',
                offset: 'md:mt-28',
              },
            ].map((paso, i) => (
              <Revela key={paso.t} delay={i * 120} className={paso.offset}>
                <div className="group h-full rounded-[1.6rem] bg-papel p-7 shadow-suave transition-all duration-500 ease-suave hover:-translate-y-1.5 hover:shadow-flota">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-5xl text-salvia/60">{i + 1}</span>
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-arena text-tinta transition-colors duration-500 group-hover:bg-tinta group-hover:text-papel">
                      <paso.icon size={19} />
                    </span>
                  </div>
                  <h3 className="mt-6 text-2xl">{paso.t}</h3>
                  <p className="mt-3 leading-relaxed text-tinta-2">{paso.d}</p>
                </div>
              </Revela>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Opiniones ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Revela>
            <p className="etiqueta text-terracota-700">Tu opinión</p>
            <h2 className="mt-4 max-w-xl text-4xl leading-tight sm:text-5xl">Lo que dicen quienes ya los usan.</h2>
          </Revela>
          <Link to="/opinion" className="btn btn-claro">
            Ver el muro completo <ArrowRight size={17} />
          </Link>
        </div>
        {opiniones.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {opiniones.map((o, i) => (
              <Revela key={o.id} delay={i * 100} className={i === 1 ? 'md:mt-10' : ''}>
                <figure className="hoja h-full p-7">
                  <Quote size={26} className="text-terracota/40" />
                  <blockquote className="mt-4 font-serif text-lg leading-relaxed">{o.body}</blockquote>
                  <figcaption className="mt-6 flex items-center justify-between gap-4 border-t border-lino pt-4">
                    <span>
                      <span className="block text-sm font-semibold">{o.author_name}</span>
                      {o.author_role && <span className="block text-xs text-tinta-3">{o.author_role}</span>}
                    </span>
                    <Estrellas valor={o.rating} size={14} />
                  </figcaption>
                </figure>
              </Revela>
            ))}
          </div>
        ) : (
          <Revela className="mt-12">
            <div className="flex flex-col items-start gap-5 rounded-[1.6rem] border border-dashed border-lino-2 p-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl font-serif text-xl leading-snug">
                El muro está esperando su primera opinión. Prueba las demos y cuéntanos qué te han parecido.
              </p>
              <Link to="/opinion" className="btn btn-primario shrink-0">
                Dejar mi opinión
              </Link>
            </div>
          </Revela>
        )}
      </section>

      {/* ---------- Llamada final ---------- */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <Revela>
          <div className="relative overflow-hidden rounded-[2rem] bg-terracota px-7 py-14 text-white sm:px-14 sm:py-16">
            <svg viewBox="0 0 200 200" className="absolute -bottom-20 -right-16 w-80 opacity-25" aria-hidden="true">
              <path fill="#f6e9c9" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
            </svg>
            <div className="relative grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
              <div>
                <h2 className="text-4xl leading-tight sm:text-5xl">Prepara menos. Acompaña más.</h2>
                <p className="mt-4 max-w-lg text-white/85">
                  Licencia anual de {license?.price ?? 49} € con acceso completo a las siete áreas, descargas incluidas y todas las novedades del
                  curso.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/licencia" className="btn bg-papel text-tinta hover:bg-white">
                  Ver la licencia
                </Link>
                {!user && (
                  <Link to="/registro" className="btn border border-white/50 text-white hover:bg-white/10">
                    Empezar gratis
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Revela>
      </section>
    </>
  )
}
