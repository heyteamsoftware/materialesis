import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { api } from './api'
import { Cargando } from '../components/ui'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, license: { price: 49, days: 365 } })

  const refresh = useCallback(async () => {
    try {
      const data = await api('auth/me')
      setState({ loading: false, user: data.user, license: data.license })
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value = useMemo(
    () => ({
      ...state,
      refresh,
      setUser: (user) => setState((s) => ({ ...s, user })),
      async login(username, password) {
        const data = await api('auth/login', { method: 'POST', body: { username, password } })
        setState((s) => ({ ...s, user: data.user }))
        return data.user
      },
      async register(fields) {
        const data = await api('auth/register', { method: 'POST', body: fields })
        setState((s) => ({ ...s, user: data.user }))
        return data.user
      },
      async logout() {
        await api('auth/logout', { method: 'POST' }).catch(() => {})
        setState((s) => ({ ...s, user: null }))
      },
    }),
    [state, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

/** Protege rutas privadas. Con `admin` exige rol de administración. */
export function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Cargando pantalla />
  if (!user) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(location.pathname)}`} replace />
  }
  if (admin && user.role !== 'admin') return <Navigate to="/app" replace />
  return children
}
