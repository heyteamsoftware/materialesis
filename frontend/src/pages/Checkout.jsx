import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CreditCard, Smartphone, ShieldCheck, Lock, Check, Info, Printer, XCircle, ArrowRight } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { formatDate } from '../components/ui'
import { Isotipo } from '../components/Brand'
import { imprimir, escapeHtml } from '../components/interactive/print'

const PASOS = ['Conectando con la pasarela', 'Verificando el pago', 'Activando tu licencia']
const METODOS = { tarjeta: 'Tarjeta', bizum: 'Bizum' }
const euros = (n) => `${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

export default function Checkout() {
  const { user, license, setUser } = useAuth()
  const precio = license?.price ?? 49
  const [metodo, setMetodo] = useState('tarjeta')
  const [fallo, setFallo] = useState(false)
  const [fase, setFase] = useState('form') // form · procesando · ok · error
  const [paso, setPaso] = useState(0)
  const [pago, setPago] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => window.scrollTo(0, 0), [fase])

  const pagar = async () => {
    setFase('procesando')
    setError('')
    setPaso(0)
    try {
      await espera(900)
      setPaso(1)
      const peticion = api('license/checkout', { method: 'POST', body: { method: metodo, simulate_failure: fallo } })
      await espera(1100)
      const d = await peticion
      setPaso(2)
      await espera(800)
      setUser(d.user)
      setPago(d.payment)
      setFase('ok')
    } catch (e) {
      setError(e.message)
      setFase('error')
    }
  }

  const imprimirRecibo = () => {
    const filas = [
      ['Referencia', pago.reference],
      ['Fecha', formatDate(pago.created_at)],
      ['Concepto', 'Licencia anual · Materiales de Apoyo a la Intervención Social'],
      ['Titular', user.name],
      ['Método', METODOS[pago.method]],
      ['Válida hasta', formatDate(pago.license_until)],
      ['Importe', euros(pago.amount)],
    ]
      .map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`)
      .join('')
    imprimir(
      `Recibo ${pago.reference}`,
      `<main><p class="k">Recibo de pago</p><h1>Licencia anual</h1><p class="s">Pago simulado · sin valor fiscal ni cargo real</p><table>${filas}</table></main>`,
      `main{max-width:620px;margin:48px auto;padding:0 24px}.k{text-transform:uppercase;letter-spacing:.14em;font-size:11px;color:#9c4a2a;font-weight:700}
       h1{font-size:34px;margin:6px 0 4px}.s{color:#9a6f17;font-size:13px;margin:0 0 24px}table{width:100%;border-collapse:collapse}
       th{text-align:left;font-weight:600;color:#7d8086;font-size:13px;padding:10px 0;border-bottom:1px solid #e8decc;width:38%}td{padding:10px 0;border-bottom:1px solid #e8decc}
       tr:last-child td{font-family:Fraunces,serif;font-size:22px}`,
    )
  }

  /* ---------- Resultado correcto ---------- */
  if (fase === 'ok' && pago) {
    return (
      <div className="mx-auto max-w-2xl px-5 pb-10 pt-10 sm:px-8 sm:pt-16">
        <div className="animate-aparece text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-salvia text-white shadow-flota">
            <Check size={36} strokeWidth={2.5} />
          </span>
          <h1 className="mt-7 text-5xl leading-tight">¡Licencia activada!</h1>
          <p className="mx-auto mt-3 max-w-md text-lg text-tinta-2">Ya tienes acceso completo a las siete áreas, con descargas incluidas, hasta el {formatDate(pago.license_until)}.</p>
        </div>

        <div className="mt-10 animate-aparece rounded-[1.8rem] bg-papel p-7 shadow-suave [animation-delay:150ms] sm:p-9">
          <div className="flex items-center justify-between gap-4 border-b border-dashed border-lino-2 pb-5">
            <div>
              <p className="etiqueta text-terracota-700">Recibo</p>
              <p className="mt-1 font-serif text-xl">{pago.reference}</p>
            </div>
            <Isotipo size={40} />
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            {[
              ['Fecha', formatDate(pago.created_at)],
              ['Concepto', 'Licencia anual'],
              ['Titular', user.name],
              ['Método', METODOS[pago.method]],
              ['Válida hasta', formatDate(pago.license_until)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-tinta-3">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
            <div className="mt-2 flex items-baseline justify-between border-t border-lino pt-4">
              <dt className="font-semibold">Total</dt>
              <dd className="font-serif text-3xl">{euros(pago.amount)}</dd>
            </div>
          </dl>
          <p className="mt-5 rounded-xl bg-mostaza-100 px-4 py-2.5 text-xs text-mostaza-700">Pago simulado: no se ha realizado ningún cargo.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/app" className="btn btn-calido">
            Ir a mi espacio <ArrowRight size={17} />
          </Link>
          <button onClick={imprimirRecibo} className="btn btn-claro">
            <Printer size={16} /> Imprimir recibo
          </button>
        </div>
      </div>
    )
  }

  /* ---------- Formulario / procesando / error ---------- */
  return (
    <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 sm:px-8 sm:pt-12">
      <Link to="/licencia" className="group inline-flex items-center gap-2 text-sm font-medium text-tinta-2 hover:text-tinta">
        <ArrowLeft size={16} className="transition-transform duration-500 group-hover:-translate-x-1" /> Volver a la licencia
      </Link>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
        {/* Resumen del pedido */}
        <aside className="relative animate-aparece overflow-hidden rounded-[2rem] bg-tinta p-7 text-papel shadow-flota sm:p-9 lg:sticky lg:top-28">
          <svg viewBox="0 0 200 200" className="absolute -bottom-24 -right-20 w-72 opacity-15" aria-hidden="true">
            <path fill="#c2643f" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
          </svg>
          <div className="relative">
            <p className="etiqueta text-mostaza">Tu pedido</p>
            <h1 className="mt-3 text-4xl leading-tight">Licencia anual</h1>
            <p className="mt-2 text-papel/70">
              {user.license_active && user.role !== 'admin'
                ? `Renovación: se suma un año a tu licencia actual (hasta el ${formatDate(user.license_until)}).`
                : 'Acceso completo durante 365 días desde hoy.'}
            </p>
            <ul className="mt-7 grid gap-2.5 text-sm text-papel/85">
              {['Las 7 áreas completas', 'Descarga de todos los materiales', 'Herramientas interactivas premium', 'Novedades durante el curso'].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check size={15} className="text-mostaza" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-baseline justify-between border-t border-papel/15 pt-5">
              <span className="text-papel/70">Total</span>
              <span className="font-serif text-5xl">{euros(precio)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-papel/50">IVA incluido</p>
          </div>
        </aside>

        {/* Pasarela */}
        <section className="animate-aparece [animation-delay:120ms]">
          <div className="flex items-start gap-3 rounded-2xl border border-mostaza/40 bg-mostaza-100 px-5 py-4 text-sm text-mostaza-700">
            <Info size={18} className="mt-0.5 shrink-0" />
            <p>
              <strong>Pasarela de pago simulada.</strong> No se cobra nada y no se piden datos bancarios: al pulsar «Pagar» se registra un pago de prueba y la licencia se activa al
              momento.
            </p>
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[2rem] bg-papel p-6 shadow-suave sm:p-9">
            {fase === 'procesando' && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-papel/95 backdrop-blur-sm" role="status" aria-live="polite">
                <div className="w-full max-w-xs">
                  <span className="relative mx-auto mb-8 flex h-14 w-14">
                    <span className="absolute inset-0 rounded-full border-[3px] border-lino" />
                    <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-terracota" />
                    <Lock size={18} className="absolute inset-0 m-auto text-tinta" />
                  </span>
                  <ol className="grid gap-3">
                    {PASOS.map((p, i) => (
                      <li key={p} className={`flex items-center gap-3 text-sm transition-all duration-500 ${i <= paso ? 'opacity-100' : 'opacity-35'}`}>
                        <span className={`grid h-6 w-6 place-items-center rounded-full transition-colors duration-500 ${i < paso ? 'bg-salvia text-white' : i === paso ? 'bg-tinta text-papel' : 'bg-lino'}`}>
                          {i < paso ? <Check size={13} strokeWidth={3} /> : <span className="text-[0.7rem] font-bold">{i + 1}</span>}
                        </span>
                        {p}…
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {fase === 'error' && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-terracota-100 px-5 py-4 text-sm text-terracota-700" role="alert">
                <XCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Pago no completado</p>
                  <p className="mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <h2 className="text-2xl">Método de pago</h2>
            <div className="mt-4 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Método de pago">
              {[
                { k: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                { k: 'bizum', label: 'Bizum', icon: Smartphone },
              ].map((m) => (
                <button
                  key={m.k}
                  role="radio"
                  aria-checked={metodo === m.k}
                  onClick={() => setMetodo(m.k)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left font-semibold transition-all duration-300 ${
                    metodo === m.k ? 'border-tinta bg-arena/60 shadow-suave' : 'border-lino hover:border-lino-2'
                  }`}
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${metodo === m.k ? 'bg-tinta text-papel' : 'bg-arena text-tinta-2'}`}>
                    <m.icon size={18} />
                  </span>
                  {m.label}
                  <span className={`ml-auto h-4 w-4 rounded-full border-2 ${metodo === m.k ? 'border-[5px] border-tinta' : 'border-lino-2'}`} />
                </button>
              ))}
            </div>

            {/* Datos de prueba, no editables */}
            <div className="mt-6">
              {metodo === 'tarjeta' ? (
                <div key="t" className="relative mx-auto aspect-[1.586] max-w-sm animate-aparece overflow-hidden rounded-2xl bg-gradient-to-br from-[#2b3f57] to-tinta p-6 text-papel shadow-flota">
                  <svg viewBox="0 0 200 200" className="absolute -right-12 -top-16 w-52 opacity-25" aria-hidden="true">
                    <path fill="#c2643f" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
                  </svg>
                  <div className="relative flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="h-8 w-11 rounded-md bg-gradient-to-br from-mostaza to-[#b8862d]" />
                      <span className="rounded-full bg-papel/15 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider">Tarjeta de prueba</span>
                    </div>
                    <p className="font-mono text-lg tracking-[0.18em] sm:text-xl">4242 4242 4242 4242</p>
                    <div className="flex justify-between text-xs">
                      <span>
                        <span className="block text-[0.6rem] uppercase tracking-wider text-papel/50">Titular</span>
                        <span className="uppercase">{user.name}</span>
                      </span>
                      <span className="text-right">
                        <span className="block text-[0.6rem] uppercase tracking-wider text-papel/50">Caduca</span>
                        12/30
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div key="b" className="mx-auto flex max-w-sm animate-aparece items-center gap-4 rounded-2xl bg-marea-100 p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-marea text-white">
                    <Smartphone size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-marea">Bizum de prueba</p>
                    <p className="mt-0.5 font-mono text-lg">+34 600 000 000</p>
                    <p className="text-xs text-tinta-3">Se confirma automáticamente</p>
                  </div>
                </div>
              )}
              <p className="mt-3 text-center text-xs text-tinta-3">Datos ficticios de demostración: no se pueden editar ni se envían a ningún banco.</p>
            </div>

            <details className="mt-6 rounded-2xl bg-arena/60 px-4 py-3 text-sm">
              <summary className="cursor-pointer font-semibold text-tinta-2">Opciones de prueba</summary>
              <label className="mt-3 flex items-center gap-3">
                <input type="checkbox" checked={fallo} onChange={(e) => setFallo(e.target.checked)} className="h-4 w-4 accent-[#c2643f]" />
                Simular que el banco rechaza el pago
              </label>
            </details>

            <button onClick={pagar} disabled={fase === 'procesando'} className="btn btn-calido mt-7 w-full !py-4 text-base">
              <Lock size={17} /> {fase === 'error' ? 'Intentar de nuevo' : `Pagar ${euros(precio)}`}
            </button>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs text-tinta-3">
              <ShieldCheck size={14} /> Si renuevas antes de que caduque, el nuevo año se suma al que te quede.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
