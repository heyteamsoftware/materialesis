import { useState } from 'react'
import { Send, MessageCircleHeart, Clock3, BookOpenCheck } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Campo, Aviso } from '../components/ui'

export default function Contact() {
  const { user } = useAuth()
  const vacio = { name: user?.name || '', email: user?.email || '', subject: '', message: '', website: '' }
  const [form, setForm] = useState(vacio)
  const [estado, setEstado] = useState({ enviando: false, error: '', field: '', ok: false })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    setEstado({ enviando: true, error: '', field: '', ok: false })
    try {
      await api('contact', { method: 'POST', body: form })
      setEstado({ enviando: false, error: '', field: '', ok: true })
      setForm(vacio)
    } catch (err) {
      setEstado({ enviando: false, error: err.message, field: err.field, ok: false })
    }
  }
  const fe = (f) => (estado.field === f ? estado.error : '')

  return (
    <div className="mx-auto grid max-w-7xl gap-14 px-5 pb-10 pt-8 sm:px-8 sm:pt-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
      <section className="animate-aparece">
        <p className="etiqueta text-salvia-700">Contacto</p>
        <h1 className="mt-4 text-5xl leading-[1.05] sm:text-6xl">
          Hablemos, <em className="text-salvia-700">sin prisa</em>.
        </h1>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta-2">
          Dudas sobre la licencia, propuestas de nuevos materiales o algo que podamos mejorar. Respondemos personalmente.
        </p>
        <ul className="mt-10 grid gap-6">
          {[
            { icon: Clock3, t: 'Respuesta en 48 h laborables', d: 'Normalmente antes.' },
            { icon: BookOpenCheck, t: '¿Echas en falta un material?', d: 'Cuéntanos qué necesitas en tu servicio o en el aula.' },
            { icon: MessageCircleHeart, t: 'Centros y equipos', d: 'Consultas sobre licencias para varios profesionales.' },
          ].map((it) => (
            <li key={it.t} className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-salvia-100 text-salvia-700">
                <it.icon size={19} />
              </span>
              <span>
                <span className="block font-semibold">{it.t}</span>
                <span className="text-sm text-tinta-2">{it.d}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="animate-aparece [animation-delay:120ms]">
        <div className="relative">
          <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-[2rem] bg-salvia/25 sm:block" aria-hidden="true" />
          <div className="relative rounded-[2rem] bg-papel p-6 shadow-flota sm:p-10">
            {estado.ok ? (
              <div className="py-10 text-center">
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-salvia-100 text-salvia-700">
                  <Send size={24} />
                </span>
                <h2 className="mt-6 text-3xl">Mensaje recibido.</h2>
                <p className="mx-auto mt-3 max-w-sm text-tinta-2">Gracias por escribirnos. Te responderemos al email que nos has indicado.</p>
                <button className="btn btn-claro mt-8" onClick={() => setEstado({ ...estado, ok: false })}>
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-5" noValidate>
                {estado.error && !estado.field && <Aviso>{estado.error}</Aviso>}
                <div className="grid gap-5 sm:grid-cols-2">
                  <Campo label="Nombre" name="name" autoComplete="name" value={form.name} onChange={set('name')} error={fe('name')} />
                  <Campo label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={set('email')} error={fe('email')} />
                </div>
                <Campo label="Asunto" name="subject" value={form.subject} onChange={set('subject')} error={fe('subject')} placeholder="Licencia para un equipo de 5 personas" />
                <Campo as="textarea" rows={6} label="Mensaje" name="message" value={form.message} onChange={set('message')} error={fe('message')} />
                {/* Campo trampa anti-spam: invisible para personas */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label>
                    Web <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                  </label>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-xs text-tinta-3">Solo usaremos tus datos para responderte.</p>
                  <button className="btn btn-primario" disabled={estado.enviando}>
                    {estado.enviando ? 'Enviando…' : 'Enviar mensaje'} <Send size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
