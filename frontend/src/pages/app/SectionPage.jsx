import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Lock, FileText, MousePointerClick, Download, Eye, Sparkles, Clock, Users } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { sectionBySlug, sectionNumber, KIND_LABEL } from '../../lib/sections'
import { Glifo } from '../../components/Brand'
import { Mancha } from '../../components/OrganicArt'
import { Cargando, Revela, Aviso } from '../../components/ui'
import PageViewer from '../../components/PageViewer'

export default function SectionPage() {
  const { section: slug } = useParams()
  const sec = sectionBySlug(slug)
  const { user, license, licensePending, payUrl } = useAuth()
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sec) return
    setDatos(null)
    setError('')
    api(`materials?section=${slug}`)
      .then(setDatos)
      .catch((e) => setError(e.message))
  }, [slug, sec])

  if (!sec) return <Navigate to="/app" replace />

  const materiales = datos?.materials || []
  const demoFisico = materiales.find((m) => m.access === 'demo' && m.kind === 'fisico')
  const demoDigital = materiales.find((m) => m.access === 'demo' && m.kind === 'digital')
  const resto = materiales.filter((m) => m !== demoFisico && m !== demoDigital)
  const bloqueados = resto.filter((m) => m.locked).length

  return (
    <div className="pb-20">
      {/* Cabecera editorial */}
      <header className="relative overflow-hidden px-5 pb-12 pt-10 sm:px-10 sm:pt-14" style={{ background: `linear-gradient(180deg, ${sec.tint} 0%, transparent 100%)` }}>
        <Mancha color={sec.color} className="pointer-events-none absolute -right-20 -top-24 w-[26rem] opacity-[0.12]" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex animate-aparece items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-papel shadow-suave">
              <Glifo slug={sec.slug} size={30} color={sec.color} />
            </span>
            <span className="font-serif text-6xl leading-none opacity-25 sm:text-7xl" style={{ color: sec.color }}>
              {sectionNumber(sec.slug)}
            </span>
          </div>
          <h1 className="mt-6 animate-aparece text-5xl leading-[1.05] [animation-delay:60ms] sm:text-6xl">{sec.name}</h1>
          <p className="mt-2 animate-aparece font-serif text-xl italic [animation-delay:100ms]" style={{ color: sec.color }}>
            {sec.long}
          </p>
          <p className="mt-4 max-w-xl animate-aparece text-lg text-tinta-2 [animation-delay:140ms]">{sec.blurb}</p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 sm:px-10">
        {error && <Aviso>{error}</Aviso>}
        {!datos && !error && <Cargando />}

        {datos && (
          <>
            {/* Demos */}
            <section aria-labelledby="demos" className="mt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 id="demos" className="text-3xl">
                  {user.license_active ? 'Para empezar' : 'Pruébalo gratis'}
                </h2>
                {!user.license_active && <p className="text-sm text-tinta-3">Abiertos para todas las cuentas</p>}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
                {demoFisico ? (
                  <Revela className="hoja overflow-hidden">
                    <div className="grid gap-0 md:grid-cols-[1fr_1.05fr] lg:grid-cols-1 xl:grid-cols-[1fr_1.05fr]">
                      <div className="p-6 sm:p-7">
                        <span className="pastilla" style={{ background: sec.tint, color: sec.color }}>
                          <FileText size={13} /> {KIND_LABEL.fisico} · Demo
                        </span>
                        <h3 className="mt-4 text-2xl leading-snug">{demoFisico.title}</h3>
                        <p className="mt-2 text-[0.95rem] leading-relaxed text-tinta-2">{demoFisico.summary}</p>
                        <Meta m={demoFisico} />
                        <p className="mt-5 flex items-center gap-2 text-xs text-tinta-3">
                          <Eye size={14} /> {user.license_active ? 'Descarga disponible en la ficha completa' : 'Solo visualización en el visor web'}
                        </p>
                        <Link to={`/app/${slug}/${demoFisico.id}`} className="btn btn-claro btn-sm mt-5">
                          Abrir en grande <ArrowRight size={15} />
                        </Link>
                      </div>
                      <div className="bg-arena/70 p-6 sm:p-7">
                        <PageViewer pages={demoFisico.pages || []} color={sec.color} titulo={demoFisico.title} compacto proteger={!user.license_active} />
                      </div>
                    </div>
                  </Revela>
                ) : (
                  <Vacio texto="Aún no hay material físico de demostración en esta área." />
                )}

                {demoDigital ? (
                  <Revela delay={120}>
                    <Link
                      to={`/app/${slug}/${demoDigital.id}`}
                      className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-organico)] p-7 text-papel shadow-suave transition-all duration-500 ease-suave hover:-translate-y-1.5 hover:shadow-flota"
                      style={{ background: sec.color }}
                    >
                      <Mancha color="#fbf8f2" className="absolute -bottom-20 -right-16 w-64 opacity-10 transition-transform duration-1000 ease-suave group-hover:scale-110 group-hover:rotate-12" />
                      <span className="pastilla relative self-start bg-papel/15 text-papel">
                        <MousePointerClick size={13} /> {KIND_LABEL.digital} · Demo
                      </span>
                      <h3 className="relative mt-5 text-3xl leading-tight">{demoDigital.title}</h3>
                      <p className="relative mt-3 leading-relaxed text-papel/80">{demoDigital.summary}</p>
                      <div className="relative mt-auto flex items-center justify-between pt-10">
                        <span className="text-sm text-papel/70">{[demoDigital.format, demoDigital.duration].filter(Boolean).join(' · ')}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-papel px-5 py-2.5 text-sm font-semibold text-tinta transition-all duration-500 group-hover:gap-3">
                          Abrir herramienta <ArrowRight size={16} />
                        </span>
                      </div>
                    </Link>
                  </Revela>
                ) : (
                  <Vacio texto="Aún no hay herramienta digital de demostración en esta área." />
                )}
              </div>
            </section>

            {/* Biblioteca */}
            <section aria-labelledby="biblioteca" className="mt-20">
              <div className="flex flex-wrap items-end justify-between gap-4 border-b border-lino-2 pb-5">
                <div>
                  <p className="etiqueta" style={{ color: sec.color }}>
                    Biblioteca completa
                  </p>
                  <h2 id="biblioteca" className="mt-2 text-3xl">
                    {resto.length} materiales más en {sec.name}
                  </h2>
                </div>
                {bloqueados > 0 && (
                  <span className="pastilla bg-tinta text-papel">
                    <Lock size={12} /> {bloqueados} bloqueados
                  </span>
                )}
              </div>

              <ul>
                {resto.map((m, i) => (
                  <Revela as="li" key={m.id} delay={i * 50}>
                    <FilaMaterial m={m} sec={sec} />
                  </Revela>
                ))}
              </ul>

              {bloqueados > 0 && (
                <Revela className="mt-10">
                  <div className="relative overflow-hidden rounded-[1.8rem] border border-lino-2 bg-papel p-7 sm:p-9">
                    <div className="absolute inset-y-0 right-0 w-1/3 opacity-60" style={{ background: `radial-gradient(circle at 80% 50%, ${sec.tint}, transparent 70%)` }} />
                    <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_auto]">
                      <div>
                        <p className="etiqueta text-terracota-700">
                          <Sparkles size={14} /> Licencia anual
                        </p>
                        <p className="mt-3 font-serif text-2xl leading-snug sm:text-[1.7rem]">
                          Desbloquea los {bloqueados} materiales restantes de {sec.name} y toda la biblioteca, con descargas incluidas.
                        </p>
                      </div>
                      <Link to={payUrl} className="btn btn-calido justify-self-start md:justify-self-end">
                        {licensePending ? 'Ver estado de mi solicitud' : `Desbloquear por ${license?.price ?? 49} €/año`}
                      </Link>
                    </div>
                  </div>
                </Revela>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function Meta({ m }) {
  const items = [
    m.format && { icon: FileText, t: m.format },
    m.duration && { icon: Clock, t: m.duration },
    m.audience && { icon: Users, t: m.audience },
  ].filter(Boolean)
  if (!items.length) return null
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-tinta-3">
      {items.map((it) => (
        <li key={it.t} className="flex items-center gap-1.5">
          <it.icon size={13} /> {it.t}
        </li>
      ))}
    </ul>
  )
}

function FilaMaterial({ m, sec }) {
  const Icono = m.kind === 'digital' ? MousePointerClick : FileText
  return (
    <Link
      to={`/app/${sec.slug}/${m.id}`}
      className="group relative grid grid-cols-[auto_1fr] items-start gap-x-5 gap-y-3 border-b border-lino-2 py-6 transition-colors duration-500 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-3"
    >
      <span className="absolute inset-0 -z-10 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `${sec.tint}88` }} />
      <span
        className={`relative grid h-12 w-12 place-items-center rounded-2xl transition-transform duration-500 ease-suave group-hover:scale-105 ${m.locked ? 'bg-lino text-tinta-3' : ''}`}
        style={m.locked ? undefined : { background: sec.tint, color: sec.color }}
      >
        <Icono size={20} />
        {m.locked && (
          <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-tinta text-mostaza shadow-suave ring-2 ring-arena">
            <Lock size={11} strokeWidth={2.5} />
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className={`font-serif text-xl leading-snug ${m.locked ? 'text-tinta/80' : ''}`}>{m.title}</span>
          <span className="pastilla bg-arena text-tinta-3">{KIND_LABEL[m.kind]}</span>
        </span>
        <span className={`mt-1 block text-[0.93rem] leading-relaxed ${m.locked ? 'text-tinta-3' : 'text-tinta-2'}`}>{m.summary}</span>
        <Meta m={m} />
      </span>
      <span className="col-start-2 sm:col-start-auto">
        {m.locked ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-lino-2 px-4 py-2 text-sm text-tinta-3 transition-all duration-500 group-hover:border-terracota group-hover:bg-papel group-hover:text-terracota-700">
            <Lock size={14} /> <span>Con licencia</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full bg-papel px-4 py-2 text-sm font-semibold shadow-suave transition-all duration-500 group-hover:gap-3">
            {m.can_download ? <Download size={15} /> : <ArrowRight size={15} />} Abrir
          </span>
        )}
      </span>
    </Link>
  )
}

function Vacio({ texto }) {
  return <div className="grid min-h-[12rem] place-items-center rounded-[1.6rem] border border-dashed border-lino-2 p-6 text-center text-sm text-tinta-3">{texto}</div>
}
