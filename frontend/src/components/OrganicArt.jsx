/**
 * Ilustración de portada: formas orgánicas, una ficha de papel y dos trazos
 * que se entrelazan. Todo vectorial y en la paleta de la marca.
 */
export function ArteHero({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 560 560" className="h-auto w-full" role="img" aria-label="Composición de formas cálidas con una ficha de trabajo">
        <defs>
          <pattern id="rayado" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#9c4a2a" strokeOpacity=".22" strokeWidth="2" />
          </pattern>
          <filter id="sombra" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#3c2814" floodOpacity=".2" />
          </filter>
        </defs>

        {/* Formas de fondo */}
        <path d="M118 112c62-58 176-62 248-22 74 41 118 120 96 206-22 88-112 150-204 150-90 0-170-58-190-140-16-66-12-136 50-194Z" fill="#e7d5bd" />
        <path d="M330 70c58-14 124 20 150 78 30 64 6 132-52 158-60 26-134 4-160-56-28-64 2-164 62-180Z" fill="#c2643f" className="origin-center animate-[latido_9s_ease-in-out_infinite]" />
        <path d="M330 70c58-14 124 20 150 78 30 64 6 132-52 158-60 26-134 4-160-56-28-64 2-164 62-180Z" fill="url(#rayado)" />
        <path d="M70 330c20-50 84-72 136-52 54 20 76 84 52 134-26 52-96 74-148 46-46-26-60-80-40-128Z" fill="#8a9b7e" />
        <circle cx="452" cy="420" r="46" fill="#d9a441" />
        <circle cx="96" cy="150" r="14" fill="#22344a" />

        {/* Ficha de papel */}
        <g filter="url(#sombra)" transform="rotate(-6 280 290)">
          <rect x="176" y="150" width="220" height="290" rx="10" fill="#fffdf8" />
          <rect x="200" y="178" width="96" height="10" rx="5" fill="#1e2a36" />
          <rect x="200" y="198" width="150" height="6" rx="3" fill="#d9ccb6" />
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(0 ${i * 34})`}>
              <rect x="200" y="226" width="16" height="16" rx="4" fill="none" stroke={i < 2 ? '#56694f' : '#c4b59c'} strokeWidth="2" />
              {i < 2 && <path d="M204 234l3.5 3.5 6-7" fill="none" stroke="#56694f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
              <rect x="226" y="230" width={[120, 96, 132, 84][i]} height="7" rx="3.5" fill="#e8decc" />
            </g>
          ))}
          <path d="M200 382c30-10 50 10 80 0s50-10 76 0" fill="none" stroke="#c2643f" strokeWidth="2" strokeLinecap="round" />
          <path d="M200 404c22-6 44 6 70 0" fill="none" stroke="#d9ccb6" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Trazos entrelazados */}
        <path d="M420 238c-40-6-70 20-70 56s30 60 64 60c18 0 32-6 42-16" fill="none" stroke="#1e2a36" strokeWidth="5" strokeLinecap="round" />
        <path d="M470 372c40 4 66-24 64-58s-30-56-62-54c-16 1-30 8-38 18" fill="none" stroke="#fbf8f2" strokeWidth="5" strokeLinecap="round" />
      </svg>

      {/* Notas flotantes */}
      <div className="absolute left-[-2%] top-[12%] hidden animate-[flota_7s_ease-in-out_infinite] rounded-2xl bg-papel px-4 py-3 shadow-flota sm:block">
        <p className="etiqueta text-salvia-700">Demo abierta</p>
        <p className="mt-0.5 font-serif text-[0.95rem]">Ecomapa interactivo</p>
      </div>
      <div className="absolute bottom-[8%] right-[2%] hidden animate-[flota_8s_ease-in-out_1.5s_infinite] rounded-2xl bg-tinta px-4 py-3 text-papel shadow-flota sm:block">
        <p className="etiqueta text-mostaza">Ahorra tiempo</p>
        <p className="mt-0.5 font-serif text-[0.95rem]">Listo para imprimir</p>
      </div>

      <style>{`
        @keyframes flota { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        @keyframes latido { 0%,100% { transform: scale(1) } 50% { transform: scale(1.025) } }
      `}</style>
    </div>
  )
}

/** Forma blanda decorativa para cabeceras de sección. */
export function Mancha({ color = '#c2643f', className = '' }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <path
        fill={color}
        d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z"
      />
    </svg>
  )
}
