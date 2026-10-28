import { useState } from 'react'
import { Printer, CalendarDays, MapPin } from 'lucide-react'
import { imprimir, escapeHtml } from './print'

const ESTILOS = {
  terracota: { fondo: '#c2643f', texto: '#fffdf8', acento: '#f6e9c9', forma: '#9c4a2a' },
  salvia: { fondo: '#e3e9dc', texto: '#1e2a36', acento: '#56694f', forma: '#8a9b7e' },
  noche: { fondo: '#22344a', texto: '#fbf8f2', acento: '#d9a441', forma: '#2f4762' },
  arena: { fondo: '#f4ede1', texto: '#1e2a36', acento: '#c2643f', forma: '#e7d5bd' },
}

const INICIAL = {
  antetitulo: 'El barrio se encuentra',
  titulo: 'Merienda intercultural',
  descripcion: 'Trae un plato típico de tu tierra y comparte su historia. Habrá juegos para peques y música en directo.',
  fecha: 'Sábado 15 de noviembre',
  hora: '17:00 – 20:00',
  lugar: 'Plaza del Centro Cívico',
  organiza: 'Asociación vecinal y alumnado de Integración Social',
  estilo: 'terracota',
  gratis: true,
}

function Forma({ color }) {
  return (
    <svg viewBox="0 0 200 200" className="absolute -right-[18%] -top-[12%] w-[75%]" aria-hidden="true">
      <path fill={color} d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z" />
    </svg>
  )
}

export default function Cartel() {
  const [c, setC] = useState(INICIAL)
  const e = ESTILOS[c.estilo]
  const set = (k) => (ev) => setC({ ...c, [k]: ev.target.value })

  const onImprimir = () => {
    imprimir(
      c.titulo,
      `<div class="p"><svg viewBox="0 0 200 200" class="f"><path fill="${e.forma}" d="M44 30c30-26 82-30 116-4 32 24 40 72 22 110-18 40-62 62-104 54C38 182 8 150 6 108 4 76 18 52 44 30Z"/></svg>
        <div class="c"><p class="a">${escapeHtml(c.antetitulo)}</p><h1>${escapeHtml(c.titulo)}</h1><p class="d">${escapeHtml(c.descripcion)}</p>
        <div class="i"><p><b>${escapeHtml(c.fecha)}</b><br>${escapeHtml(c.hora)}</p><p><b>${escapeHtml(c.lugar)}</b></p></div>
        ${c.gratis ? '<span class="g">Actividad gratuita</span>' : ''}<p class="o">${escapeHtml(c.organiza)}</p></div></div>`,
      `@page{size:A4;margin:0}html,body{height:100%}.p{position:relative;overflow:hidden;width:210mm;height:297mm;background:${e.fondo};color:${e.texto};-webkit-print-color-adjust:exact;print-color-adjust:exact}
       .f{position:absolute;right:-40mm;top:-35mm;width:160mm}.c{position:relative;padding:28mm 22mm;height:100%;display:flex;flex-direction:column}
       .a{text-transform:uppercase;letter-spacing:.18em;font-weight:700;font-size:14pt;color:${e.acento};margin:40mm 0 0}
       h1{font-size:58pt;line-height:1;margin:6mm 0 0}.d{font-size:16pt;line-height:1.45;max-width:150mm;margin-top:10mm}
       .i{margin-top:auto;display:flex;gap:16mm;font-size:16pt;border-top:2px solid ${e.acento};padding-top:8mm}
       .g{align-self:flex-start;margin-top:8mm;background:${e.acento};color:${e.fondo};padding:3mm 6mm;border-radius:20mm;font-weight:700;font-size:13pt}
       .o{font-size:11pt;opacity:.8;margin-top:8mm}`,
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
      <div className="grid content-start gap-4">
        <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label="Estilo de color">
          {Object.entries(ESTILOS).map(([k, v]) => (
            <button
              key={k}
              role="radio"
              aria-checked={c.estilo === k}
              aria-label={`Estilo ${k}`}
              onClick={() => setC({ ...c, estilo: k })}
              className={`h-12 rounded-2xl border-2 transition-all duration-300 ${c.estilo === k ? 'scale-105 border-tinta shadow-suave' : 'border-transparent hover:scale-105'}`}
              style={{ background: `linear-gradient(135deg, ${v.fondo} 60%, ${v.acento} 60%)` }}
            />
          ))}
        </div>
        <input className="campo" value={c.antetitulo} onChange={set('antetitulo')} maxLength={40} aria-label="Antetítulo" placeholder="Antetítulo" />
        <input className="campo font-serif text-lg" value={c.titulo} onChange={set('titulo')} maxLength={50} aria-label="Título" placeholder="Título" />
        <textarea className="campo" rows={3} value={c.descripcion} onChange={set('descripcion')} maxLength={200} aria-label="Descripción" />
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="campo" value={c.fecha} onChange={set('fecha')} aria-label="Fecha" placeholder="Fecha" />
          <input className="campo" value={c.hora} onChange={set('hora')} aria-label="Hora" placeholder="Hora" />
        </div>
        <input className="campo" value={c.lugar} onChange={set('lugar')} aria-label="Lugar" placeholder="Lugar" />
        <input className="campo" value={c.organiza} onChange={set('organiza')} aria-label="Organiza" placeholder="Organiza" />
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={c.gratis} onChange={(ev) => setC({ ...c, gratis: ev.target.checked })} className="h-4 w-4 accent-[#c2643f]" />
          Mostrar «Actividad gratuita»
        </label>
        <button onClick={onImprimir} className="btn btn-primario btn-sm justify-self-start">
          <Printer size={16} /> Imprimir cartel A4
        </button>
        <p className="text-xs text-tinta-3">Consejo: textos cortos y letra grande. Un cartel se lee en 3 segundos.</p>
      </div>

      {/* Vista previa */}
      <div className="mx-auto w-full max-w-[420px]">
        <div className="relative aspect-[210/297] overflow-hidden rounded-md shadow-papel transition-colors duration-700" style={{ background: e.fondo, color: e.texto }}>
          <Forma color={e.forma} />
          <div className="relative flex h-full flex-col p-[9%]">
            <p className="mt-[18%] text-[0.68rem] font-bold uppercase tracking-[0.18em]" style={{ color: e.acento }}>
              {c.antetitulo}
            </p>
            <h3 className="mt-2 break-words font-serif text-[clamp(1.7rem,6vw,2.6rem)] leading-[1.02]">{c.titulo || 'Título'}</h3>
            <p className="mt-4 text-[0.82rem] leading-relaxed opacity-90">{c.descripcion}</p>
            <div className="mt-auto grid gap-2 border-t-2 pt-3 text-[0.8rem]" style={{ borderColor: e.acento }}>
              <p className="flex items-start gap-2">
                <CalendarDays size={15} className="mt-0.5 shrink-0" style={{ color: e.acento }} />
                <span>
                  <strong>{c.fecha}</strong> · {c.hora}
                </span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0" style={{ color: e.acento }} />
                <strong>{c.lugar}</strong>
              </p>
            </div>
            {c.gratis && (
              <span className="mt-3 self-start rounded-full px-3 py-1 text-[0.68rem] font-bold" style={{ background: e.acento, color: e.fondo }}>
                Actividad gratuita
              </span>
            )}
            <p className="mt-3 text-[0.62rem] opacity-75">{c.organiza}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
