import { useCallback, useEffect, useState } from 'react'
import { Mail, MailOpen, Reply, Trash2 } from 'lucide-react'
import { api } from '../../lib/api'
import { Cargando, useToast, formatDate } from '../../components/ui'
import { Cabecera, useStats } from './AdminLayout'

export default function AdminMessages() {
  const toast = useToast()
  const { recargar } = useStats()
  const [mensajes, setMensajes] = useState(null)
  const [abierto, setAbierto] = useState(null)

  const cargar = useCallback(() => {
    api('admin/messages')
      .then((d) => setMensajes(d.messages))
      .catch((e) => toast(e.message, 'error'))
  }, [toast])
  useEffect(cargar, [cargar])

  const marcar = async (m, leido) => {
    try {
      await api(`admin/messages/${m.id}`, { method: 'PATCH', body: { is_read: leido ? 1 : 0 } })
      setMensajes((all) => all.map((x) => (x.id === m.id ? { ...x, is_read: leido ? 1 : 0 } : x)))
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  const abrir = (m) => {
    setAbierto(abierto === m.id ? null : m.id)
    if (!Number(m.is_read)) marcar(m, true)
  }
  const borrar = async (m) => {
    if (!window.confirm(`¿Borrar el mensaje de ${m.name}?`)) return
    try {
      await api(`admin/messages/${m.id}`, { method: 'DELETE' })
      setMensajes((all) => all.filter((x) => x.id !== m.id))
      toast('Mensaje borrado')
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div>
      <Cabecera titulo="Mensajes" texto="Lo que llega desde el formulario de contacto." />
      {!mensajes ? (
        <Cargando />
      ) : mensajes.length === 0 ? (
        <p className="rounded-[1.6rem] border border-dashed border-lino-2 p-10 text-center text-tinta-3">La bandeja está vacía.</p>
      ) : (
        <ul className="hoja divide-y divide-lino overflow-hidden">
          {mensajes.map((m) => {
            const noLeido = !Number(m.is_read)
            const open = abierto === m.id
            return (
              <li key={m.id} className={noLeido ? 'bg-terracota-100/25' : ''}>
                <button onClick={() => abrir(m)} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-arena/50" aria-expanded={open}>
                  {noLeido ? <Mail size={18} className="text-terracota" /> : <MailOpen size={18} className="text-tinta-3" />}
                  <span className="min-w-0">
                    <span className={`block truncate ${noLeido ? 'font-semibold' : ''}`}>{m.subject}</span>
                    <span className="block truncate text-xs text-tinta-3">
                      {m.name} · {m.email}
                    </span>
                  </span>
                  <span className="text-xs text-tinta-3">{formatDate(m.created_at, { day: 'numeric', month: 'short' })}</span>
                </button>
                <div className={`grid transition-all duration-500 ease-suave ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 pl-[3.75rem]">
                      <p className="whitespace-pre-wrap rounded-2xl bg-arena/70 p-5 leading-relaxed">{m.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`} className="btn btn-primario btn-sm">
                          <Reply size={15} /> Responder por email
                        </a>
                        <button onClick={() => marcar(m, false)} className="btn btn-claro btn-sm">
                          Marcar como no leído
                        </button>
                        <button onClick={() => borrar(m)} className="btn btn-texto btn-sm ml-auto text-tinta-3 hover:text-terracota-700">
                          <Trash2 size={15} /> Borrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
