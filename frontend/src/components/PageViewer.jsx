import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { fileUrl } from '../lib/api'

/**
 * Interpreta el texto sencillo de una página:
 *   ## Subtítulo · - viñeta · [ ] casilla · > destacado · ___ líneas para escribir
 */
function TextoPagina({ body, color }) {
  const lines = (body || '').split('\n')
  const out = []
  let lista = []
  const cerrarLista = () => {
    if (lista.length) {
      out.push(
        <ul key={`l${out.length}`} className="my-2 grid gap-1.5 pl-1">
          {lista}
        </ul>,
      )
      lista = []
    }
  }
  lines.forEach((raw, i) => {
    const line = raw.trimEnd()
    if (line.startsWith('- ')) {
      lista.push(
        <li key={i} className="flex gap-2.5">
          <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color }} />
          <span>{line.slice(2)}</span>
        </li>,
      )
      return
    }
    cerrarLista()
    if (line.startsWith('## ')) {
      out.push(
        <h4 key={i} className="mb-1 mt-4 font-serif text-[1.08em] font-semibold first:mt-0" style={{ color }}>
          {line.slice(3)}
        </h4>,
      )
    } else if (line.startsWith('[ ] ')) {
      out.push(
        <p key={i} className="my-1 flex items-start gap-2.5">
          <span className="mt-[0.2em] h-[1.05em] w-[1.05em] shrink-0 rounded-[4px] border-[1.5px]" style={{ borderColor: color }} />
          <span>{line.slice(4)}</span>
        </p>,
      )
    } else if (line.startsWith('> ')) {
      out.push(
        <p key={i} className="my-3 rounded-lg px-3.5 py-2.5 text-[0.95em] italic" style={{ background: `${color}14`, borderLeft: `3px solid ${color}` }}>
          {line.slice(2)}
        </p>,
      )
    } else if (/^_{3,}$/.test(line.trim())) {
      out.push(<div key={i} className="my-2 h-[1.6em] border-b border-dashed border-[#cbbfa9]" />)
    } else if (line.trim() === '') {
      out.push(<div key={i} className="h-2" />)
    } else {
      out.push(
        <p key={i} className="my-1">
          {line}
        </p>,
      )
    }
  })
  cerrarLista()
  return <>{out}</>
}

/** Una página: texto maquetado como ficha o imagen subida. */
function Folio({ page, color, numero, total, tituloMaterial }) {
  if (page.type === 'image') {
    return (
      <div className="folio">
        <img
          src={fileUrl(page.url)}
          alt={page.caption || `Página ${numero} de ${tituloMaterial}`}
          className="h-full w-full object-contain"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    )
  }
  return (
    <div className="folio flex flex-col p-[7%] text-[clamp(0.62rem,1.55vw,0.92rem)] leading-relaxed text-tinta">
      <div className="flex items-center justify-between border-b pb-[3%]" style={{ borderColor: `${color}55` }}>
        <span className="text-[0.75em] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
          {tituloMaterial}
        </span>
        <span className="text-[0.75em] text-tinta-3">
          {numero}/{total}
        </span>
      </div>
      {page.title && <h3 className="mt-[5%] font-serif text-[1.7em] leading-tight">{page.title}</h3>}
      <div className="mt-[3%] flex-1 overflow-hidden">
        <TextoPagina body={page.body} color={color} />
      </div>
    </div>
  )
}

/**
 * Visor web de materiales físicos. Solo visualización:
 * no ofrece descarga (eso depende de la licencia, fuera del visor).
 */
export default function PageViewer({ pages, color = '#c2643f', titulo, compacto = false, proteger = true }) {
  const [actual, setActual] = useState(0)
  const [grande, setGrande] = useState(false)
  const total = pages.length

  const ir = useCallback((n) => setActual((a) => Math.min(total - 1, Math.max(0, typeof n === 'function' ? n(a) : n))), [total])

  useEffect(() => {
    if (!grande) return
    const onKey = (e) => {
      if (e.key === 'ArrowRight') ir((a) => a + 1)
      if (e.key === 'ArrowLeft') ir((a) => a - 1)
      if (e.key === 'Escape') setGrande(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [grande, ir])

  if (!total) {
    return <p className="rounded-2xl bg-papel p-6 text-sm text-tinta-3">Este material todavía no tiene páginas para el visor.</p>
  }

  const visor = (
    <div
      className={`${proteger ? 'sin-seleccion' : ''} ${grande ? 'fixed inset-0 z-[75] flex flex-col bg-tinta/90 p-4 backdrop-blur-sm sm:p-8' : ''}`}
      onContextMenu={proteger ? (e) => e.preventDefault() : undefined}
    >
      <div
        className={`relative mx-auto w-full ${grande ? 'flex flex-1 items-center justify-center' : ''}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') ir((a) => a + 1)
          if (e.key === 'ArrowLeft') ir((a) => a - 1)
        }}
        tabIndex={0}
        aria-roledescription="visor de páginas"
        aria-label={`${titulo}: página ${actual + 1} de ${total}`}
      >
        <div className={`relative ${grande ? 'h-full max-h-[calc(100vh-9rem)] aspect-[1/1.38]' : compacto ? 'mx-auto max-w-[420px]' : 'mx-auto max-w-[620px]'}`}>
          {pages.map((p, i) => (
            <div
              key={i}
              className={`transition-all duration-500 ease-suave ${i === actual ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'} ${
                i === actual ? 'translate-x-0' : i < actual ? '-translate-x-6' : 'translate-x-6'
              }`}
              aria-hidden={i !== actual}
            >
              <Folio page={p} color={color} numero={i + 1} total={total} tituloMaterial={titulo} />
            </div>
          ))}
          {/* pila de hojas detrás */}
          {total > 1 && (
            <>
              <div className="folio absolute inset-0 -z-10 translate-x-2 translate-y-2 rotate-[1.2deg] opacity-70" />
              <div className="folio absolute inset-0 -z-20 translate-x-4 translate-y-3.5 rotate-[2.4deg] opacity-40" />
            </>
          )}
        </div>
      </div>

      <div className={`mt-6 flex items-center justify-center gap-3 ${grande ? 'text-papel' : ''}`}>
        <button
          onClick={() => ir((a) => a - 1)}
          disabled={actual === 0}
          className={`grid h-10 w-10 place-items-center rounded-full transition ${grande ? 'bg-papel/10 hover:bg-papel/20' : 'bg-papel shadow-suave hover:shadow-flota'} disabled:opacity-30`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Páginas">
          {pages.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === actual}
              aria-label={`Página ${i + 1}`}
              onClick={() => ir(i)}
              className="h-2 rounded-full transition-all duration-500 ease-suave"
              style={{ width: i === actual ? 26 : 8, background: i === actual ? color : grande ? '#fbf8f255' : '#d9ccb6' }}
            />
          ))}
        </div>
        <button
          onClick={() => ir((a) => a + 1)}
          disabled={actual === total - 1}
          className={`grid h-10 w-10 place-items-center rounded-full transition ${grande ? 'bg-papel/10 hover:bg-papel/20' : 'bg-papel shadow-suave hover:shadow-flota'} disabled:opacity-30`}
          aria-label="Página siguiente"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => setGrande((g) => !g)}
          className={`ml-2 grid h-10 w-10 place-items-center rounded-full transition ${grande ? 'bg-papel/10 hover:bg-papel/20' : 'hover:bg-lino'}`}
          aria-label={grande ? 'Salir de pantalla completa' : 'Ver a pantalla completa'}
        >
          {grande ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
      </div>
    </div>
  )

  return visor
}
