import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, KeyRound, Trash2, UserRound, ShieldAlert } from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Campo, Aviso, useToast, formatDate } from '../../components/ui'

function Seccion({ titulo, texto, children, peligro = false }) {
  return (
    <section className={`hoja p-6 sm:p-8 ${peligro ? 'border-terracota/30' : ''}`}>
      <h2 className={`text-2xl ${peligro ? 'text-terracota-700' : ''}`}>{titulo}</h2>
      {texto && <p className="mt-1.5 text-sm text-tinta-2">{texto}</p>}
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default function AccountPage() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const admin = user.role === 'admin'

  // Datos personales
  const [datos, setDatos] = useState({ name: user.name, username: user.username, email: user.email })
  const [guardandoDatos, setGuardandoDatos] = useState(false)
  const [errDatos, setErrDatos] = useState({ msg: '', field: '' })

  // Contraseña
  const [clave, setClave] = useState({ current: '', password: '', confirm: '' })
  const [guardandoClave, setGuardandoClave] = useState(false)
  const [errClave, setErrClave] = useState({ msg: '', field: '' })

  // Borrado
  const [borrado, setBorrado] = useState({ password: '', confirmo: false })
  const [borrando, setBorrando] = useState(false)
  const [errBorrado, setErrBorrado] = useState('')

  const feDatos = (f) => (errDatos.field === f ? errDatos.msg : '')
  const feClave = (f) => (errClave.field === f ? errClave.msg : '')

  const guardarDatos = async (e) => {
    e.preventDefault()
    setGuardandoDatos(true)
    setErrDatos({ msg: '', field: '' })
    try {
      const d = await api('auth/profile', { method: 'PATCH', body: datos })
      setUser(d.user)
      toast('Tus datos se han guardado')
    } catch (err) {
      setErrDatos({ msg: err.message, field: err.field || '' })
    } finally {
      setGuardandoDatos(false)
    }
  }

  const cambiarClave = async (e) => {
    e.preventDefault()
    if (clave.password !== clave.confirm) {
      setErrClave({ msg: 'Las dos contraseñas nuevas no coinciden', field: 'confirm' })
      return
    }
    setGuardandoClave(true)
    setErrClave({ msg: '', field: '' })
    try {
      await api('auth/password', { method: 'POST', body: { current: clave.current, password: clave.password } })
      setClave({ current: '', password: '', confirm: '' })
      toast('Contraseña cambiada')
    } catch (err) {
      setErrClave({ msg: err.message, field: err.field || '' })
    } finally {
      setGuardandoClave(false)
    }
  }

  const borrarCuenta = async (e) => {
    e.preventDefault()
    setBorrando(true)
    setErrBorrado('')
    try {
      await api('auth/account', { method: 'DELETE', body: { password: borrado.password } })
      navigate('/', { replace: true })
      setUser(null)
      toast('Tu cuenta se ha borrado. Gracias por haber estado aquí.')
    } catch (err) {
      setErrBorrado(err.message)
      setBorrando(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-10 sm:py-14">
      <header className="animate-aparece">
        <p className="etiqueta text-terracota-700">
          <UserRound size={14} /> Mi cuenta
        </p>
        <h1 className="mt-3 text-5xl leading-[1.05] sm:text-6xl">Tus datos</h1>
        <p className="mt-4 text-lg text-tinta-2">Cambia lo que necesites o borra tu cuenta cuando quieras.</p>
        <p className="mt-2 text-sm text-tinta-3">Cuenta creada el {formatDate(user.created_at)}</p>
      </header>

      <div className="mt-12 grid gap-6">
        <Seccion titulo="Datos personales" texto="Así te verán en tus opiniones y en los recibos.">
          <form onSubmit={guardarDatos} className="grid gap-5 sm:grid-cols-2" noValidate>
            {errDatos.msg && !errDatos.field && (
              <div className="sm:col-span-2">
                <Aviso>{errDatos.msg}</Aviso>
              </div>
            )}
            <Campo
              label="Nombre y apellidos"
              name="name"
              autoComplete="name"
              value={datos.name}
              onChange={(e) => setDatos({ ...datos, name: e.target.value })}
              error={feDatos('name')}
              className="sm:col-span-2"
            />
            <Campo
              label="Nombre de usuario"
              name="username"
              autoComplete="username"
              value={datos.username}
              onChange={(e) => setDatos({ ...datos, username: e.target.value })}
              error={feDatos('username')}
              hint="Es el que usas para entrar"
            />
            <Campo
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              value={datos.email}
              onChange={(e) => setDatos({ ...datos, email: e.target.value })}
              error={feDatos('email')}
            />
            <div className="flex justify-end sm:col-span-2">
              <button className="btn btn-primario" disabled={guardandoDatos}>
                <Save size={16} /> {guardandoDatos ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Seccion>

        <Seccion titulo="Contraseña" texto="Usa al menos 8 caracteres. Al cambiarla, tu sesión actual sigue abierta.">
          <form onSubmit={cambiarClave} className="grid gap-5" noValidate>
            {errClave.msg && !errClave.field && <Aviso>{errClave.msg}</Aviso>}
            <Campo
              label="Contraseña actual"
              name="current"
              type="password"
              autoComplete="current-password"
              value={clave.current}
              onChange={(e) => setClave({ ...clave, current: e.target.value })}
              error={feClave('current')}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Campo
                label="Nueva contraseña"
                name="new-password"
                type="password"
                autoComplete="new-password"
                value={clave.password}
                onChange={(e) => setClave({ ...clave, password: e.target.value })}
                error={feClave('password')}
              />
              <Campo
                label="Repite la nueva"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                value={clave.confirm}
                onChange={(e) => setClave({ ...clave, confirm: e.target.value })}
                error={feClave('confirm')}
              />
            </div>
            <div className="flex justify-end">
              <button className="btn btn-claro" disabled={guardandoClave || !clave.current || !clave.password}>
                <KeyRound size={16} /> {guardandoClave ? 'Cambiando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </Seccion>

        <Seccion
          peligro
          titulo="Borrar mi cuenta"
          texto="Borra tu acceso y tus datos de inicio de sesión. Es irreversible."
        >
          {admin ? (
            <p className="flex items-start gap-3 rounded-2xl bg-arena/70 p-5 text-sm text-tinta-2">
              <ShieldAlert size={18} className="mt-0.5 shrink-0 text-tinta-3" />
              La cuenta de administración no se puede borrar desde aquí, para que siempre quede alguien con acceso al panel.
            </p>
          ) : (
            <form onSubmit={borrarCuenta} className="grid gap-5" noValidate>
              <div className="grid gap-2 rounded-2xl bg-terracota-100/60 p-5 text-sm leading-relaxed text-terracota-700">
                <p>Al borrar tu cuenta:</p>
                <ul className="list-disc pl-5">
                  <li>Se elimina tu acceso y tu licencia deja de existir.</li>
                  <li>Tus opiniones publicadas siguen visibles, pero firmadas como «Usuario eliminado».</li>
                  <li>Los registros de pago conservan tu nombre como justificante de cada operación.</li>
                  <li>Se borran los mensajes de contacto enviados con tu email.</li>
                </ul>
              </div>
              {errBorrado && <Aviso>{errBorrado}</Aviso>}
              <Campo
                label="Escribe tu contraseña para confirmar"
                name="delete-password"
                type="password"
                autoComplete="current-password"
                value={borrado.password}
                onChange={(e) => setBorrado({ ...borrado, password: e.target.value })}
              />
              <label className="flex items-start gap-3 text-sm text-tinta-2">
                <input
                  type="checkbox"
                  checked={borrado.confirmo}
                  onChange={(e) => setBorrado({ ...borrado, confirmo: e.target.checked })}
                  className="mt-1 h-4 w-4 shrink-0 accent-[#c2643f]"
                />
                Entiendo que no se puede deshacer.
              </label>
              <div className="flex justify-end">
                <button
                  className="btn bg-terracota-700 text-white hover:bg-terracota-700/90 disabled:opacity-40"
                  disabled={borrando || !borrado.confirmo || !borrado.password}
                >
                  <Trash2 size={16} /> {borrando ? 'Borrando…' : 'Borrar mi cuenta'}
                </button>
              </div>
            </form>
          )}
        </Seccion>
      </div>
    </div>
  )
}
