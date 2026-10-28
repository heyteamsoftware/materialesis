import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../lib/auth'
import { Campo, Aviso, AceptaPrivacidad } from '../components/ui'
import { Logo, Glifo } from '../components/Brand'
import { SECTIONS } from '../lib/sections'

function safeNext(next, fallback) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback
}

function Marco({ titulo, subtitulo, children, pie }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      {/* Panel decorativo */}
      <aside className="relative hidden overflow-hidden bg-tinta p-12 text-papel lg:flex lg:flex-col lg:justify-between">
        <Logo claro />
        <div className="relative z-10 max-w-md">
          <p className="font-serif text-4xl leading-tight">
            «Un buen material no sustituye al vínculo, pero <em className="text-mostaza">libera tiempo</em> para cuidarlo.»
          </p>
        </div>
        <div className="relative z-10 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <span key={s.slug} className="flex items-center gap-2 rounded-full border border-papel/15 px-3 py-1.5 text-xs text-papel/80">
              <Glifo slug={s.slug} size={16} color="#f6e9c9" /> {s.name}
            </span>
          ))}
        </div>
        <svg viewBox="0 0 200 200" className="absolute -right-24 top-1/4 w-[28rem] opacity-[0.12]" aria-hidden="true">
          <path fill="#c2643f" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
        </svg>
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="animate-aparece text-4xl leading-tight sm:text-[2.7rem]">{titulo}</h1>
          <p className="mt-3 animate-aparece text-tinta-2 [animation-delay:80ms]">{subtitulo}</p>
          <div className="mt-9 animate-aparece [animation-delay:140ms]">{children}</div>
          <p className="mt-8 text-sm text-tinta-2">{pie}</p>
        </div>
      </main>
    </div>
  )
}

function CampoClave(props) {
  const [ver, setVer] = useState(false)
  return (
    <div className="relative">
      <Campo type={ver ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        className="absolute right-3 top-[2.2rem] rounded-full p-1.5 text-tinta-3 transition hover:bg-lino hover:text-tinta"
        aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {ver ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const user = await login(form.username, form.password)
      const next = safeNext(params.get('next'), '')
      // La cuenta de administración entra siempre al panel (salvo que viniera de otra página del panel)
      const destino = user.role === 'admin' ? (next.startsWith('/admin') ? next : '/admin') : next || '/app'
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
      setEnviando(false)
    }
  }

  return (
    <Marco
      titulo="Hola de nuevo."
      subtitulo="Entra para seguir trabajando con tus materiales."
      pie={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to={`/registro${params.get('next') ? `?next=${encodeURIComponent(params.get('next'))}` : ''}`} className="enlace font-semibold text-terracota-700">
            Crea una gratis
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        {error && <Aviso>{error}</Aviso>}
        <Campo label="Nombre de usuario" name="username" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <CampoClave label="Contraseña" name="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primario mt-2 w-full" disabled={enviando || !form.username || !form.password}>
          {enviando ? 'Entrando…' : 'Entrar'} <ArrowRight size={18} />
        </button>
      </form>
    </Marco>
  )
}

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', accept_privacy: false })
  const [error, setError] = useState({ msg: '', field: '' })
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setEnviando(true)
    setError({ msg: '', field: '' })
    try {
      await register(form)
      navigate(safeNext(params.get('next'), '/app'), { replace: true })
    } catch (err) {
      setError({ msg: err.message, field: err.field })
      setEnviando(false)
    }
  }
  const fe = (f) => (error.field === f ? error.msg : '')

  return (
    <Marco
      titulo="Crea tu cuenta."
      subtitulo="Gratis y en un minuto. Tendrás abiertas dos demos en cada una de las siete áreas."
      pie={
        <>
          ¿Ya tienes cuenta?{' '}
          <Link to="/entrar" className="enlace font-semibold text-terracota-700">
            Entra aquí
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-5" noValidate>
        {error.msg && (!error.field || error.field === 'accept_privacy') && <Aviso>{error.msg}</Aviso>}
        <Campo label="Nombre y apellidos" name="name" autoComplete="name" value={form.name} onChange={set('name')} error={fe('name')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo label="Nombre de usuario" name="username" autoComplete="username" value={form.username} onChange={set('username')} error={fe('username')} hint="Letras, números, punto o guion" />
          <Campo label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={fe('email')} />
        </div>
        <CampoClave label="Contraseña" name="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={fe('password')} hint="Mínimo 8 caracteres" />
        <AceptaPrivacidad checked={form.accept_privacy} onChange={(v) => setForm({ ...form, accept_privacy: v })} />
        <button className="btn btn-calido mt-2 w-full" disabled={enviando || !form.accept_privacy}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta gratis'} <ArrowRight size={18} />
        </button>
      </form>
    </Marco>
  )
}
