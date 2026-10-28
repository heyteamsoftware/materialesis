import { useEffect, useState } from 'react'
import { CreditCard, Smartphone } from 'lucide-react'
import { api } from '../../lib/api'
import { Cargando, useToast, formatDate } from '../../components/ui'
import { Cabecera } from './AdminLayout'

const euros = (n) => `${Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`

export default function AdminPayments() {
  const toast = useToast()
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    api('admin/payments')
      .then(setDatos)
      .catch((e) => toast(e.message, 'error'))
  }, [toast])

  return (
    <div>
      <Cabecera titulo="Pagos" texto="Historial de pagos de licencias. Ahora mismo la pasarela es simulada: no hay cobros reales.">
        {datos && (
          <div className="rounded-2xl bg-papel px-5 py-3 text-right shadow-suave">
            <p className="text-xs text-tinta-3">Total (simulado)</p>
            <p className="font-serif text-2xl">{euros(datos.total)}</p>
          </div>
        )}
      </Cabecera>

      {!datos ? (
        <Cargando />
      ) : datos.payments.length === 0 ? (
        <p className="rounded-[1.6rem] border border-dashed border-lino-2 p-10 text-center text-tinta-3">Todavía no hay pagos.</p>
      ) : (
        <div className="hoja overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-lino bg-arena/50 text-xs uppercase tracking-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 font-semibold">Referencia</th>
                  <th className="px-3 py-3 font-semibold">Persona</th>
                  <th className="px-3 py-3 font-semibold">Método</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Válida hasta</th>
                  <th className="px-3 py-3 font-semibold">Fecha</th>
                  <th className="px-5 py-3 text-right font-semibold">Importe</th>
                </tr>
              </thead>
              <tbody>
                {datos.payments.map((p) => (
                  <tr key={p.id} className="border-b border-lino/70 last:border-0">
                    <td className="px-5 py-4 font-mono text-xs">
                      {p.reference}
                      {Number(p.simulated) === 1 && <span className="pastilla ml-2 bg-mostaza-100 font-sans text-mostaza-700">Simulado</span>}
                    </td>
                    <td className="px-3 py-4">
                      <span className="block font-semibold">{p.user_name}</span>
                      {p.username && <span className="text-xs text-tinta-3">@{p.username}</span>}
                    </td>
                    <td className="px-3 py-4 text-tinta-2">
                      <span className="flex items-center gap-1.5">
                        {p.method === 'bizum' ? <Smartphone size={14} /> : <CreditCard size={14} />}
                        {p.method === 'bizum' ? 'Bizum' : 'Tarjeta'}
                      </span>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`pastilla ${p.status === 'paid' ? 'bg-salvia-100 text-salvia-700' : 'bg-terracota-100 text-terracota-700'}`}>
                        {p.status === 'paid' ? 'Pagado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs text-tinta-2">{p.license_until ? formatDate(p.license_until, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td className="px-3 py-4 text-xs text-tinta-2">{formatDate(p.created_at, { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-5 py-4 text-right font-serif text-lg">{euros(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
