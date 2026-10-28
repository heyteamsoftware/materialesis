import { Suspense, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Lock, Eye, FileText, Clock, Users, Sparkles } from 'lucide-react'
import { api, fileUrl } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { sectionBySlug, KIND_LABEL } from '../../lib/sections'
import { Cargando, Aviso } from '../../components/ui'
import PageViewer from '../../components/PageViewer'
import { HERRAMIENTAS } from '../../components/interactive'

export default function MaterialPage() {
  const { section: slug, id } = useParams()
  const { user, license } = useAuth()
  const [m, setM] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setM(null)
    setError('')
    api(`materials/${id}`)
      .then((d) => setM(d.material))
      .catch((e) => setError(e.message))
  }, [id])

  const sec = sectionBySlug(m?.section || slug)

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 sm:py-10">
      <Link to={`/app/${sec?.slug || ''}`} className="group inline-flex items-center gap-2 text-sm font-medium text-tinta-2 hover:text-tinta">
        <ArrowLeft size={16} className="transition-transform duration-500 group-hover:-translate-x-1" /> Volver a {sec?.name || 'mi espacio'}
      </Link>

      {error && (
        <div className="mt-8">
          <Aviso>{error}</Aviso>
        </div>
      )}
      {!m && !error && <Cargando />}

      {m && (
        <>
          <header className="mt-6 grid animate-aparece gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="pastilla" style={{ background: sec.tint, color: sec.color }}>
                  {sec.name}
                </span>
                <span className="pastilla bg-papel text-tinta-2">{KIND_LABEL[m.kind]}</span>
                {m.access === 'demo' && <span className="pastilla bg-mostaza-100 text-mostaza-700">Demo</span>}
              </div>
              <h1 className="mt-4 text-4xl leading-[1.08] sm:text-5xl">{m.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-tinta-2">{m.summary}</p>
            </div>
            <dl className="grid gap-2 text-sm text-tinta-2 lg:justify-self-end">
              {m.format && <Dato icon={FileText} t={m.format} />}
              {m.duration && <Dato icon={Clock} t={m.duration} />}
              {m.audience && <Dato icon={Users} t={m.audience} />}
            </dl>
          </header>

          <div className="mt-10">{m.locked ? <Bloqueado m={m} sec={sec} user={user} precio={license?.price ?? 49} /> : <Contenido m={m} sec={sec} user={user} />}</div>
        </>
      )}
    </div>
  )
}

function Dato({ icon: Icon, t }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={15} className="text-tinta-3" /> {t}
    </div>
  )
}

function BotonDescarga({ m }) {
  if (!m.can_download) return null
  return (
    <a href={fileUrl(`api/materials/${m.id}/download`)} className="btn btn-primario" download>
      <Download size={17} /> Descargar {m.file_name ? <span className="max-w-[12rem] truncate font-normal opacity-70">{m.file_name}</span> : ''}
    </a>
  )
}

function Contenido({ m, sec, user }) {
  const Herramienta = m.interactive_key ? HERRAMIENTAS[m.interactive_key] : null
  const soloVer = !user.license_active

  return (
    <div className="grid gap-6">
      {(m.can_download || (soloVer && m.kind === 'fisico')) && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.4rem] bg-papel px-5 py-4 shadow-suave">
          {soloVer ? (
            <>
              <p className="flex items-center gap-2 text-sm text-tinta-2">
                <Eye size={16} className="text-tinta-3" /> Material de demostración: puedes verlo completo en el visor. La descarga se activa con la licencia anual.
              </p>
              <Link to="/licencia" className="btn btn-claro btn-sm">
                <Lock size={14} /> Ver licencia
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-tinta-2">Licencia activa: tienes este material disponible para descargar.</p>
              <BotonDescarga m={m} />
            </>
          )}
        </div>
      )}

      {Herramienta ? (
        <section className="hoja p-5 sm:p-8" aria-label="Herramienta interactiva">
          <Suspense fallback={<Cargando texto="Preparando la herramienta…" />}>
            <Herramienta color={sec.color} tint={sec.tint} />
          </Suspense>
        </section>
      ) : m.embed_url ? (
        <section className="hoja overflow-hidden">
          <iframe
            src={m.embed_url}
            title={m.title}
            className="h-[75vh] w-full"
            allow="fullscreen; autoplay"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            loading="lazy"
          />
        </section>
      ) : null}

      {m.pages?.length > 0 && (
        <section className="rounded-[1.8rem] bg-arena/60 px-4 py-10 sm:px-10" style={{ background: `linear-gradient(180deg, ${sec.tint}88, transparent)` }}>
          <PageViewer pages={m.pages} color={sec.color} titulo={m.title} proteger={soloVer} />
        </section>
      )}

      {!Herramienta && !m.embed_url && !m.pages?.length && !m.can_download && (
        <p className="rounded-2xl bg-papel p-6 text-tinta-2">Este material se está preparando. Muy pronto estará disponible.</p>
      )}
    </div>
  )
}

function Bloqueado({ m, sec, user, precio }) {
  return (
    <div className="relative grid overflow-hidden rounded-[2rem] bg-papel shadow-suave md:grid-cols-[1fr_1.1fr]">
      {/* Vista previa difuminada */}
      <div className="relative hidden min-h-[26rem] overflow-hidden md:block" style={{ background: sec.tint }} aria-hidden="true">
        <div className="absolute left-1/2 top-12 w-[62%] -translate-x-1/2 rotate-[-4deg] blur-[3px]">
          <div className="folio p-[8%]">
            <div className="h-3 w-2/3 rounded-full" style={{ background: sec.color, opacity: 0.6 }} />
            <div className="mt-4 grid gap-2.5">
              {[90, 76, 84, 60, 88, 70, 80].map((w, i) => (
                <div key={i} className="h-2 rounded-full bg-lino" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-tinta text-mostaza shadow-flota">
            <Lock size={30} />
          </span>
        </div>
      </div>
      <div className="p-8 sm:p-12">
        <p className="etiqueta text-terracota-700">
          <Sparkles size={14} /> Incluido en la licencia anual
        </p>
        <h2 className="mt-4 text-3xl leading-tight">Este material forma parte de la biblioteca completa.</h2>
        <p className="mt-4 leading-relaxed text-tinta-2">
          Con la licencia podrás verlo completo, usarlo de forma interactiva y descargarlo
          {m.kind === 'fisico' ? ' para imprimirlo o editarlo' : ''}. También se desbloquea el resto de materiales de las siete áreas.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/licencia" className="btn btn-calido">
            {user.license_requested_at ? 'Ver estado de mi solicitud' : `Desbloquear por ${precio} €/año`}
          </Link>
          <Link to={`/app/${sec.slug}`} className="btn btn-claro">
            Seguir con las demos
          </Link>
        </div>
      </div>
    </div>
  )
}
