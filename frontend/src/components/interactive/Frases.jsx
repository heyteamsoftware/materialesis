import { useEffect, useState } from 'react'
import { Volume2, Hand, HeartPulse, FileText, Siren, Home } from 'lucide-react'

const IDIOMAS = [
  { k: 'en', label: 'English', voz: 'en-GB' },
  { k: 'fr', label: 'Français', voz: 'fr-FR' },
  { k: 'ar', label: 'العربية', voz: 'ar-SA', rtl: true },
  { k: 'ro', label: 'Română', voz: 'ro-RO' },
]

const CATEGORIAS = [
  {
    k: 'acogida',
    label: 'Acogida',
    icon: Hand,
    frases: [
      { es: 'Bienvenido. Estamos aquí para ayudarte.', en: 'Welcome. We are here to help you.', fr: 'Bienvenue. Nous sommes là pour vous aider.', ar: 'مرحبًا بك. نحن هنا لمساعدتك.', ro: 'Bine ai venit. Suntem aici să te ajutăm.' },
      { es: '¿Cómo te llamas?', en: 'What is your name?', fr: 'Comment vous appelez-vous ?', ar: 'ما اسمك؟', ro: 'Cum te numești?' },
      { es: '¿Necesitas un intérprete?', en: 'Do you need an interpreter?', fr: 'Avez-vous besoin d’un interprète ?', ar: 'هل تحتاج إلى مترجم؟', ro: 'Ai nevoie de un interpret?' },
      { es: 'Habla despacio, por favor.', en: 'Please speak slowly.', fr: 'Parlez lentement, s’il vous plaît.', ar: 'تكلم ببطء من فضلك.', ro: 'Vorbește rar, te rog.' },
    ],
  },
  {
    k: 'salud',
    label: 'Salud',
    icon: HeartPulse,
    frases: [
      { es: '¿Te duele algo?', en: 'Are you in pain?', fr: 'Avez-vous mal quelque part ?', ar: 'هل تشعر بألم؟', ro: 'Te doare ceva?' },
      { es: 'Vamos al centro de salud.', en: 'Let’s go to the health centre.', fr: 'Allons au centre de santé.', ar: 'لنذهب إلى المركز الصحي.', ro: 'Mergem la centrul medical.' },
      { es: '¿Tomas alguna medicación?', en: 'Do you take any medication?', fr: 'Prenez-vous des médicaments ?', ar: 'هل تتناول أي دواء؟', ro: 'Iei vreun medicament?' },
    ],
  },
  {
    k: 'tramites',
    label: 'Trámites',
    icon: FileText,
    frases: [
      { es: 'Necesitamos tu pasaporte o documento de identidad.', en: 'We need your passport or ID document.', fr: 'Nous avons besoin de votre passeport ou pièce d’identité.', ar: 'نحتاج إلى جواز سفرك أو وثيقة هويتك.', ro: 'Avem nevoie de pașaport sau act de identitate.' },
      { es: 'Tienes una cita el lunes a las diez.', en: 'You have an appointment on Monday at ten.', fr: 'Vous avez un rendez-vous lundi à dix heures.', ar: 'لديك موعد يوم الاثنين الساعة العاشرة.', ro: 'Ai o programare luni la ora zece.' },
      { es: 'Firma aquí, por favor.', en: 'Please sign here.', fr: 'Signez ici, s’il vous plaît.', ar: 'وقّع هنا من فضلك.', ro: 'Semnează aici, te rog.' },
    ],
  },
  {
    k: 'vivienda',
    label: 'Vivienda',
    icon: Home,
    frases: [
      { es: '¿Tienes un lugar donde dormir esta noche?', en: 'Do you have a place to sleep tonight?', fr: 'Avez-vous un endroit où dormir ce soir ?', ar: 'هل لديك مكان تنام فيه الليلة؟', ro: 'Ai unde să dormi în seara asta?' },
      { es: '¿Cuántas personas vivís en casa?', en: 'How many people live in your home?', fr: 'Combien de personnes vivent chez vous ?', ar: 'كم شخصًا يعيش في منزلك؟', ro: 'Câte persoane locuiți în casă?' },
    ],
  },
  {
    k: 'urgencia',
    label: 'Urgencia',
    icon: Siren,
    frases: [
      { es: 'Estás a salvo aquí.', en: 'You are safe here.', fr: 'Vous êtes en sécurité ici.', ar: 'أنت في أمان هنا.', ro: 'Ești în siguranță aici.' },
      { es: 'Si es una emergencia, llama al 112.', en: 'If it is an emergency, call 112.', fr: 'En cas d’urgence, appelez le 112.', ar: 'في حالة الطوارئ، اتصل بالرقم 112.', ro: 'Dacă este o urgență, sună la 112.' },
    ],
  },
]

export default function Frases({ color, tint }) {
  const [idioma, setIdioma] = useState(IDIOMAS[0])
  const [cat, setCat] = useState(CATEGORIAS[0])
  const [hablando, setHablando] = useState(null)
  const [voces, setVoces] = useState([])
  const soportado = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!soportado) return
    const cargar = () => setVoces(window.speechSynthesis.getVoices())
    cargar()
    window.speechSynthesis.addEventListener('voiceschanged', cargar)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', cargar)
      window.speechSynthesis.cancel()
    }
  }, [soportado])

  const hayVoz = (lang) => voces.some((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)))

  const hablar = (texto, lang, id) => {
    if (!soportado) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = lang
    u.rate = 0.88
    const voz = voces.find((v) => v.lang === lang) || voces.find((v) => v.lang?.startsWith(lang.slice(0, 2)))
    if (voz) u.voice = voz
    u.onend = () => setHablando(null)
    u.onerror = () => setHablando(null)
    setHablando(id)
    window.speechSynthesis.speak(u)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Situación">
          {CATEGORIAS.map((c) => (
            <button
              key={c.k}
              role="tab"
              aria-selected={cat.k === c.k}
              onClick={() => setCat(c)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${cat.k === c.k ? 'bg-tinta text-papel shadow-suave' : 'bg-arena text-tinta-2 hover:text-tinta'}`}
            >
              <c.icon size={15} /> {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="fr-idioma" className="text-sm text-tinta-2">
            Traducir a
          </label>
          <select id="fr-idioma" className="campo !w-auto !py-2" value={idioma.k} onChange={(e) => setIdioma(IDIOMAS.find((i) => i.k === e.target.value))}>
            {IDIOMAS.map((i) => (
              <option key={i.k} value={i.k}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ul key={cat.k + idioma.k} className="mt-8 grid gap-4 md:grid-cols-2">
        {cat.frases.map((f, i) => {
          const id = `${cat.k}-${i}`
          return (
            <li key={id} className="animate-aparece overflow-hidden rounded-[1.4rem] bg-papel shadow-suave transition-shadow duration-500 hover:shadow-flota" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-start justify-between gap-3 p-5">
                <p className="font-serif text-xl leading-snug">{f.es}</p>
                <button onClick={() => hablar(f.es, 'es-ES', `${id}-es`)} disabled={!soportado} className="shrink-0 rounded-full p-2 text-tinta-3 transition hover:bg-arena hover:text-tinta disabled:opacity-30" aria-label="Escuchar en castellano">
                  <Volume2 size={18} className={hablando === `${id}-es` ? 'animate-pulse text-tinta' : ''} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 p-5" style={{ background: tint }} dir={idioma.rtl ? 'rtl' : 'ltr'}>
                <p className={`leading-snug ${idioma.rtl ? 'text-2xl' : 'text-lg'}`} lang={idioma.k} style={{ color }}>
                  {f[idioma.k]}
                </p>
                <button
                  onClick={() => hablar(f[idioma.k], idioma.voz, `${id}-${idioma.k}`)}
                  disabled={!soportado}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-suave transition-transform duration-300 hover:scale-110 disabled:opacity-40"
                  style={{ background: color }}
                  aria-label={`Escuchar en ${idioma.label}`}
                >
                  <Volume2 size={18} className={hablando === `${id}-${idioma.k}` ? 'animate-pulse' : ''} />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      <p className="mt-6 text-xs text-tinta-3">
        {!soportado
          ? 'Tu navegador no permite reproducir audio con síntesis de voz.'
          : voces.length > 0 && !hayVoz(idioma.voz)
            ? `Tu dispositivo no tiene voz instalada para ${idioma.label}; puede sonar con otro acento. Muestra el texto en pantalla como apoyo.`
            : 'El audio usa las voces de tu dispositivo. Muestra también el texto: la lectura apoya la comprensión.'}
      </p>
    </div>
  )
}
