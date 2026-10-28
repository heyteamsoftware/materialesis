import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Cookie } from 'lucide-react'

const CLAVE = 'mis_cookies_visto'

// Si el navegador bloquea el almacenamiento, el aviso simplemente vuelve a salir.
function yaVisto() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

function marcarVisto() {
  try {
    localStorage.setItem(CLAVE, '1')
  } catch {
    /* sin almacenamiento disponible */
  }
}

export default function CookieNotice() {
  const [visible, setVisible] = useState(() => !yaVisto())
  if (!visible) return null

  const cerrar = () => {
    marcarVisto()
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 z-[65] flex animate-aparece items-center gap-3 rounded-2xl border border-lino-2/70 bg-papel/95 p-3.5 text-sm shadow-flota backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mostaza-100 text-mostaza-700">
        <Cookie size={16} />
      </span>
      <p className="flex-1 leading-snug text-tinta-2">
        Solo usamos una cookie técnica para mantener tu sesión. Sin publicidad ni analítica.{' '}
        <Link to="/cookies" className="enlace font-semibold text-tinta">
          Más información
        </Link>
      </p>
      <button onClick={cerrar} className="btn btn-primario btn-sm shrink-0">
        Entendido
      </button>
    </div>
  )
}
