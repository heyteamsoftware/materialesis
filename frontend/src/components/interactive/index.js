import { lazy } from 'react'

// Herramientas digitales interactivas. La clave coincide con `interactive_key`
// del material en la base de datos (ver Materials::INTERACTIVE_KEYS en la API).
export const HERRAMIENTAS = {
  ecomapa: lazy(() => import('./Ecomapa')),
  entrevista: lazy(() => import('./Entrevista')),
  competencias: lazy(() => import('./Competencias')),
  planificador: lazy(() => import('./Planificador')),
  cartel: lazy(() => import('./Cartel')),
  'mensajes-yo': lazy(() => import('./MensajesYo')),
  frases: lazy(() => import('./Frases')),
}

export const HERRAMIENTAS_NOMBRES = {
  ecomapa: 'Ecomapa de la red de apoyo',
  entrevista: 'Simulador de primera entrevista',
  competencias: 'Radar de competencias',
  planificador: 'Planificador de sesiones',
  cartel: 'Generador de carteles',
  'mensajes-yo': 'Transformador de mensajes «yo»',
  frases: 'Tarjetas multilingües con audio',
}
