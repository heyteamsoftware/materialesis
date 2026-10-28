// Las 7 áreas de la biblioteca. El color identifica cada área en toda la web.
export const SECTIONS = [
  {
    slug: 'contexto',
    name: 'Contexto',
    long: 'Contexto de la intervención social',
    blurb: 'Leer el territorio, sus redes y sus políticas antes de intervenir.',
    color: '#c2643f',
    tint: '#f6e2d6',
  },
  {
    slug: 'inmersion',
    name: 'Inmersión',
    long: 'Inmersión en el servicio',
    blurb: 'Primeros pasos en el servicio y el grupo: observar, acoger, escuchar.',
    color: '#56694f',
    tint: '#e3e9dc',
  },
  {
    slug: 'fol',
    name: 'FOL',
    long: 'Formación y Orientación Laboral',
    blurb: 'Itinerarios de inserción, competencias y búsqueda activa de empleo.',
    color: '#9a6f17',
    tint: '#f6e9c9',
  },
  {
    slug: 'metodologia',
    name: 'Metodología',
    long: 'Metodología de la intervención',
    blurb: 'Diseñar, planificar y evaluar proyectos y sesiones con rigor.',
    color: '#22344a',
    tint: '#dde3ea',
  },
  {
    slug: 'promocion',
    name: 'Promoción',
    long: 'Promoción de la autonomía y la participación',
    blurb: 'Autonomía personal, salud y participación comunitaria.',
    color: '#7a4b5c',
    tint: '#eedfe3',
  },
  {
    slug: 'mediacion',
    name: 'Mediación',
    long: 'Mediación comunitaria',
    blurb: 'Gestionar conflictos, escuchar y construir acuerdos.',
    color: '#3f6e6b',
    tint: '#dbe8e6',
  },
  {
    slug: 'apoyo-idiomatico',
    name: 'Apoyo idiomático',
    long: 'Apoyo idiomático e intercultural',
    blurb: 'Comunicarse desde el primer día: idiomas, pictogramas y acogida.',
    color: '#a1702f',
    tint: '#f2e4cf',
  },
]

export const sectionBySlug = (slug) => SECTIONS.find((s) => s.slug === slug)
export const sectionNumber = (slug) => String(SECTIONS.findIndex((s) => s.slug === slug) + 1).padStart(2, '0')

export const KIND_LABEL = { fisico: 'Material físico', digital: 'Material digital' }
