import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Search, Paperclip, EyeOff, AlertTriangle, FileText, MousePointerClick } from 'lucide-react'
import { api } from '../../lib/api'
import { SECTIONS, sectionBySlug } from '../../lib/sections'
import { Cargando, Panel, useToast, formatDate } from '../../components/ui'
import { Cabecera, useStats } from './AdminLayout'
import MaterialForm from './MaterialForm'

export default function AdminMaterials() {
  const toast = useToast()
  const { recargar } = useStats()
  const [datos, setDatos] = useState(null)
  const [filtro, setFiltro] = useState({ seccion: '', texto: '' })
  const [editando, setEditando] = useState(null) // null cerrado · {} nuevo · material

  const cargar = useCallback(() => {
    api('admin/materials')
      .then(setDatos)
      .catch((e) => toast(e.message, 'error'))
  }, [toast])
  useEffect(cargar, [cargar])

  const lista = useMemo(() => {
    if (!datos) return []
    const t = filtro.texto.trim().toLowerCase()
    return datos.materials.filter((m) => (!filtro.seccion || m.section === filtro.seccion) && (!t || `${m.title} ${m.summary}`.toLowerCase().includes(t)))
  }, [datos, filtro])

  // Cada área debería tener exactamente 1 demo física y 1 demo digital
  const avisos = useMemo(() => {
    if (!datos) return []
    const out = []
    for (const s of SECTIONS) {
      for (const kind of ['fisico', 'digital']) {
        const n = datos.materials.filter((m) => m.section === s.slug && m.kind === kind && m.access === 'demo' && m.published).length
        if (n !== 1) out.push(`${s.name}: ${n} demo${n === 1 ? '' : 's'} ${kind === 'fisico' ? 'física' : 'digital'}${n === 1 ? '' : 's'} publicada${n === 1 ? '' : 's'} (lo previsto es 1)`)
      }
    }
    return out
  }, [datos])

  const borrar = async (m) => {
    if (!window.confirm(`¿Borrar «${m.title}»? Se eliminarán también sus ficheros. No se puede deshacer.`)) return
    try {
      await api(`admin/materials/${m.id}`, { method: 'DELETE' })
      toast('Material borrado')
      cargar()
      recargar()
    } catch (e) {
      toast(e.message, 'error')
    }
  }

  const guardado = (m, nuevo) => {
    toast(nuevo ? 'Material creado' : 'Cambios guardados')
    setEditando(null)
    cargar()
    recargar()
  }

  return (
    <div>
      <Cabecera titulo="Materiales" texto="Crea, edita y organiza los recursos de las siete áreas. Marca cada uno como Demo (abierto a todas las cuentas) o Premium (solo con licencia).">
        <button className="btn btn-calido" onClick={() => setEditando({})}>
          <Plus size={18} /> Nuevo material
        </button>
      </Cabecera>

      {avisos.length > 0 && (
        <details className="mb-6 rounded-2xl bg-mostaza-100 px-5 py-3 text-sm text-mostaza-700">
          <summary className="flex cursor-pointer items-center gap-2 font-semibold">
            <AlertTriangle size={16} /> {avisos.length} aviso{avisos.length > 1 ? 's' : ''} sobre las demos
          </summary>
          <ul className="mt-2 list-disc pl-6">
            {avisos.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[14rem] flex-1 sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tinta-3" />
          <input className="campo !py-2.5 pl-10" placeholder="Buscar…" value={filtro.texto} onChange={(e) => setFiltro({ ...filtro, texto: e.target.value })} aria-label="Buscar materiales" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFiltro({ ...filtro, seccion: '' })} className={`pastilla !px-3.5 !py-1.5 transition ${!filtro.seccion ? 'bg-tinta text-papel' : 'bg-papel text-tinta-2 hover:text-tinta'}`}>
            Todas
          </button>
          {SECTIONS.map((s) => (
            <button
              key={s.slug}
              onClick={() => setFiltro({ ...filtro, seccion: s.slug })}
              className="pastilla !px-3.5 !py-1.5 transition"
              style={filtro.seccion === s.slug ? { background: s.color, color: '#fff' } : { background: s.tint, color: s.color }}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {!datos ? (
        <Cargando />
      ) : (
        <div className="hoja overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-lino bg-arena/50 text-xs uppercase tracking-wider text-tinta-3">
                <tr>
                  <th className="px-5 py-3 font-semibold">Material</th>
                  <th className="px-3 py-3 font-semibold">Área</th>
                  <th className="px-3 py-3 font-semibold">Tipo</th>
                  <th className="px-3 py-3 font-semibold">Acceso</th>
                  <th className="px-3 py-3 font-semibold">Contenido</th>
                  <th className="px-3 py-3 font-semibold">Actualizado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {lista.map((m) => {
                  const s = sectionBySlug(m.section)
                  return (
                    <tr key={m.id} className="group border-b border-lino/70 transition-colors last:border-0 hover:bg-arena/40">
                      <td className="max-w-md px-5 py-4">
                        <button onClick={() => setEditando(m)} className="text-left">
                          <span className="flex items-center gap-2 font-semibold text-tinta group-hover:text-terracota-700">
                            {!m.published && <EyeOff size={14} className="text-tinta-3" title="Oculto" />}
                            {m.title}
                          </span>
                          <span className="mt-0.5 line-clamp-1 text-xs text-tinta-3">{m.summary}</span>
                        </button>
                      </td>
                      <td className="px-3 py-4">
                        <span className="pastilla" style={{ background: s?.tint, color: s?.color }}>
                          {s?.name}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-tinta-2">
                        <span className="flex items-center gap-1.5">
                          {m.kind === 'digital' ? <MousePointerClick size={14} /> : <FileText size={14} />}
                          {m.kind === 'digital' ? 'Digital' : 'Físico'}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`pastilla ${m.access === 'demo' ? 'bg-mostaza-100 text-mostaza-700' : 'bg-tinta text-papel'}`}>{m.access === 'demo' ? 'Demo' : 'Premium'}</span>
                      </td>
                      <td className="px-3 py-4 text-xs text-tinta-2">
                        <span className="flex flex-wrap gap-x-3 gap-y-1">
                          {m.page_count > 0 && <span>{m.page_count} pág.</span>}
                          {m.interactive_key && <span>Interactivo</span>}
                          {m.embed_url && <span>Enlace</span>}
                          {m.has_file && (
                            <span className="flex items-center gap-1">
                              <Paperclip size={12} /> Fichero
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-xs text-tinta-3">{formatDate(m.updated_at, { day: 'numeric', month: 'short' })}</td>
                      <td className="px-5 py-4">
                        <span className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                          <button onClick={() => setEditando(m)} className="rounded-full p-2 hover:bg-lino" aria-label={`Editar ${m.title}`}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => borrar(m)} className="rounded-full p-2 hover:bg-terracota-100 hover:text-terracota-700" aria-label={`Borrar ${m.title}`}>
                            <Trash2 size={15} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {lista.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-tinta-3">
                      No hay materiales con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Panel abierto={editando !== null} onCerrar={() => setEditando(null)} titulo={editando?.id ? 'Editar material' : 'Nuevo material'}>
        {editando !== null && datos && (
          <MaterialForm
            material={editando}
            seccionInicial={filtro.seccion}
            interactivos={datos.interactive_keys}
            maxMb={datos.max_upload_mb}
            onGuardado={guardado}
            onCancelar={() => setEditando(null)}
          />
        )}
      </Panel>
    </div>
  )
}
