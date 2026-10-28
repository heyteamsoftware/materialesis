import { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, Printer, Trash2 } from 'lucide-react'
import { imprimir, escapeHtml } from './print'

const PALETA = ['#c2643f', '#56694f', '#d9a441', '#22344a', '#7a4b5c', '#3f6e6b', '#a1702f']

const INICIAL = {
  titulo: 'Taller de habilidades sociales · Sesión 3',
  grupo: '12 jóvenes de 16 a 18 años',
  objetivo: 'Practicar la escucha activa en conversaciones cotidianas.',
  duracion: 60,
  fases: [
    { id: 1, nombre: 'Acogida y rueda de emociones', minutos: 10, detalle: 'Cada persona elige una carta de emoción y explica por qué.', material: 'Cartas de emociones' },
    { id: 2, nombre: 'Dinámica «el teléfono roto»', minutos: 15, detalle: 'Reflexión sobre cómo se distorsiona un mensaje.', material: '' },
    { id: 3, nombre: 'Role-playing por parejas', minutos: 20, detalle: 'Una persona cuenta un problema y la otra practica parafrasear.', material: 'Tarjetas de situaciones' },
    { id: 4, nombre: 'Cierre y evaluación', minutos: 10, detalle: 'Diana de evaluación y compromiso para la semana.', material: 'Diana en papel continuo' },
  ],
}

export default function Planificador() {
  const [s, setS] = useState(INICIAL)
  const total = s.fases.reduce((a, f) => a + (Number(f.minutos) || 0), 0)
  const exceso = total - s.duracion
  const escala = Math.max(total, s.duracion) || 1

  const setFase = (id, campo, valor) => setS({ ...s, fases: s.fases.map((f) => (f.id === id ? { ...f, [campo]: valor } : f)) })
  const mover = (i, d) => {
    const fases = [...s.fases]
    const j = i + d
    if (j < 0 || j >= fases.length) return
    ;[fases[i], fases[j]] = [fases[j], fases[i]]
    setS({ ...s, fases })
  }
  const anadir = () => setS({ ...s, fases: [...s.fases, { id: Date.now(), nombre: 'Nueva fase', minutos: 10, detalle: '', material: '' }] })
  const quitar = (id) => setS({ ...s, fases: s.fases.filter((f) => f.id !== id) })

  const onImprimir = () => {
    let minuto = 0
    const filas = s.fases
      .map((f, i) => {
        const desde = minuto
        minuto += Number(f.minutos) || 0
        return `<tr><td class="t">${desde}'–${minuto}'</td><td><span class="dot" style="background:${PALETA[i % PALETA.length]}"></span><strong>${escapeHtml(f.nombre)}</strong><br><span class="d">${escapeHtml(f.detalle)}</span></td><td>${escapeHtml(f.material)}</td></tr>`
      })
      .join('')
    imprimir(
      s.titulo,
      `<main><p class="k">Guion de sesión</p><h1>${escapeHtml(s.titulo)}</h1>
       <p><strong>Grupo:</strong> ${escapeHtml(s.grupo)} · <strong>Duración:</strong> ${total} min</p>
       <p><strong>Objetivo:</strong> ${escapeHtml(s.objetivo)}</p>
       <table><thead><tr><th>Tiempo</th><th>Fase</th><th>Material</th></tr></thead><tbody>${filas}</tbody></table>
       <h3>Observaciones</h3><div class="l"></div><div class="l"></div><div class="l"></div></main>`,
      `main{max-width:760px;margin:40px auto;padding:0 24px}.k{text-transform:uppercase;letter-spacing:.14em;font-size:11px;color:#9c4a2a;font-weight:700}
       h1{font-size:30px;margin:6px 0 14px}table{width:100%;border-collapse:collapse;margin-top:24px;font-size:14px}
       th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#7d8086;border-bottom:2px solid #1e2a36;padding:8px}
       td{padding:12px 8px;border-bottom:1px solid #e8decc;vertical-align:top}.t{white-space:nowrap;font-family:Fraunces,serif}
       .d{color:#4b5561;font-size:13px}.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px}
       .l{border-bottom:1px dashed #c4b59c;height:30px}`,
    )
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div>
          <label className="campo-label" htmlFor="pl-t">Título de la sesión</label>
          <input id="pl-t" className="campo" value={s.titulo} onChange={(e) => setS({ ...s, titulo: e.target.value })} />
        </div>
        <div>
          <label className="campo-label" htmlFor="pl-d">Tiempo disponible (min)</label>
          <input id="pl-d" type="number" min="5" max="600" className="campo" value={s.duracion} onChange={(e) => setS({ ...s, duracion: Math.max(0, Number(e.target.value)) })} />
        </div>
        <div>
          <label className="campo-label" htmlFor="pl-g">Grupo</label>
          <input id="pl-g" className="campo" value={s.grupo} onChange={(e) => setS({ ...s, grupo: e.target.value })} />
        </div>
        <div>
          <label className="campo-label" htmlFor="pl-o">Objetivo</label>
          <input id="pl-o" className="campo" value={s.objetivo} onChange={(e) => setS({ ...s, objetivo: e.target.value })} />
        </div>
      </div>

      {/* Línea de tiempo */}
      <div>
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold">Reparto del tiempo</span>
          <span className={exceso > 0 ? 'font-semibold text-terracota-700' : exceso < 0 ? 'text-tinta-2' : 'font-semibold text-salvia-700'}>
            {total} de {s.duracion} min {exceso > 0 ? `· te pasas ${exceso} min` : exceso < 0 ? `· sobran ${-exceso} min` : '· ¡encaja!'}
          </span>
        </div>
        <div className="relative mt-3 flex h-12 overflow-hidden rounded-2xl bg-lino">
          {s.fases.map((f, i) => (
            <div
              key={f.id}
              className="flex items-center justify-center overflow-hidden border-r-2 border-papel px-1 text-xs font-semibold text-white transition-all duration-500 ease-suave last:border-r-0"
              style={{ width: `${((Number(f.minutos) || 0) / escala) * 100}%`, background: PALETA[i % PALETA.length] }}
              title={`${f.nombre}: ${f.minutos} min`}
            >
              <span className="truncate">{f.minutos}′</span>
            </div>
          ))}
          {exceso > 0 && <div className="absolute inset-y-0 border-l-2 border-dashed border-tinta" style={{ left: `${(s.duracion / escala) * 100}%` }} />}
        </div>
      </div>

      {/* Fases */}
      <ol className="grid gap-3">
        {s.fases.map((f, i) => (
          <li key={f.id} className="grid gap-3 rounded-2xl border border-lino-2 bg-papel p-4 transition-shadow duration-300 hover:shadow-suave sm:grid-cols-[auto_1fr_auto]">
            <span className="hidden h-9 w-9 place-items-center rounded-full font-serif text-white sm:grid" style={{ background: PALETA[i % PALETA.length] }}>
              {i + 1}
            </span>
            <div className="grid gap-2 sm:grid-cols-[1fr_6rem]">
              <input className="campo !py-2 font-semibold" value={f.nombre} onChange={(e) => setFase(f.id, 'nombre', e.target.value)} aria-label="Nombre de la fase" />
              <div className="relative">
                <input type="number" min="0" max="300" className="campo !py-2 pr-10" value={f.minutos} onChange={(e) => setFase(f.id, 'minutos', Math.max(0, Number(e.target.value)))} aria-label="Minutos" />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tinta-3">min</span>
              </div>
              <input className="campo !py-2 text-sm" placeholder="Qué se hace" value={f.detalle} onChange={(e) => setFase(f.id, 'detalle', e.target.value)} aria-label="Descripción" />
              <input className="campo !py-2 text-sm" placeholder="Material" value={f.material} onChange={(e) => setFase(f.id, 'material', e.target.value)} aria-label="Material" />
            </div>
            <div className="flex gap-1 sm:flex-col">
              <button onClick={() => mover(i, -1)} disabled={i === 0} className="rounded-full p-2 text-tinta-2 hover:bg-arena disabled:opacity-30" aria-label="Subir">
                <ArrowUp size={16} />
              </button>
              <button onClick={() => mover(i, 1)} disabled={i === s.fases.length - 1} className="rounded-full p-2 text-tinta-2 hover:bg-arena disabled:opacity-30" aria-label="Bajar">
                <ArrowDown size={16} />
              </button>
              <button onClick={() => quitar(f.id)} className="rounded-full p-2 text-tinta-2 hover:bg-terracota-100 hover:text-terracota-700" aria-label="Eliminar fase">
                <Trash2 size={16} />
              </button>
            </div>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap gap-3">
        <button onClick={anadir} className="btn btn-claro btn-sm" disabled={s.fases.length >= 12}>
          <Plus size={16} /> Añadir fase
        </button>
        <button onClick={onImprimir} className="btn btn-primario btn-sm">
          <Printer size={16} /> Imprimir guion
        </button>
      </div>
    </div>
  )
}
