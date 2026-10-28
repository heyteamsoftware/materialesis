import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'
import { ToastProvider, Cargando } from './components/ui'
import { PublicLayout } from './components/SiteChrome'
import Landing from './pages/Landing'

// Las zonas privada y de administración se cargan solo cuando se necesitan
const Login = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Login })))
const Register = lazy(() => import('./pages/AuthPages').then((m) => ({ default: m.Register })))
const Opinion = lazy(() => import('./pages/Opinion'))
const Contact = lazy(() => import('./pages/Contact'))
const License = lazy(() => import('./pages/License'))
const AppLayout = lazy(() => import('./pages/app/AppLayout'))
const DashboardHome = lazy(() => import('./pages/app/DashboardHome'))
const SectionPage = lazy(() => import('./pages/app/SectionPage'))
const MaterialPage = lazy(() => import('./pages/app/MaterialPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminMaterials = lazy(() => import('./pages/admin/AdminMaterials'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))

function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <p className="font-serif text-8xl text-terracota/40">404</p>
      <h1 className="mt-4 text-4xl">Esta página no existe.</h1>
      <p className="mt-3 text-tinta-2">Puede que el enlace esté roto o que el material se haya movido.</p>
      <Link to="/" className="btn btn-primario mt-8">
        Volver al inicio
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<Cargando pantalla />}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="opinion" element={<Opinion />} />
                <Route path="contacto" element={<Contact />} />
                <Route path="licencia" element={<License />} />
                <Route path="*" element={<NoEncontrado />} />
              </Route>
              <Route path="entrar" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route
                path="app"
                element={
                  <RequireAuth>
                    <AppLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path=":section" element={<SectionPage />} />
                <Route path=":section/:id" element={<MaterialPage />} />
              </Route>
              <Route
                path="admin"
                element={
                  <RequireAuth admin>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<AdminMaterials />} />
                <Route path="usuarios" element={<AdminUsers />} />
                <Route path="resenas" element={<AdminReviews />} />
                <Route path="mensajes" element={<AdminMessages />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
