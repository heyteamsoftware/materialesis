import { useCallback, useEffect, useState } from 'react'
import { Check, EyeOff, Trash2, RotateCcw } from 'lucide-react'
import { api } from '../../lib/api'
import { sectionBySlug } from '../../lib/sections'
import { Cargando, Estrellas, useToast, formatDate } from '../../components/ui'
import { Cabecera, useStats } from './AdminLayout'

const ESTADOS = [
  { k: 'pending', label: 'Pendientes', uno: 'Pendiente', clase: 'bg-mostaza-100 text-mostaza-700' },
  { k: 'approved', label: 'Publicadas', uno: 'Publicada', clase: 'bg-salvia-100 text-salvia-700' },
  { k: 'hidden', label: 'Ocultas', uno: 'Oculta', clase: 'bg-lino text-tinta-3' },
  { k: 'all', label: 'Todas' },
]

export default function AdminReviews() {
  const toast = useToast()
  const { recargar } = useStats()
  const [resenas, setResenas] = useState(null)
  const [filtro, setFiltro] = useState('pending')

  const cargar = useCallback(() => {
    api('admin/reviews')
      .then((d) => setResenas(d.reviews))
      .catch((e) => toast(e.message, 'error'))
  }, [toast])
  useEffect(cargar, [cargar])

  const cambiar = async (r, status) => {
    try {
      await api(`admin/reviews/${r.id}`, { method: 'PATCH', body: { status } })
      setResenas((all) => all.map((x) => (x.id === r.id ? { ...x, status } : x)))
      toast(status === 'approved' ? 'Reseña publicada en «Tu opinión»' : status === 'hidden' ? 'Reseña ocultada' : 'Reseña devuelta a pendientes')
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }
  const borrar = async (r) => {
    if (!window.confirm('¿Borrar esta reseña definitivamente?')) return
    try {
      await api(`admin/reviews/${r.id}`, { method: 'DELETE' })
      setResenas((all) => all.filter((x) => x.id !== r.id))
      toast('Reseña borrada')
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const lista = (resenas || []).filter((r) => filtro === 'all' || r.status === filtro)
  const cuenta = (k) => (resenas || []).filter((r) => r.status === k).length

  return (
    <div>
      <Cabecera titulo="Reseñas" texto="Nada se publica en «Tu opinión» sin pasar por aquí. Aprueba, oculta o borra cada reseña." />
      <div className="mb-6 flex flex-wrap gap-1.5">
        {ESTADOS.map((e) => (
          <button key={e.k} onClick={() => setFiltro(e.k)} className={`pastilla !px-3.5 !py-1.5 transition ${filtro === e.k ? 'bg-tinta text-papel' : 'bg-papel text-tinta-2 hover:text-tinta'}`}>
            {e.label}
            {e.k !== 'all' && <span className="opacity-60">{cuenta(e.k)}</span>}
          </button>
        ))}
      </div>

      {!resenas ? (
        <Cargando />
      ) : lista.length === 0 ? (
        <p className="rounded-[1.6rem] border border-dashed border-lino-2 p-10 text-center text-tinta-3">No hay reseñas en este estado.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {lista.map((r) => {
            const est = ESTADOS.find((e) => e.k === r.status)
            const sec = r.section ? sectionBySlug(r.section) : null
            return (
              <article key={r.id} className="hoja flex flex-col p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Estrellas valor={Number(r.rating)} size={16} />
                  <span className={`pastilla ${est.clase}`}>{est.uno}</span>
                </div>
                <p className="mt-4 flex-1 font-serif text-lg leading-relaxed">{r.body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tinta-3">
                  <span className="font-semibold text-tinta">{r.author_name}</span>
                  {r.author_role && <span>{r.author_role}</span>}
                  {r.username && <span>@{r.username}</span>}
                  {sec && (
                    <span className="pastilla" style={{ background: sec.tint, color: sec.color }}>
                      {sec.name}
                    </span>
                  )}
                  <span>{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-lino pt-4">
                  {r.status !== 'approved' && (
                    <button onClick={() => cambiar(r, 'approved')} className="btn btn-sm bg-salvia-100 text-salvia-700 hover:bg-salvia hover:text-white">
                      <Check size={15} /> Aprobar
                    </button>
                  )}
                  {r.status !== 'hidden' && (
                    <button onClick={() => cambiar(r, 'hidden')} className="btn btn-sm btn-claro">
                      <EyeOff size={15} /> Ocultar
                    </button>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => cambiar(r, 'pending')} className="btn btn-sm btn-texto text-tinta-2">
                      <RotateCcw size={14} /> A pendientes
                    </button>
                  )}
                  <button onClick={() => borrar(r)} className="btn btn-sm btn-texto ml-auto text-tinta-3 hover:text-terracota-700">
                    <Trash2 size={15} /> Borrar
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
