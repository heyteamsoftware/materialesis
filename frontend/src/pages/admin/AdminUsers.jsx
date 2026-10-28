import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search, ShieldCheck, Trash2, Clock, CalendarPlus, Ban } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Cargando, useToast, formatDate } from '../../components/ui'
import { Cabecera, useStats } from './AdminLayout'

const FILTROS = [
  { k: 'todos', label: 'Todos' },
  { k: 'solicitudes', label: 'Solicitudes' },
  { k: 'activas', label: 'Licencia activa' },
  { k: 'inactivas', label: 'Sin licencia' },
]

function Estado({ u }) {
  if (u.role === 'admin') return <span className="pastilla bg-tinta text-papel">Administración</span>
  if (u.license_active)
    return (
      <span className="pastilla bg-salvia-100 text-salvia-700">
        <ShieldCheck size={12} /> Activa · hasta {formatDate(u.license_until, { day: 'numeric', month: 'short', year: 'numeric' })}
      </span>
    )
  if (u.license_requested_at)
    return (
      <span className="pastilla bg-mostaza-100 text-mostaza-700">
        <Clock size={12} /> Solicitada {formatDate(u.license_requested_at, { day: 'numeric', month: 'short' })}
      </span>
    )
  return <span className="pastilla bg-lino text-tinta-3">Inactiva</span>
}

export default function AdminUsers() {
  const { user: yo } = useAuth()
  const toast = useToast()
  const { recargar } = useStats()
  const [usuarios, setUsuarios] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [texto, setTexto] = useState('')

  const cargar = useCallback(() => {
    api('admin/users')
      .then((d) => setUsuarios(d.users))
      .catch((e) => toast(e.message, 'error'))
  }, [toast])
  useEffect(cargar, [cargar])

  const lista = useMemo(() => {
    if (!usuarios) return []
    const t = texto.trim().toLowerCase()
    return usuarios.filter((u) => {
      if (t && !`${u.name} ${u.username} ${u.email}`.toLowerCase().includes(t)) return false
      if (filtro === 'solicitudes') return u.license_requested_at && !u.license_active
      if (filtro === 'activas') return u.license_active && u.role !== 'admin'
      if (filtro === 'inactivas') return !u.license_active
      return true
    })
  }, [usuarios, filtro, texto])

  const accion = async (u, body, mensaje) => {
    try {
      const d = await api(`admin/users/${u.id}`, { method: 'PATCH', body })
      setUsuarios((all) => all.map((x) => (x.id === u.id ? d.user : x)))
      toast(mensaje)
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const borrar = async (u) => {
    if (!window.confirm(`¿Borrar la cuenta de ${u.name} (@${u.username})? No se puede deshacer.`)) return
    try {
      await api(`admin/users/${u.id}`, { method: 'DELETE' })
      setUsuarios((all) => all.filter((x) => x.id !== u.id))
      toast('Cuenta borrada')
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  return (
    <div>
      <Cabecera titulo="Usuarios" texto="Cuentas registradas y estado de su licencia. Al confirmar un pago, activa la licencia: se suma un año desde hoy o desde su fecha de fin si aún está vigente." />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta-3" />
          <input className="campo !py-2.5 pl-10" placeholder="Nombre, usuario o email" value={texto} onChange={(e) => setTexto(e.target.value)} aria-label="Buscar usuarios" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTROS.map((f) => (
            <button key={f.k} onClick={() => setFiltro(f.k)} className={`pastilla !px-3.5 !py-1.5 transition ${filtro === f.k ? 'bg-tinta text-papel' : 'bg-papel text-tinta-2 hover:text-tinta'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!usuarios ? (
        <Cargando />
      ) : (
        <div className="hoja overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-lino bg-arena/50 text-xs uppercase tracking-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 font-semibold">Persona</th>
                  <th className="px-3 py-3 font-semibold">Licencia</th>
                  <th className="px-3 py-3 font-semibold">Alta</th>
                  <th className="px-3 py-3 font-semibold">Último acceso</th>
                  <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((u) => (
                  <tr key={u.id} className={`border-b border-lino/70 last:border-0 ${u.license_requested_at && !u.license_active ? 'bg-mostaza-100/30' : ''}`}>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terracota-100 font-serif font-semibold text-terracota-700">
                          {u.name.trim().charAt(0).toUpperCase()}
                        </span>
                        <span>
                          <span className="block font-semibold">{u.name}</span>
                          <span className="block text-xs text-tinta-3">
                            @{u.username} · <a href={`mailto:${u.email}`} className="enlace">{u.email}</a>
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <Estado u={u} />
                    </td>
                    <td className="px-3 py-4 text-xs text-tinta-2">{formatDate(u.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-3 py-4 text-xs text-tinta-2">{u.last_login_at ? formatDate(u.last_login_at, { day: 'numeric', month: 'short' }) : '—'}</td>
                    <td className="px-5 py-4">
                      <span className="flex flex-wrap justify-end gap-1.5">
                        {u.role !== 'admin' && (
                          <>
                            <button onClick={() => accion(u, { action: 'activate' }, u.license_active ? 'Licencia renovada un año más' : 'Licencia activada durante un año')} className="btn btn-sm !px-3 bg-salvia-100 text-salvia-700 hover:bg-salvia hover:text-white">
                              <CalendarPlus size={14} /> {u.license_active ? 'Renovar' : 'Activar'}
                            </button>
                            {u.license_active && (
                              <button onClick={() => window.confirm(`¿Desactivar la licencia de ${u.name}?`) && accion(u, { action: 'deactivate' }, 'Licencia desactivada')} className="btn btn-sm btn-claro !px-3">
                                <Ban size={14} /> Desactivar
                              </button>
                            )}
                          </>
                        )}
                        {u.id !== yo.id && (
                          <>
                            <button
                              onClick={() =>
                                window.confirm(u.role === 'admin' ? `¿Quitar el rol de administración a ${u.name}?` : `¿Dar rol de administración a ${u.name}?`) &&
                                accion(u, { action: 'role', role: u.role === 'admin' ? 'user' : 'admin' }, 'Rol actualizado')
                              }
                              className="btn btn-sm btn-texto !px-2 text-xs text-tinta-3 hover:text-tinta"
                            >
                              {u.role === 'admin' ? 'Hacer usuario' : 'Hacer admin'}
                            </button>
                            <button onClick={() => borrar(u)} className="rounded-full p-2 text-tinta-3 hover:bg-terracota-100 hover:text-terracota-700" aria-label={`Borrar ${u.name}`}>
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
                {lista.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-tinta-3">
                      No hay cuentas con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
