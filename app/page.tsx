import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import {
  AccessibilityBar,
  SiteHeader,
  PdfDemoCard,
} from '@/components/landing/LandingInteractive'

const problems = [
  {
    emoji: '💊',
    iconWrap: 'bg-amber-100 text-amber-700',
    title: 'El médico te recetó algo que no debía',
    description:
      'Muchos médicos recetan sin saber qué otros medicamentos toma el paciente. Esto puede ser peligroso. Con VidaRecord, llegas con la lista completa y el médico sabe exactamente qué puede y qué no puede recetarte.',
    footer: 'Prevención de contraindicaciones',
    footerIcon: 'fa-solid fa-shield-halved',
    footerColor: 'text-amber-800',
  },
  {
    emoji: '🧪',
    iconWrap: 'bg-blue-100 text-blue-700',
    title: 'Tienes un resultado en papel y no sabes qué dice',
    description:
      'Hemoglobina, triglicéridos, leucocitos... ¿Qué significa todo eso? Sube tu resultado a VidaRecord y nuestra IA te lo explica en palabras simples, para que llegues a tu próxima consulta entendiendo tu propia salud.',
    footer: 'Explicación IA sin tecnicismos',
    footerIcon: 'fa-solid fa-brain',
    footerColor: 'text-blue-800',
  },
  {
    emoji: '📅',
    iconWrap: 'bg-green-100 text-green-700',
    title: '¿Cuándo es tu próxima cita con el cardiólogo?',
    description:
      'VidaRecord organiza todas tus consultas médicas en un solo lugar. Sabe exactamente cuándo fue tu última visita, qué te diagnosticaron ese día, qué médico te atendió y cuándo debes volver. Nunca más pierdas el hilo de tus consultas.',
    footer: 'Control total de tus consultas',
    footerEmoji: '📋',
    footerColor: 'text-green-800',
  },
  {
    emoji: '🩺',
    iconWrap: 'bg-purple-100 text-purple-700',
    title: '¿Qué te diagnosticaron y cuándo?',
    description:
      'Guarda cada diagnóstico con la fecha exacta, el médico que lo emitió y el hospital o clínica. Sabe en todo momento cuáles condiciones están activas, cuáles son crónicas y cuáles ya fueron resueltas. Toda tu historia clínica, organizada y lista.',
    footer: 'Historial de diagnósticos completo',
    footerEmoji: '🏥',
    footerColor: 'text-purple-800',
  },
  {
    emoji: '📊',
    iconWrap: 'bg-red-100 text-red-700',
    title: '¿Cómo ha evolucionado tu presión arterial?',
    description:
      'Registra tu presión arterial, peso, glucosa y frecuencia cardíaca con fecha y hora. VidaRecord lleva el historial completo de cada medición para que puedas mostrárselo a tu médico en tu próxima consulta y él pueda ver cómo ha evolucionado tu salud.',
    footer: 'Presión, peso, glucosa y más',
    footerEmoji: '📈',
    footerColor: 'text-red-800',
  },
  {
    emoji: '📋',
    iconWrap: 'bg-teal-100 text-teal-700',
    title: 'Tu historia médica, siempre en tu bolsillo',
    description:
      'Consultas, medicamentos, diagnósticos, estudios y resultados — todo en una línea de tiempo cronológica. Cuando un médico te pida tu historial, lo tienes listo en segundos. Sin buscar papeles, sin tratar de recordar fechas.',
    footer: 'Historial cronológico completo',
    footerEmoji: '🕐',
    footerColor: 'text-teal-800',
  },
]

const comoFuncionaPoints = [
  {
    title: 'Llegas al médico con toda tu información',
    description:
      'Tu lista de medicamentos, diagnósticos, alergias y estudios recientes, listos para mostrar en cualquier consulta.',
  },
  {
    title: 'El médico sabe exactamente qué recetarte',
    description:
      'Evitas medicamentos que no debes tomar, interacciones peligrosas y duplicar tratamientos que ya tienes.',
  },
  {
    title: 'Tus resultados, explicados en tu idioma',
    description:
      'Nuestra IA lee tus resultados de laboratorio y te los explica de forma simple. Sin términos médicos complicados.',
  },
  {
    title: 'Genera tu resumen médico en un clic',
    description:
      'Un documento PDF completo con toda tu historia médica, listo para mostrarle a cualquier doctor en cualquier momento.',
  },
]

const freeFeatures = [
  { included: true, text: 'Hasta 5 consultas registradas' },
  { included: true, text: 'Hasta 5 medicamentos' },
  { included: true, text: 'Hasta 5 documentos guardados' },
  { included: true, text: 'Historial cronológico' },
  { included: false, text: 'Resumen PDF' },
  { included: false, text: 'Análisis IA de resultados' },
  { included: false, text: 'Perfiles familiares' },
]

const premiumFeatures = [
  'Consultas ilimitadas',
  'Medicamentos ilimitados',
  'Documentos ilimitados',
  'Resumen PDF descargable',
  'IA explica tus resultados',
  'Hasta 5 perfiles familiares',
]

export default function Home() {
  return (
    <div className="flex flex-col bg-white text-slate-800">
      <style>{'html{scroll-behavior:smooth} body{font-size:18px;}'}</style>

      <AccessibilityBar />
      <SiteHeader />

      {/* HERO */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-900 to-teal-700 text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-300/30 text-teal-300 font-medium text-sm">
                <i className="fa-solid fa-heart text-teal-300" />
                <span>Tu salud, siempre organizada</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
                ¿Recuerdas todo lo que tu médico necesita saber de ti?
              </h1>

              <p className="text-slate-100 text-lg sm:text-xl font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Muchas personas llegan al médico sin recordar qué toman, qué
                les diagnosticaron o dónde están sus resultados.{' '}
                <strong className="font-semibold text-teal-200">
                  VidaRecord lo organiza todo por ti.
                </strong>
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white text-blue-900 hover:bg-teal-50 text-lg shadow-xl shadow-black/20 hover:-translate-y-0.5 transition-all focus:ring-4 focus:ring-teal-300 text-center"
                >
                  Crear mi cuenta gratis
                </Link>
                <a
                  href="#como-funciona"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold bg-blue-950/40 hover:bg-blue-950/60 border border-white/20 text-white text-center text-lg backdrop-blur-sm transition-all"
                >
                  Ver cómo funciona
                </a>
              </div>

              <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4 text-sm font-medium text-teal-100/90">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-teal-300" />{' '}
                  Gratis para empezar
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-teal-300" /> Sin
                  tarjeta de crédito
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-teal-300" /> En
                  español
                </span>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-teal-400 to-blue-400 opacity-30 blur-lg" />
                <img
                  src="/hero-landing.jpg"
                  alt="Señora mostrando su historial médico en el celular a su médico durante una consulta"
                  className="relative w-full h-auto object-cover rounded-2xl shadow-2xl border-4 border-white/10"
                  loading="eager"
                />
                <div className="absolute -bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 hidden sm:flex items-center gap-4 text-slate-800">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-shield-heart text-2xl" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">
                      Consulta médica sin olvidos
                    </p>
                    <p className="text-xs text-slate-600">
                      Lleva siempre tus diagnósticos y recetas al día.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ¿TE HA PASADO ESTO? */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              ¿Te ha pasado alguna de estas situaciones?
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Son contratiempos muy comunes en las consultas que pueden poner
              en riesgo la tranquilidad de tu familia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {problems.map((problem) => (
              <div
                key={problem.title}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${problem.iconWrap}`}
                  >
                    {problem.emoji}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {problem.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {problem.description}
                  </p>
                </div>
                <div
                  className={`mt-6 pt-4 border-t border-slate-200/60 text-sm font-semibold flex items-center gap-2 ${problem.footerColor}`}
                >
                  {problem.footerIcon ? (
                    <i className={problem.footerIcon} />
                  ) : (
                    <span>{problem.footerEmoji}</span>
                  )}{' '}
                  {problem.footer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section
        id="como-funciona"
        className="py-20 bg-slate-50 border-y border-slate-200/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              VidaRecord puede salvarte la vida
            </h2>
            <p className="mt-3 text-xl text-slate-500 font-medium">
              No es exageración. Aquí te explicamos cómo.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center">
              <div className="relative w-full max-w-lg">
                <img
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=800"
                  alt="Doctor revisando historial médico con paciente adulto mayor"
                  className="w-full h-auto object-cover rounded-2xl shadow-xl border-4 border-white"
                />
                <PdfDemoCard />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              {comoFuncionaPoints.map((point) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 mt-1 font-bold">
                    <i className="fa-solid fa-circle-check text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS / FAMILIA */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Diseñado para toda la familia
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Desde el abuelo hasta los nietos. Un solo lugar para el
              historial médico de todos.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-10 overflow-hidden rounded-2xl shadow-2xl border-4 border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800"
              alt="Familia sonriente junto a adulto mayor"
              className="w-full h-80 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            <div className="bg-teal-50 border border-teal-200/80 px-6 py-3.5 rounded-2xl text-teal-900 font-bold text-base sm:text-lg shadow-sm flex items-center gap-2">
              <span>👴</span> Para adultos mayores
            </div>
            <div className="bg-blue-50 border border-blue-200/80 px-6 py-3.5 rounded-2xl text-blue-900 font-bold text-base sm:text-lg shadow-sm flex items-center gap-2">
              <span>👨‍👩‍👧</span> Para familias completas
            </div>
            <div className="bg-purple-50 border border-purple-200/80 px-6 py-3.5 rounded-2xl text-purple-900 font-bold text-base sm:text-lg shadow-sm flex items-center gap-2">
              <span>🏥</span> Para cada consulta médica
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="py-20 bg-blue-50/70 border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Empieza gratis hoy mismo
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Sin tarjeta de crédito. Sin complicaciones.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* GRATUITO */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md flex flex-col justify-between relative">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    GRATUITO
                  </h3>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Básico
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    $0
                  </span>
                  <span className="text-slate-500 font-medium">
                    {' '}
                    / para siempre
                  </span>
                </div>
                <ul className="space-y-3.5 text-slate-700 mb-8">
                  {freeFeatures.map((feature) => (
                    <li
                      key={feature.text}
                      className={`flex items-center gap-3 ${
                        feature.included ? '' : 'text-slate-400'
                      }`}
                    >
                      <i
                        className={`fa-solid text-lg ${
                          feature.included
                            ? 'fa-check text-emerald-600'
                            : 'fa-xmark text-slate-300'
                        }`}
                      />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full py-4 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition text-center"
              >
                Empezar gratis
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="bg-white rounded-2xl p-8 border-2 border-teal-500 shadow-xl flex flex-col justify-between relative transform md:-translate-y-2">
              <div className="absolute -top-4 right-6 bg-gradient-to-r from-amber-500 to-teal-600 text-white text-xs font-extrabold uppercase px-4 py-1.5 rounded-full shadow-md flex items-center gap-1">
                <i className="fa-solid fa-star" /> Más completo
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">
                    PREMIUM ⭐
                  </h3>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-teal-700">
                    $4.95
                  </span>
                  <span className="text-slate-500 font-medium"> / mes</span>
                </div>
                <ul className="space-y-3.5 text-slate-700 mb-8">
                  {premiumFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 font-medium"
                    >
                      <i className="fa-solid fa-check text-teal-600 text-lg" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/register"
                className="w-full py-4 rounded-xl font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/30 transition text-center"
              >
                Comenzar Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-teal-700 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6 relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800"
                alt="Señora mayor feliz usando su teléfono celular"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-xs p-1.5 rounded-full border-2 border-white">
              <i className="fa-solid fa-check" />
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Tu salud merece estar organizada
          </h2>

          <p className="text-lg sm:text-xl text-teal-100 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Miles de personas llegan al médico sin recordar qué medicamentos
            toman. Tú no tienes que ser una de ellas.
          </p>

          <div className="mb-6">
            <Link
              href="/register"
              className="inline-block px-8 py-5 rounded-2xl font-extrabold bg-white text-blue-900 hover:bg-teal-50 text-xl shadow-2xl transition hover:scale-105 active:scale-100"
            >
              Crear mi cuenta gratis ahora
            </Link>
          </div>

          <p className="text-teal-200 text-sm font-medium flex items-center justify-center gap-3">
            <span>✓ Gratis</span>
            <span>•</span>
            <span>✓ En español</span>
            <span>•</span>
            <span>✓ En tu celular</span>
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo theme="dark" iconClassName="h-10 w-10" textClassName="text-2xl" />

            <div className="text-center md:text-right text-sm space-y-1">
              <p>© 2026 VidaRecord. Todos los derechos reservados.</p>
              <p className="text-slate-500">
                Desarrollado por Nexus Digital — Santo Domingo, RD
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
