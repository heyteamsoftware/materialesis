import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Logo, Isotipo } from './Brand'
import { useAuth } from '../lib/auth'
import { SECTIONS } from '../lib/sections'

const NAV = [
  { to: '/#areas', label: 'Áreas' },
  { to: '/opinion', label: 'Tu opinión' },
  { to: '/licencia', label: 'Licencia' },
  { to: '/contacto', label: 'Contacto' },
]

export function SiteHeader() {
  const { user } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setAbierto(false), [location.pathname, location.hash])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-suave ${
        scrolled ? 'bg-arena/85 shadow-[0_1px_0_rgb(30_42_54/0.06)] backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-[0.93rem] font-medium text-tinta-2 lg:flex" aria-label="Principal">
          {NAV.map((item) =>
            item.to.includes('#') ? (
              <Link key={item.to} to={item.to} className="enlace hover:text-tinta">
                {item.label}
              </Link>
            ) : (
              <NavLink key={item.to} to={item.to} className="enlace hover:text-tinta aria-[current=page]:text-tinta">
                {item.label}
              </NavLink>
            ),
          )}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-texto btn-sm text-tinta-2 hover:text-tinta">
                  Administración
                </Link>
              )}
              <Link to="/app" className="btn btn-primario btn-sm">
                Mi espacio <ArrowUpRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/entrar" className="btn btn-texto btn-sm enlace">
                Entrar
              </Link>
              <Link to="/registro" className="btn btn-primario btn-sm">
                Crear cuenta gratis
              </Link>
            </>
          )}
        </div>
        <button className="rounded-full p-2 transition hover:bg-lino lg:hidden" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto} aria-label="Menú">
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú móvil */}
      <div className={`overflow-hidden transition-[max-height] duration-500 ease-suave lg:hidden ${abierto ? 'max-h-[480px]' : 'max-h-0'}`}>
        <nav className="mx-5 mb-4 flex flex-col gap-1 rounded-3xl bg-papel p-3 shadow-suave" aria-label="Principal móvil">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="rounded-2xl px-4 py-3 font-medium hover:bg-arena">
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            {user ? (
              <Link to="/app" className="btn btn-primario col-span-2">
                Mi espacio
              </Link>
            ) : (
              <>
                <Link to="/entrar" className="btn btn-claro">
                  Entrar
                </Link>
                <Link to="/registro" className="btn btn-primario">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-tinta text-papel/80">
      <div className="pointer-events-none absolute -right-24 -top-24 opacity-[0.07]">
        <Isotipo size={420} />
      </div>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo claro />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-papel/65">
            Recursos físicos y digitales para quienes acompañan a otras personas: integración social, trabajo social y educación.
          </p>
        </div>
        <div>
          <p className="etiqueta text-mostaza">Áreas</p>
          <ul className="mt-4 grid gap-2 text-sm">
            {SECTIONS.map((s) => (
              <li key={s.slug}>
                <Link to={`/app/${s.slug}`} className="enlace hover:text-papel">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="etiqueta text-mostaza">Comunidad</p>
          <ul className="mt-4 grid gap-2 text-sm">
            <li><Link to="/opinion" className="enlace hover:text-papel">Tu opinión</Link></li>
            <li><Link to="/licencia" className="enlace hover:text-papel">Licencia anual</Link></li>
            <li><Link to="/contacto" className="enlace hover:text-papel">Contacto</Link></li>
            <li><Link to="/entrar" className="enlace hover:text-papel">Acceder</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-papel/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-xs text-papel/45 sm:px-8">
          © {new Date().getFullYear()} Materiales de Apoyo a la Intervención Social · CIFP Tony Gallardo
        </p>
      </div>
    </footer>
  )
}

export function PublicLayout() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-tinta focus:px-4 focus:py-2 focus:text-papel">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
