import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Star, X, CheckCircle2, AlertCircle } from 'lucide-react'

/* ---------- Carga ---------- */
export function Cargando({ pantalla = false, texto = 'Cargando…' }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-tinta-2 ${pantalla ? 'min-h-[60vh]' : 'py-16'}`} role="status">
      <span className="relative flex h-5 w-5">
        <span className="absolute inset-0 rounded-full border-2 border-lino-2" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-terracota" />
      </span>
      <span className="text-sm">{texto}</span>
    </div>
  )
}

/* ---------- Campo de formulario ---------- */
export function Campo({ label, error, hint, as = 'input', className = '', id, ...props }) {
  const Tag = as
  const fieldId = id || `f-${props.name}`
  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="campo-label">
          {label}
        </label>
      )}
      <Tag id={fieldId} className="campo" aria-invalid={error ? 'true' : undefined} {...props} />
      {error ? (
        <p className="mt-1.5 text-sm text-[#a33d22]">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-tinta-3">{hint}</p>
      ) : null}
    </div>
  )
}

/* ---------- Aviso en línea ---------- */
export function Aviso({ tipo = 'error', children }) {
  const estilos =
    tipo === 'error'
      ? 'bg-terracota-100/70 text-terracota-700 border-terracota/20'
      : 'bg-salvia-100 text-salvia-700 border-salvia/30'
  const Icono = tipo === 'error' ? AlertCircle : CheckCircle2
  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${estilos}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={18} className="mt-px shrink-0" />
      <div>{children}</div>
    </div>
  )
}

/* ---------- Estrellas ---------- */
export function Estrellas({ valor, onChange, size = 18 }) {
  const [hover, setHover] = useState(0)
  const activo = hover || valor
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)} role={onChange ? 'radiogroup' : undefined} aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = (
          <Star
            size={size}
            strokeWidth={1.6}
            className={`transition-all duration-300 ${n <= activo ? 'fill-mostaza text-mostaza' : 'text-lino-2'} ${onChange && n <= hover ? 'scale-110' : ''}`}
          />
        )
        return onChange ? (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={valor === n}
            aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className="rounded-md p-0.5"
          >
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        )
      })}
    </div>
  )
}

/* ---------- Aparición al hacer scroll ---------- */
export function Revela({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          obs.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`revela ${className}`} style={{ transitionDelay: `${delay}ms` }} {...props}>
      {children}
    </Tag>
  )
}

/* ---------- Notificaciones ---------- */
const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((texto, tipo = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, texto, tipo }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200)
  }, [])
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex max-w-md animate-aparece items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-flota ${
              t.tipo === 'error' ? 'bg-terracota-700 text-white' : 'bg-tinta text-papel'
            }`}
          >
            {t.tipo === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} className="text-mostaza" />}
            {t.texto}
            <button onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} aria-label="Cerrar" className="opacity-60 hover:opacity-100">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

/* ---------- Panel lateral (drawer) ---------- */
export function Panel({ abierto, onCerrar, titulo, children, ancho = 'max-w-2xl' }) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  return (
    <div className={`fixed inset-0 z-[70] ${abierto ? '' : 'pointer-events-none'}`} aria-hidden={!abierto}>
      <div
        onClick={onCerrar}
        className={`absolute inset-0 bg-tinta/30 backdrop-blur-[2px] transition-opacity duration-500 ${abierto ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`absolute inset-y-0 right-0 flex w-full ${ancho} flex-col bg-arena shadow-flota transition-transform duration-500 ease-suave ${
          abierto ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between border-b border-lino px-6 py-5">
          <h2 className="text-2xl">{titulo}</h2>
          <button onClick={onCerrar} className="rounded-full p-2 transition hover:bg-lino" aria-label="Cerrar">
            <X size={20} />
          </button>
        </header>
        <div className="scroll-fino flex-1 overflow-y-auto px-6 py-6">{abierto && children}</div>
      </aside>
    </div>
  )
}

export const formatDate = (iso, opts = { day: 'numeric', month: 'long', year: 'numeric' }) => {
  if (!iso) return ''
  const d = new Date(iso.replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', opts)
}
