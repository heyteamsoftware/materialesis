import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, Users, MessageSquareQuote, Inbox, ArrowUpRight, LogOut } from 'lucide-react'
import { Logo } from '../../components/Brand'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

const StatsContext = createContext({ stats: null, recargar: () => {} })
export const useStats = () => useContext(StatsContext)

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)

  const recargar = useCallback(() => {
    api('admin/stats').then(setStats).catch(() => {})
  }, [])
  useEffect(recargar, [recargar])

  const tabs = [
    { to: '/admin', end: true, label: 'Materiales', icon: BookOpen, n: stats?.materials },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users, n: stats?.users, alerta: stats?.license_requests },
    { to: '/admin/resenas', label: 'Reseñas', icon: MessageSquareQuote, alerta: stats?.pending_reviews },
    { to: '/admin/mensajes', label: 'Mensajes', icon: Inbox, alerta: stats?.unread_messages },
  ]

  return (
    <StatsContext.Provider value={{ stats, recargar }}>
      <div className="min-h-screen">
        <header className="border-b border-lino-2/70 bg-papel/60 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-4">
              <Logo to="/admin" />
              <span className="pastilla hidden bg-tinta text-papel sm:inline-flex">Administración</span>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/app" className="btn btn-claro btn-sm">
                Ver la zona privada <ArrowUpRight size={15} />
              </Link>
              <button
                onClick={async () => {
                  await logout()
                  navigate('/')
                }}
                className="rounded-full p-2.5 text-tinta-2 transition hover:bg-lino hover:text-tinta"
                aria-label="Cerrar sesión"
                title={`Cerrar sesión (${user.username})`}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-5 sm:px-8" aria-label="Secciones de administración">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `relative flex shrink-0 items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors duration-300 ${
                    isActive ? 'text-tinta after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-t-full after:bg-terracota' : 'text-tinta-3 hover:text-tinta'
                  }`
                }
              >
                <t.icon size={16} /> {t.label}
                {t.n != null && <span className="text-xs font-normal text-tinta-3">{t.n}</span>}
                {t.alerta > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-terracota px-1.5 text-[0.68rem] text-white">{t.alerta}</span>}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <Outlet />
        </main>
      </div>
    </StatsContext.Provider>
  )
}

export function Cabecera({ titulo, texto, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{titulo}</h1>
        {texto && <p className="mt-2 max-w-2xl text-tinta-2">{texto}</p>}
      </div>
      {children}
    </div>
  )
}
