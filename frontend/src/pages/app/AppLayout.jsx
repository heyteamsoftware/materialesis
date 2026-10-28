import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogOut, Menu, X, ShieldCheck, Lock, Settings2, Clock } from 'lucide-react'
import { Logo, Glifo } from '../../components/Brand'
import { useAuth } from '../../lib/auth'
import { SECTIONS } from '../../lib/sections'
import { formatDate } from '../../components/ui'

function EstadoLicencia({ user }) {
  const { licensePending, payUrl } = useAuth()
  if (user.license_active) {
    return (
      <div className="rounded-2xl bg-salvia-100 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-salvia-700">
          <ShieldCheck size={16} /> {user.role === 'admin' ? 'Acceso completo' : 'Licencia activa'}
        </p>
        {user.role !== 'admin' && <p className="mt-1 text-xs text-salvia-700/80">Hasta el {formatDate(user.license_until)}</p>}
      </div>
    )
  }
  if (licensePending) {
    return (
      <div className="rounded-2xl bg-mostaza-100 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-mostaza-700">
          <Clock size={16} /> Licencia solicitada
        </p>
        <p className="mt-1 text-xs text-mostaza-700/80">Pendiente de confirmar el pago</p>
      </div>
    )
  }
  return (
    <Link to={payUrl} className="group block rounded-2xl bg-tinta p-4 text-papel transition-all duration-500 hover:-translate-y-0.5 hover:shadow-flota">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lock size={15} className="text-mostaza" /> Modo demo
      </p>
      <p className="mt-1 text-xs text-papel/70">
        Desbloquea toda la biblioteca <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
      </p>
    </Link>
  )
}

function Navegacion({ user, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pb-6 pt-7">
        <Logo to="/app" />
      </div>
      <nav className="scroll-fino flex-1 overflow-y-auto px-3" aria-label="Áreas">
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `mb-4 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.93rem] font-medium transition-colors duration-300 ${
              isActive ? 'bg-papel text-tinta shadow-suave' : 'text-tinta-2 hover:bg-papel/60 hover:text-tinta'
            }`
          }
        >
          <Home size={18} /> Mi espacio
        </NavLink>
        <p className="etiqueta px-3 pb-2 text-tinta-3">Áreas</p>
        <ul className="grid gap-0.5">
          {SECTIONS.map((s, i) => (
            <li key={s.slug}>
              <NavLink
                to={`/app/${s.slug}`}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.93rem] transition-all duration-300 ${
                    isActive ? 'bg-papel font-semibold text-tinta shadow-suave' : 'text-tinta-2 hover:bg-papel/60 hover:text-tinta'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all duration-500"
                      style={{ background: s.color, opacity: isActive ? 1 : 0 }}
                    />
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-suave group-hover:scale-110"
                      style={{ background: s.tint }}
                    >
                      <Glifo slug={s.slug} size={18} color={s.color} />
                    </span>
                    <span className="flex-1">{s.name}</span>
                    <span className="font-serif text-xs text-tinta-3 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-3 border-t border-lino-2/70 p-4">
        <EstadoLicencia user={user} />
        <div className="flex items-center gap-3 px-1">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terracota-100 font-serif text-sm font-semibold text-terracota-700">
            {user.name.trim().charAt(0).toUpperCase()}
          </span>
          <Link to="/app/cuenta" className="group min-w-0 flex-1 rounded-xl" title="Mi cuenta">
            <span className="block truncate text-sm font-semibold transition-colors group-hover:text-terracota-700">{user.name}</span>
            <span className="block truncate text-xs text-tinta-3">@{user.username} · Mi cuenta</span>
          </Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="rounded-full p-2 text-tinta-2 transition hover:bg-lino hover:text-tinta" title="Administración" aria-label="Administración">
              <Settings2 size={17} />
            </Link>
          )}
          <button onClick={onLogout} className="rounded-full p-2 text-tinta-2 transition hover:bg-lino hover:text-tinta" title="Cerrar sesión" aria-label="Cerrar sesión">
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    setAbierto(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  const onLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17.5rem_1fr]">
      {/* Lateral escritorio */}
      <aside className="sticky top-0 hidden h-screen border-r border-lino-2/60 bg-arena lg:block">
        <Navegacion user={user} onLogout={onLogout} />
      </aside>

      {/* Barra superior móvil */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-lino-2/60 bg-arena/90 px-5 py-3 backdrop-blur-md lg:hidden">
        <Logo to="/app" compacto />
        <button onClick={() => setAbierto(true)} className="rounded-full p-2 hover:bg-lino" aria-label="Abrir menú">
          <Menu size={22} />
        </button>
      </div>
      <div className={`fixed inset-0 z-[60] lg:hidden ${abierto ? '' : 'pointer-events-none'}`}>
        <div onClick={() => setAbierto(false)} className={`absolute inset-0 bg-tinta/30 transition-opacity duration-500 ${abierto ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute inset-y-0 left-0 w-[85%] max-w-xs bg-arena shadow-flota transition-transform duration-500 ease-suave ${abierto ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={() => setAbierto(false)} className="absolute right-3 top-6 rounded-full p-2 hover:bg-lino" aria-label="Cerrar menú">
            <X size={20} />
          </button>
          <Navegacion user={user} onLogout={onLogout} />
        </aside>
      </div>

      <main className="min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
