import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, Paperclip, X, FileText, MousePointerClick, Info } from 'lucide-react'
import { api, fileUrl } from '../../lib/api'
import { SECTIONS } from '../../lib/sections'
import { HERRAMIENTAS_NOMBRES } from '../../components/interactive'
import { Campo, Aviso } from '../../components/ui'

function Segmentado({ valor, opciones, onChange, label }) {
  return (
    <div>
      <span className="campo-label">{label}</span>
      <div className="grid grid-flow-col gap-1 rounded-full bg-lino/60 p-1" role="radiogroup" aria-label={label}>
        {opciones.map((o) => (
          <button
            type="button"
            key={o.v}
            role="radio"
            aria-checked={valor === o.v}
            onClick={() => onChange(o.v)}
            className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-all duration-300 ${valor === o.v ? 'bg-papel text-tinta shadow-suave' : 'text-tinta-2 hover:text-tinta'}`}
          >
            {o.icon && <o.icon size={15} />} {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function MaterialForm({ material, seccionInicial, interactivos, maxMb, onGuardado, onCancelar }) {
  const nuevo = !material.id
  const [f, setF] = useState(() => ({
    section: material.section || seccionInicial || SECTIONS[0].slug,
    title: material.title || '',
    summary: material.summary || '',
    kind: material.kind || 'fisico',
    access: material.access || 'premium',
    format: material.format || '',
    duration: material.duration || '',
    audience: material.audience || '',
    position: material.position ?? 50,
    published: material.published ?? true,
    interactive_key: material.interactive_key || '',
    embed_url: material.embed_url || '',
  }))
  // Las imágenes ya guardadas se previsualizan desde la API (el admin tiene acceso)
  const [paginas, setPaginas] = useState(() =>
    (material.raw_pages || []).map((p, i) => (p.type === 'image' ? { ...p, _src: fileUrl(`api/materials/${material.id}/page/${i}`) } : p)),
  )
  const [imagenes, setImagenes] = useState([]) // nuevas, aún sin subir
  const [fichero, setFichero] = useState(null)
  const [quitarFichero, setQuitarFichero] = useState(false)
  const [estado, setEstado] = useState({ enviando: false, error: '', field: '' })

  const previews = useMemo(() => imagenes.map((file) => ({ file, url: URL.createObjectURL(file) })), [imagenes])
  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews])

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const setPagina = (i, k, v) => setPaginas(paginas.map((p, j) => (j === i ? { ...p, [k]: v } : p)))
  const mover = (i, d) => {
    const j = i + d
    if (j < 0 || j >= paginas.length) return
    const copia = [...paginas]
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
    setPaginas(copia)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setEstado({ enviando: true, error: '', field: '' })
    const fd = new FormData()
    Object.entries(f).forEach(([k, v]) => fd.append(k, k === 'published' ? (v ? '1' : '0') : String(v)))
    fd.append('pages_json', JSON.stringify(paginas.map(({ _src, ...p }) => p)))
    imagenes.forEach((img) => fd.append('page_images[]', img))
    if (fichero) fd.append('file', fichero)
    if (quitarFichero) fd.append('remove_file', '1')
    try {
      const d = await api(nuevo ? 'admin/materials' : `admin/materials/${material.id}`, { method: 'POST', form: fd })
      onGuardado(d.material, nuevo)
    } catch (err) {
      setEstado({ enviando: false, error: err.message, field: err.field || '' })
    }
  }
  const fe = (k) => (estado.field === k ? estado.error : '')

  return (
    <form onSubmit={onSubmit} className="grid gap-6 pb-4">
      {estado.error && !['title', 'summary'].includes(estado.field) && <Aviso>{estado.error}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="campo-label" htmlFor="mf-section">
            Área
          </label>
          <select id="mf-section" className="campo" value={f.section} onChange={set('section')}>
            {SECTIONS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Campo label="Orden" name="position" type="number" value={f.position} onChange={set('position')} hint="Menor número = aparece antes" />
      </div>

      <Campo label="Título" name="title" value={f.title} onChange={set('title')} error={fe('title')} maxLength={200} />
      <Campo as="textarea" rows={3} label="Resumen" name="summary" value={f.summary} onChange={set('summary')} error={fe('summary')} maxLength={2000} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Segmentado
          label="Tipo de material"
          valor={f.kind}
          onChange={(kind) => setF({ ...f, kind })}
          opciones={[
            { v: 'fisico', label: 'Físico', icon: FileText },
            { v: 'digital', label: 'Digital', icon: MousePointerClick },
          ]}
        />
        <Segmentado
          label="Acceso"
          valor={f.access}
          onChange={(access) => setF({ ...f, access })}
          opciones={[
            { v: 'demo', label: 'Demo' },
            { v: 'premium', label: 'Premium' },
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Campo label="Formato" name="format" value={f.format} onChange={set('format')} placeholder="Ficha · 4 págs." />
        <Campo label="Duración" name="duration" value={f.duration} onChange={set('duration')} placeholder="45 min" />
        <Campo label="Destinatarios" name="audience" value={f.audience} onChange={set('audience')} placeholder="Grupos" />
      </div>

      {f.kind === 'digital' && (
        <div className="grid gap-4 rounded-2xl bg-arena/70 p-5 sm:grid-cols-2">
          <div>
            <label className="campo-label" htmlFor="mf-int">
              Herramienta interactiva
            </label>
            <select id="mf-int" className="campo" value={f.interactive_key} onChange={set('interactive_key')}>
              <option value="">— Ninguna —</option>
              {interactivos.map((k) => (
                <option key={k} value={k}>
                  {HERRAMIENTAS_NOMBRES[k] || k}
                </option>
              ))}
            </select>
          </div>
          <Campo label="…o enlace para incrustar" name="embed_url" value={f.embed_url} onChange={set('embed_url')} error={fe('embed_url')} placeholder="https://view.genial.ly/…" hint="Genially, H5P, Canva, YouTube… (https)" />
        </div>
      )}

      {/* Páginas del visor */}
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-serif text-xl">Páginas del visor</p>
            <p className="text-xs text-tinta-3">Lo que se ve en el visor web. Para demos físicas usa imágenes o texto (nunca se ofrece descarga).</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-claro btn-sm" onClick={() => setPaginas([...paginas, { type: 'text', title: '', body: '' }])}>
              <Plus size={15} /> Texto
            </button>
            <label className="btn btn-claro btn-sm cursor-pointer">
              <ImagePlus size={15} /> Imágenes
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  setImagenes([...imagenes, ...Array.from(e.target.files || [])])
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>

        {paginas.length === 0 && previews.length === 0 && <p className="rounded-2xl border border-dashed border-lino-2 p-5 text-center text-sm text-tinta-3">Sin páginas todavía.</p>}

        <ol className="grid gap-3">
          {paginas.map((p, i) => (
            <li key={i} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl border border-lino-2 bg-papel p-4">
              {p.type === 'image' ? (
                <div className="flex items-center gap-4">
                  <img src={p._src} alt="" className="h-20 w-16 rounded-md border border-lino object-cover" />
                  <input className="campo !py-2 text-sm" placeholder="Pie de imagen (opcional)" value={p.caption || ''} onChange={(e) => setPagina(i, 'caption', e.target.value)} />
                </div>
              ) : (
                <div className="grid gap-2">
                  <input className="campo !py-2 font-semibold" placeholder={`Título de la página ${i + 1}`} value={p.title} onChange={(e) => setPagina(i, 'title', e.target.value)} />
                  <textarea className="campo font-mono text-[0.82rem]" rows={6} value={p.body} onChange={(e) => setPagina(i, 'body', e.target.value)} />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <span className="text-center font-serif text-xs text-tinta-3">{i + 1}</span>
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-full p-1.5 hover:bg-arena disabled:opacity-30" aria-label="Subir página">
                  <ArrowUp size={15} />
                </button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === paginas.length - 1} className="rounded-full p-1.5 hover:bg-arena disabled:opacity-30" aria-label="Bajar página">
                  <ArrowDown size={15} />
                </button>
                <button type="button" onClick={() => setPaginas(paginas.filter((_, j) => j !== i))} className="rounded-full p-1.5 hover:bg-terracota-100 hover:text-terracota-700" aria-label="Quitar página">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
          {previews.map((p, i) => (
            <li key={p.url} className="flex items-center gap-4 rounded-2xl border border-dashed border-salvia bg-salvia-100/50 p-3">
              <img src={p.url} alt="" className="h-16 w-12 rounded-md object-cover" />
              <span className="flex-1 truncate text-sm">
                {p.file.name} <span className="text-xs text-salvia-700">· nueva, se añadirá al final</span>
              </span>
              <button type="button" onClick={() => setImagenes(imagenes.filter((_, j) => j !== i))} className="rounded-full p-1.5 hover:bg-papel" aria-label="Descartar imagen">
                <X size={15} />
              </button>
            </li>
          ))}
        </ol>
        <details className="text-xs text-tinta-3">
          <summary className="flex cursor-pointer items-center gap-1.5">
            <Info size={13} /> Formato del texto de las páginas
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-arena p-3 font-mono">{'## Subtítulo\n- Viñeta\n[ ] Casilla para marcar\n> Texto destacado\n___   (línea para escribir)'}</pre>
        </details>
      </section>

      {/* Fichero descargable */}
      <section className="rounded-2xl bg-arena/70 p-5">
        <p className="font-serif text-xl">Fichero descargable</p>
        <p className="text-xs text-tinta-3">Solo lo podrán descargar cuentas con licencia activa. PDF, Office, OpenDocument, imagen o ZIP · máx. {maxMb} MB.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {material.file_name && !quitarFichero && !fichero && (
            <span className="flex items-center gap-2 rounded-full bg-papel px-4 py-2 text-sm">
              <Paperclip size={14} /> {material.file_name}
              <button type="button" onClick={() => setQuitarFichero(true)} className="rounded-full p-0.5 hover:bg-lino" aria-label="Quitar fichero">
                <X size={14} />
              </button>
            </span>
          )}
          {fichero && (
            <span className="flex items-center gap-2 rounded-full bg-salvia-100 px-4 py-2 text-sm text-salvia-700">
              <Paperclip size={14} /> {fichero.name}
              <button type="button" onClick={() => setFichero(null)} className="rounded-full p-0.5 hover:bg-papel" aria-label="Descartar fichero">
                <X size={14} />
              </button>
            </span>
          )}
          <label className="btn btn-claro btn-sm cursor-pointer">
            <Paperclip size={15} /> {material.file_name || fichero ? 'Reemplazar' : 'Subir fichero'}
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.docx,.pptx,.xlsx,.odt,.odp,.zip,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file && file.size > maxMb * 1024 * 1024) {
                  setEstado({ ...estado, error: `El fichero supera ${maxMb} MB`, field: '' })
                } else if (file) {
                  setFichero(file)
                  setQuitarFichero(false)
                }
                e.target.value = ''
              }}
            />
          </label>
          {quitarFichero && <span className="text-xs text-terracota-700">Se quitará al guardar</span>}
        </div>
      </section>

      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} className="h-4 w-4 accent-[#c2643f]" />
        Publicado (visible en la zona privada)
      </label>

      <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-lino bg-arena/95 px-6 py-4 backdrop-blur">
        <button type="button" className="btn btn-claro" onClick={onCancelar}>
          Cancelar
        </button>
        <button className="btn btn-primario" disabled={estado.enviando}>
          {estado.enviando ? 'Guardando…' : nuevo ? 'Crear material' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
