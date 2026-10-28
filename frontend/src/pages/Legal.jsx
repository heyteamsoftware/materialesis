import { Link } from 'react-router-dom'
import { Info, Cookie } from 'lucide-react'

const ACTUALIZADO = '28 de octubre de 2026'

function Pagina({ etiqueta, titulo, children }) {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
      <header className="animate-aparece">
        <span className="pastilla bg-mostaza-100 text-mostaza-700">
          <Info size={13} /> Demo · datos ficticios
        </span>
        <p className="etiqueta mt-6 text-terracota-700">{etiqueta}</p>
        <h1 className="mt-3 text-5xl leading-tight sm:text-6xl">{titulo}</h1>
        <p className="mt-3 text-sm text-tinta-3">Última actualización: {ACTUALIZADO}</p>
      </header>
      <div className="mt-12 grid gap-10 leading-relaxed text-tinta-2">{children}</div>
    </div>
  )
}

function Seccion({ n, titulo, children }) {
  return (
    <section className="border-t border-lino-2 pt-8">
      <h2 className="text-2xl text-tinta">
        <span className="mr-3 font-serif text-terracota/70">{n}</span>
        {titulo}
      </h2>
      <div className="mt-4 grid gap-4">{children}</div>
    </section>
  )
}

function Tabla({ cabeceras, filas }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-lino-2 bg-papel">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-lino bg-arena/50 text-xs uppercase tracking-wider text-tinta-3">
          <tr>
            {cabeceras.map((c) => (
              <th key={c} className="px-4 py-3 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, i) => (
            <tr key={i} className="border-b border-lino/70 align-top last:border-0">
              {fila.map((celda, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-semibold text-tinta' : ''}`}>
                  {celda}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Lista({ items }) {
  return (
    <ul className="grid gap-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3">
          <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-terracota" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function Privacidad() {
  return (
    <Pagina etiqueta="Privacidad" titulo="Política de privacidad">
      <p className="rounded-2xl bg-arena/70 p-5 text-tinta">
        Esta web es una <strong>demostración</strong>. El responsable, las direcciones de contacto y todos los registros de ejemplo son{' '}
        <strong>ficticios</strong>. No entran personas reales ni se trata información de nadie. Si algún día se usara con datos reales, este
        texto debería revisarse con asesoramiento jurídico.
      </p>

      <Seccion n="01" titulo="Responsable del tratamiento">
        <p>
          Proyecto de demostración «Materiales de Apoyo a la Intervención Social». Dirección ficticia: Calle Ejemplo, 1 · 00000 Ciudad Demo. Contacto de
          demostración: <span className="font-mono text-sm">privacidad@example.com</span>. No hay delegado de protección de datos designado.
        </p>
      </Seccion>

      <Seccion n="02" titulo="Qué datos tratamos">
        <Tabla
          cabeceras={['Colectivo', 'Datos', 'De dónde salen']}
          filas={[
            ['Cuenta', 'Nombre, nombre de usuario, email y contraseña (guardada cifrada, nunca en texto claro).', 'Tú, al registrarte'],
            ['Licencia y pagos', 'Fechas de activación y de fin de la licencia, importe, método elegido (tarjeta o Bizum) y referencia.', 'Se generan al pagar'],
            ['Opiniones', 'Nombre con el que firmas, perfil opcional, valoración, texto y área.', 'Tú'],
            ['Contacto', 'Nombre, email, asunto y mensaje.', 'Tú'],
            ['Técnicos', 'Dirección IP, solo para contar intentos de acceso fallidos. Cookie de sesión.', 'Automático'],
          ]}
        />
        <Nota>No pedimos ni guardamos datos bancarios. Los pagos son una simulación y no se cobra nada.</Nota>
      </Seccion>

      <Seccion n="03" titulo="Para qué los usamos y por qué">
        <Tabla
          cabeceras={['Finalidad', 'Base legal (RGPD)']}
          filas={[
            ['Crear tu cuenta y darte acceso a los materiales', 'Ejecutar el servicio que solicitas (art. 6.1.b)'],
            ['Gestionar licencias y registrar pagos simulados', 'Ejecución del servicio y registro de operaciones (art. 6.1.b y 6.1.c)'],
            ['Publicar opiniones y responder a mensajes de contacto', 'Tu consentimiento (art. 6.1.a), que puedes retirar en cualquier momento'],
            ['Limitar intentos de acceso indebidos y el envío de spam', 'Interés legítimo en proteger el servicio (art. 6.1.f)'],
          ]}
        />
      </Seccion>

      <Seccion n="04" titulo="Cuánto tiempo los conservamos">
        <Lista
          items={[
            'Cuenta: mientras exista. Puedes pedir su borrado.',
            'Intentos de acceso fallidos: 15 minutos.',
            'Sesión: hasta 14 días desde el último inicio de sesión.',
            'Mensajes de contacto y opiniones: hasta que se gestionen o pidas su borrado.',
            'Registros de pago: sirven de justificante de cada operación. Si se borra la cuenta, el registro conserva el nombre para poder justificarlo.',
            'Opiniones publicadas: si se borra la cuenta, siguen visibles pero firmadas como «Usuario eliminado».',
          ]}
        />
      </Seccion>

      <Seccion n="05" titulo="Quién tiene acceso a los datos">
        <p>
          No vendemos ni cedemos datos a terceros. La web no incluye servicios de analítica, publicidad ni redes sociales, y las tipografías se sirven
          desde este mismo sitio. Los datos se alojan en un servidor de demostración del responsable.
        </p>
      </Seccion>

      <Seccion n="06" titulo="Cómo los protegemos">
        <Lista
          items={[
            'Conexión cifrada (HTTPS) y contraseñas almacenadas de forma cifrada.',
            'Límite de intentos de acceso y protección frente a envíos de formularios desde otras webs.',
            'Los ficheros internos (base de datos, configuración y subidas) no son accesibles desde el navegador.',
          ]}
        />
      </Seccion>

      <Seccion n="07" titulo="Tus derechos">
        <p>
          Puedes pedir acceder a tus datos, corregirlos, borrarlos, limitar su uso, oponerte a ciertos tratamientos y recibirlos en un formato
          portable. También puedes retirar tu consentimiento en cualquier momento. Para ejercerlos, escribe a la dirección de contacto indicando tu
          nombre de usuario.
        </p>
        <p>
          Si consideras que no atendemos bien tus derechos, puedes presentar una reclamación ante la autoridad de control. En España, la Agencia
          Española de Protección de Datos (aepd.es).
        </p>
      </Seccion>

      <Seccion n="08" titulo="Menores y cambios">
        <p>
          La web está pensada para profesionales de la intervención social y no para menores de 14 años. Si cambiamos esta política, actualizaremos la
          fecha de arriba.
        </p>
        <p>
          Consulta también la <Link to="/cookies" className="enlace font-semibold text-tinta">política de cookies</Link>.
        </p>
      </Seccion>
    </Pagina>
  )
}

export function Cookies() {
  return (
    <Pagina etiqueta="Cookies" titulo="Política de cookies">
      <p className="rounded-2xl bg-arena/70 p-5 text-tinta">
        Esta web es una <strong>demostración</strong>. Usa solo lo imprescindible para funcionar. Todo lo que aparece aquí es real en el código, pero
        no hay ningún tratamiento de datos de personas reales.
      </p>

      <Seccion n="01" titulo="Qué cookies y almacenamiento usamos">
        <Tabla
          cabeceras={['Nombre', 'Tipo', 'Para qué', 'Duración', 'Quién']}
          filas={[
            ['mis_session', 'Técnica y necesaria', 'Mantiene tu sesión iniciada. Solo se crea al entrar en tu cuenta.', 'Hasta 14 días', 'Esta web'],
            [
              'mis_cookies_visto',
              'Técnica (almacenamiento local, no es una cookie)',
              'Recuerda que ya has leído el aviso de cookies. No contiene datos personales.',
              'Hasta que borres los datos del sitio',
              'Esta web',
            ],
          ]}
        />
      </Seccion>

      <Seccion n="02" titulo="Lo que no usamos">
        <Lista
          items={[
            'Cookies de publicidad ni de seguimiento entre webs.',
            'Analítica de visitas ni herramientas de terceros.',
            'Cookies de redes sociales.',
          ]}
        />
      </Seccion>

      <Seccion n="03" titulo="Consentimiento">
        <p>
          Como solo usamos cookies técnicas imprescindibles para el servicio que pides, no necesitamos tu consentimiento para ellas. El aviso que ves
          en la web es informativo.
        </p>
      </Seccion>

      <Seccion n="04" titulo="Cómo borrarlas o bloquearlas">
        <p>
          Puedes borrarlas o bloquearlas desde los ajustes de tu navegador. Ten en cuenta que si bloqueas la cookie de sesión, no podrás iniciar sesión
          en tu cuenta.
        </p>
        <p className="flex items-start gap-3 rounded-2xl bg-papel p-5 text-sm">
          <Cookie size={18} className="mt-0.5 shrink-0 text-terracota" />
          Más detalles sobre tus datos personales en la <Link to="/privacidad" className="enlace font-semibold text-tinta">política de privacidad</Link>.
        </p>
      </Seccion>
    </Pagina>
  )
}
