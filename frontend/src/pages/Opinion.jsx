import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Quote, Send, Clock } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { SECTIONS, sectionBySlug } from '../lib/sections'
import { Campo, Aviso, Estrellas, Revela, Cargando, formatDate, AceptaPrivacidad } from '../components/ui'

// Ritmo de color del muro: variedad sin perder armonía
const TONOS = [
  'bg-papel',
  'bg-terracota-100/80',
  'bg-papel',
  'bg-salvia-100',
  'bg-mostaza-100/80',
  'bg-papel',
  'bg-noche-100/70',
]

export default function Opinion() {
  const { user } = useAuth()
  const [datos, setDatos] = useState(null)

  const cargar = useCallback(() => {
    api('reviews')
      .then(setDatos)
      .catch(() => setDatos({ reviews: [], count: 0, average: null, mine: [] }))
  }, [])
  useEffect(cargar, [cargar, user])

  return (
    <div className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 sm:pt-14">
      <header className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div className="animate-aparece">
          <p className="etiqueta text-terracota-700">Tu opinión</p>
          <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
            Un muro hecho de <em className="text-terracota">experiencias</em>.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-tinta-2">
            Opiniones de profesionales y estudiantes que usan los materiales. Cada aportación se revisa antes de publicarse.
          </p>
        </div>
        {datos?.count > 0 && (
          <div className="flex items-center gap-5 justify-self-start rounded-[1.6rem] bg-papel px-7 py-5 shadow-suave lg:justify-self-end">
            <span className="font-serif text-5xl">{datos.average?.toLocaleString('es-ES')}</span>
            <span>
              <Estrellas valor={Math.round(datos.average)} />
              <span className="mt-1 block text-sm text-tinta-3">
                {datos.count} opinión{datos.count === 1 ? '' : 'es'} publicada{datos.count === 1 ? '' : 's'}
              </span>
            </span>
          </div>
        )}
      </header>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
        {/* Muro en masonry */}
        <section aria-label="Opiniones publicadas">
          {!datos ? (
            <Cargando />
          ) : datos.reviews.length === 0 ? (
            <div className="rounded-[1.6rem] border border-dashed border-lino-2 p-10 text-center">
              <p className="font-serif text-2xl">Todavía no hay opiniones publicadas.</p>
              <p className="mt-2 text-tinta-2">La tuya puede ser la primera.</p>
            </div>
          ) : (
            <div className="muro columns-1 sm:columns-2 xl:columns-3">
              {datos.reviews.map((r, i) => {
                const sec = r.section ? sectionBySlug(r.section) : null
                const destacada = r.body.length < 140 && r.rating === 5
                return (
                  <Revela key={r.id} delay={(i % 6) * 70}>
                    <figure
                      className={`${TONOS[i % TONOS.length]} group rounded-[1.5rem] p-6 shadow-suave transition-all duration-500 ease-suave hover:-translate-y-1 hover:rotate-[-0.4deg] hover:shadow-flota`}
                    >
                      <div className="flex items-center justify-between">
                        <Estrellas valor={r.rating} size={15} />
                        <Quote size={22} className="text-tinta/15 transition-colors duration-500 group-hover:text-terracota/50" />
                      </div>
                      <blockquote className={`mt-4 font-serif leading-relaxed ${destacada ? 'text-2xl' : 'text-[1.08rem]'}`}>{r.body}</blockquote>
                      <figcaption className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-tinta/10 pt-4">
                        <span>
                          <span className="block text-sm font-semibold">{r.author_name}</span>
                          {r.author_role && <span className="block text-xs text-tinta-3">{r.author_role}</span>}
                        </span>
                        {sec && (
                          <span className="pastilla" style={{ background: sec.tint, color: sec.color }}>
                            {sec.name}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  </Revela>
                )
              })}
            </div>
          )}
        </section>

        {/* Formulario */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          {user ? <FormOpinion user={user} mias={datos?.mine || []} onEnviada={cargar} /> : <InvitaAEntrar />}
        </aside>
      </div>
    </div>
  )
}

function InvitaAEntrar() {
  return (
    <div className="rounded-[1.6rem] bg-tinta p-7 text-papel shadow-flota">
      <p className="etiqueta text-mostaza">Comparte tu experiencia</p>
      <p className="mt-3 font-serif text-2xl leading-snug">¿Has usado algún material? Nos ayuda mucho saber qué te funciona.</p>
      <p className="mt-3 text-sm text-papel/70">Para opinar necesitas una cuenta (es gratis).</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to="/entrar?next=/opinion" className="btn bg-papel text-tinta hover:bg-white">
          Entrar
        </Link>
        <Link to="/registro?next=/opinion" className="btn border border-papel/30 text-papel hover:bg-papel/10">
          Crear cuenta
        </Link>
      </div>
    </div>
  )
}

function FormOpinion({ user, mias, onEnviada }) {
  const vacio = { rating: 0, body: '', author_name: user.name, author_role: '', section: '', accept_privacy: false }
  const [form, setForm] = useState(vacio)
  const [estado, setEstado] = useState({ enviando: false, error: '', ok: '' })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setEstado({ enviando: true, error: '', ok: '' })
    try {
      const r = await api('reviews', { method: 'POST', body: form })
      setEstado({ enviando: false, error: '', ok: r.message })
      setForm(vacio)
      onEnviada()
    } catch (err) {
      setEstado({ enviando: false, error: err.message, ok: '' })
    }
  }

  return (
    <div className="hoja p-6 sm:p-7">
      <h2 className="text-2xl">Deja tu opinión</h2>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        {estado.error && <Aviso>{estado.error}</Aviso>}
        {estado.ok && <Aviso tipo="ok">{estado.ok}</Aviso>}
        <div>
          <span className="campo-label">Tu valoración</span>
          <Estrellas valor={form.rating} onChange={(rating) => setForm({ ...form, rating })} size={26} />
        </div>
        <Campo as="textarea" rows={4} label="¿Qué te ha parecido?" name="body" value={form.body} onChange={set('body')} placeholder="Cuéntanos qué material usaste y cómo te fue…" maxLength={1200} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Campo label="Firmar como" name="author_name" value={form.author_name} onChange={set('author_name')} maxLength={80} />
          <Campo label="Tu perfil (opcional)" name="author_role" value={form.author_role} onChange={set('author_role')} placeholder="Integradora social, Las Palmas" maxLength={120} />
        </div>
        <div>
          <label className="campo-label" htmlFor="f-section">
            Área (opcional)
          </label>
          <select id="f-section" className="campo" value={form.section} onChange={set('section')}>
            <option value="">General</option>
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <AceptaPrivacidad checked={form.accept_privacy} onChange={(v) => setForm({ ...form, accept_privacy: v })} />
        <button className="btn btn-calido mt-1" disabled={estado.enviando || !form.rating || form.body.trim().length < 15 || !form.accept_privacy}>
          <Send size={16} /> {estado.enviando ? 'Enviando…' : 'Enviar a revisión'}
        </button>
      </form>

      {mias.length > 0 && (
        <div className="mt-6 border-t border-lino pt-5">
          <p className="etiqueta text-tinta-3">Tus opiniones</p>
          <ul className="mt-3 grid gap-2">
            {mias.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-tinta-2">{m.body}</span>
                <span
                  className={`pastilla shrink-0 ${
                    m.status === 'approved' ? 'bg-salvia-100 text-salvia-700' : m.status === 'hidden' ? 'bg-lino text-tinta-3' : 'bg-mostaza-100 text-mostaza-700'
                  }`}
                >
                  {m.status === 'pending' && <Clock size={12} />}
                  {m.status === 'approved' ? 'Publicada' : m.status === 'hidden' ? 'No publicada' : 'En revisión'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-tinta-3">Última: {formatDate(mias[0].created_at)}</p>
        </div>
      )}
    </div>
  )
}
