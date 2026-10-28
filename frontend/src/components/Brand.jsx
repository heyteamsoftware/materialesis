import { Link } from 'react-router-dom'

/** Dos trazos que se abrazan: apoyo mutuo e integración. */
export function Isotipo({ size = 36, className = '' }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <path d="M26 14c-8.8 0-15 6.9-15 16.5S17.6 49 26.5 49c4.3 0 7.6-1.6 10-4.2" fill="none" stroke="#C2643F" strokeWidth="6" strokeLinecap="round" />
      <path d="M38 50c8.8 0 15-6.9 15-16.5S46.4 15 37.5 15c-4.3 0-7.6 1.6-10 4.2" fill="none" stroke="#56694F" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.6" fill="#D9A441" />
    </svg>
  )
}

export function Logo({ to = '/', compacto = false, claro = false }) {
  return (
    <Link to={to} className="group flex items-center gap-3" aria-label="Materiales de Apoyo a la Intervención Social — inicio">
      <span className="transition-transform duration-700 ease-suave group-hover:rotate-[18deg]">
        <Isotipo size={compacto ? 32 : 38} />
      </span>
      {!compacto && (
        <span className={`leading-[1.05] ${claro ? 'text-papel' : 'text-tinta'}`}>
          <span className="block font-serif text-[1.02rem] font-semibold tracking-tight">Materiales de apoyo</span>
          <span className={`block text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${claro ? 'text-papel/70' : 'text-tinta-3'}`}>
            a la intervención social
          </span>
        </span>
      )}
    </Link>
  )
}

/** Pictogramas de trazo propio para cada área. */
export function Glifo({ slug, size = 28, color = 'currentColor', className = '' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const shapes = {
    contexto: (
      <>
        <circle cx="16" cy="16" r="3" {...p} />
        <path d="M16 6.5a9.5 9.5 0 1 1-9.2 7.1" {...p} />
        <path d="M16 2.5A13.5 13.5 0 1 1 3.4 11" {...p} strokeDasharray="2 3" />
      </>
    ),
    inmersion: (
      <>
        <path d="M4 13c3-2.6 5-2.6 8 0s5 2.6 8 0 5-2.6 8 0" {...p} />
        <path d="M4 19c3-2.6 5-2.6 8 0s5 2.6 8 0 5-2.6 8 0" {...p} />
        <path d="M16 4v6M13.5 7.5 16 10l2.5-2.5" {...p} />
        <path d="M8 25.5c2.6-1.6 4.4-1.6 8 0s5.4 1.6 8 0" {...p} opacity=".5" />
      </>
    ),
    fol: (
      <>
        <path d="M4 26h6v-6h6v-6h6V8h6" {...p} />
        <circle cx="25" cy="4.5" r="1.8" {...p} />
        <path d="M4 26h24" {...p} opacity=".4" />
      </>
    ),
    metodologia: (
      <>
        <circle cx="7" cy="8" r="3" {...p} />
        <circle cx="25" cy="10" r="3" {...p} />
        <circle cx="12" cy="24" r="3" {...p} />
        <path d="M10 8.6l12 1M23.4 12.6 14 21.6M8 11l3 10" {...p} />
      </>
    ),
    promocion: (
      <>
        <path d="M16 28V14" {...p} />
        <path d="M16 17c0-5 3.5-8.5 9-8.5 0 5.5-3.5 8.5-9 8.5Z" {...p} />
        <path d="M16 21c0-4-3-7-7.5-7 0 4.5 3 7 7.5 7Z" {...p} />
        <path d="M10 28h12" {...p} />
      </>
    ),
    mediacion: (
      <>
        <path d="M4 8.5A3.5 3.5 0 0 1 7.5 5h9A3.5 3.5 0 0 1 20 8.5v4a3.5 3.5 0 0 1-3.5 3.5H11l-4 3v-3.2A3.5 3.5 0 0 1 4 12.5Z" {...p} />
        <path d="M23 12.5h1.5A3.5 3.5 0 0 1 28 16v4a3.5 3.5 0 0 1-3 3.5V27l-4-3.5h-5.5A3.5 3.5 0 0 1 12 20v-.5" {...p} />
      </>
    ),
    'apoyo-idiomatico': (
      <>
        <path d="M5 23 10.5 9 16 23M7.2 18h6.6" {...p} />
        <path d="M18 9h9M22.5 6.5V9M25.5 9c-.6 4.5-3 8-6.5 10M20 12.5c1.2 2.8 3.4 5 6.5 6.5" {...p} />
      </>
    ),
  }
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden="true">
      {shapes[slug]}
    </svg>
  )
}
