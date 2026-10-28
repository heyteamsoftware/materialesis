// Cliente de la API PHP. Todas las rutas son relativas a /materialesis/api/
const BASE = import.meta.env.BASE_URL + 'api/'

export class ApiError extends Error {
  constructor(message, status, field) {
    super(message)
    this.status = status
    this.field = field
  }
}

/**
 * api('materials?section=fol')
 * api('auth/login', { method: 'POST', body: { username, password } })
 * api('admin/materials', { method: 'POST', form: formData })
 */
export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = { 'X-MIS': '1', Accept: 'application/json' }
  let payload
  if (form) {
    payload = form
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(BASE + path, { method, headers, body: payload, credentials: 'same-origin' })
  } catch {
    throw new ApiError('No hay conexión con el servidor. Revisa tu red e inténtalo de nuevo.', 0)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    /* respuesta vacía */
  }
  if (!res.ok) {
    throw new ApiError(data?.error || 'Algo no ha ido bien. Inténtalo de nuevo.', res.status, data?.field)
  }
  return data
}

/** URL absoluta para recursos que devuelve la API (imágenes de página, descargas). */
export const fileUrl = (path) => import.meta.env.BASE_URL + path
