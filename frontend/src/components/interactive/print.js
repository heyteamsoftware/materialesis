/** Abre una ventana con HTML listo para imprimir (planificador, cartel). */
export function imprimir(titulo, cuerpo, estilos = '') {
  const w = window.open('', '_blank', 'width=900,height=1000')
  if (!w) return false
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(titulo)}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box}body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;color:#1e2a36}h1,h2,h3{font-family:Fraunces,serif;font-weight:500}${estilos}</style>
</head><body>${cuerpo}<script>document.fonts.ready.then(()=>setTimeout(()=>window.print(),250))<\/script></body></html>`)
  w.document.close()
  return true
}

export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
