import Link from 'next/link'
import Logo from '@/components/ui/Logo'

const problems = [
  {
    emoji: '😕',
    text: 'Vas al médico y no recuerdas qué medicamentos tomas',
  },
  {
    emoji: '😕',
    text: 'No encuentras ese resultado de laboratorio que necesitas',
  },
  {
    emoji: '😕',
    text: 'Un especialista nuevo te pregunta tu historial y no sabes qué decir',
  },
]

const steps = [
  {
    number: 1,
    emoji: '📝',
    title: 'Registra tus consultas',
    description: 'Guarda cada visita médica con diagnóstico, médico y notas',
  },
  {
    number: 2,
    emoji: '💊',
    title: 'Controla tus medicamentos',
    description:
      'Sabe exactamente qué tomas, cuánto te queda y quién lo indicó',
  },
  {
    number: 3,
    emoji: '🧪',
    title: 'Guarda tus estudios',
    description:
      'Todos tus resultados en un solo lugar, accesibles desde cualquier dispositivo',
  },
  {
    number: 4,
    emoji: '📄',
    title: 'Genera tu resumen PDF',
    description:
      'Llega a cada consulta con toda tu información organizada y lista para compartir',
  },
]

const freeFeatures = [
  { included: true, text: 'Hasta 5 consultas' },
  { included: true, text: 'Hasta 3 medicamentos' },
  { included: true, text: 'Hasta 5 documentos' },
  { included: true, text: 'Historial cronológico' },
  { included: false, text: 'Resumen PDF' },
  { included: false, text: 'Asistente IA' },
  { included: false, text: 'Perfiles familiares' },
]

const premiumFeatures = [
  'Todo lo del plan gratuito',
  'Consultas ilimitadas',
  'Medicamentos ilimitados',
  'Documentos ilimitados',
  'Resumen PDF descargable',
  'Asistente IA',
  'Hasta 5 perfiles familiares',
]

export default function Home() {
  return (
    <div className="flex flex-col">
      <style>{'html{scroll-behavior:smooth}'}</style>

      {/* NAVBAR */}
      <header className="sticky top-0 z-30 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-3">
          <span className="sm:hidden">
            <Logo variant="icon" iconClassName="h-9 w-9" />
          </span>
          <span className="hidden sm:block">
            <Logo iconClassName="h-9 w-9" textClassName="text-lg" />
          </span>
          <div className="flex items-center gap-2 sm:gap-5 shrink-0">
            <Link
              href="/login"
              className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg px-3 sm:px-4 py-2 transition-colors"
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-900 to-teal-700 text-white px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Tu historial médico.
            <br />
            Siempre contigo.
          </h1>
          <p className="text-xl text-blue-100 mt-6 max-w-2xl mx-auto">
            Organiza tus citas, medicamentos, estudios y documentos médicos en
            un solo lugar. Llega a tu próxima consulta con toda tu
            información lista.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/register"
              className="w-full sm:w-auto text-center bg-white text-blue-900 font-semibold rounded-lg px-6 py-3 hover:bg-blue-50 transition-colors"
            >
              Crear cuenta gratis
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto text-center border border-white text-white font-semibold rounded-lg px-6 py-3 hover:bg-white/10 transition-colors"
            >
              Ver cómo funciona
            </a>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-16 px-2">
          <div className="flex flex-col gap-4 sm:relative sm:h-64 sm:gap-0">
            <div className="bg-white text-gray-800 rounded-xl shadow-xl p-4 sm:absolute sm:left-0 sm:top-0 sm:w-64 sm:-rotate-3">
              <p className="text-xs text-gray-400 mb-1">Próxima cita</p>
              <p className="text-sm font-semibold">📅 Dr. Miniño</p>
              <p className="text-xs text-gray-500 mt-0.5">11 sept</p>
            </div>
            <div className="bg-white text-gray-800 rounded-xl shadow-xl p-4 sm:absolute sm:left-1/2 sm:-translate-x-1/2 sm:top-12 sm:w-64 sm:rotate-2">
              <p className="text-xs text-gray-400 mb-1">Medicamentos</p>
              <p className="text-sm font-semibold">💊 Dorixina Relax</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">
                Activo
              </p>
            </div>
            <div className="bg-white text-gray-800 rounded-xl shadow-xl p-4 sm:absolute sm:right-0 sm:top-2 sm:w-64 sm:-rotate-1">
              <p className="text-xs text-gray-400 mb-1">Resumen PDF</p>
              <p className="text-sm font-semibold">📄 Listo para descargar</p>
            </div>
          </div>
        </div>
      </section>

      {/* EL PROBLEMA */}
      <section className="bg-gray-50 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            ¿Te ha pasado esto?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
            {problems.map((problem) => (
              <div
                key={problem.text}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <p className="text-3xl mb-3">{problem.emoji}</p>
                <p className="text-gray-700">{problem.text}</p>
              </div>
            ))}
          </div>

          <p className="text-xl font-semibold text-blue-900 mt-12">
            VidaRecord resuelve todo eso.
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center">
            Todo tu historial médico, organizado
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mt-14">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4">
                  {step.number}
                </div>
                <p className="text-3xl mb-2">{step.emoji}</p>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTALAR LA APP */}
      <section className="bg-gray-50 px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              Instala VidaRecord en tu celular
            </h2>
            <p className="text-gray-500 mt-4">
              Úsala como una app, con acceso directo desde tu pantalla de
              inicio. No ocupa espacio de tienda ni requiere descargas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {/* Android */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🤖</span>
                <h3 className="text-xl font-bold text-gray-800">Android</h3>
              </div>
              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>Abre VidaRecord en Chrome desde tu celular.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>Toca el menú ⋮ en la esquina superior derecha.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>
                    Selecciona <strong>&quot;Instalar aplicación&quot;</strong>{' '}
                    o <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
                    .
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span>
                    Confirma tocando <strong>&quot;Instalar&quot;</strong>.
                    Listo, ya tienes el ícono en tu pantalla de inicio.
                  </span>
                </li>
              </ol>
            </div>

            {/* iOS */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🍎</span>
                <h3 className="text-xl font-bold text-gray-800">
                  iPhone / iPad
                </h3>
              </div>
              <ol className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <span>Abre VidaRecord en Safari desde tu iPhone o iPad.</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <span>
                    Toca el ícono de compartir{' '}
                    <span aria-hidden="true">⬆️</span> en la barra inferior.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <span>
                    Desplázate y selecciona{' '}
                    <strong>&quot;Agregar a pantalla de inicio&quot;</strong>.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-900 text-white text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <span>
                    Toca <strong>&quot;Agregar&quot;</strong>. Listo, ya
                    tienes el ícono en tu pantalla de inicio.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section className="bg-white px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-12">
            Elige tu plan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gratuito */}
            <div className="rounded-2xl border border-gray-200 p-8">
              <p className="text-xs font-bold tracking-wide text-gray-400">
                GRATUITO
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Para empezar
              </p>
              <p className="text-4xl font-bold text-gray-800 mt-4">
                $0
                <span className="text-base font-normal text-gray-400">
                  /mes
                </span>
              </p>

              <ul className="mt-6 space-y-3 text-sm">
                {freeFeatures.map((feature) => (
                  <li
                    key={feature.text}
                    className={`flex items-center gap-2 ${
                      feature.included ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    <span
                      className={
                        feature.included ? 'text-green-600' : 'text-gray-300'
                      }
                    >
                      {feature.included ? '✓' : '✗'}
                    </span>
                    {feature.text}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block text-center mt-8 border border-gray-300 text-gray-700 font-semibold rounded-lg py-3 hover:bg-gray-50 transition-colors"
              >
                Empezar gratis
              </Link>
            </div>

            {/* Premium */}
            <div className="relative rounded-2xl border-2 border-teal-600 p-8 shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                Más popular
              </span>

              <p className="text-xs font-bold tracking-wide text-teal-700">
                PREMIUM ⭐
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                Para tu familia completa
              </p>
              <p className="text-4xl font-bold text-gray-800 mt-4">
                $4.95
                <span className="text-base font-normal text-gray-400">
                  /mes
                </span>
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {premiumFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block text-center mt-8 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg py-3 transition-colors"
              >
                Comenzar Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-gradient-to-br from-blue-900 to-teal-700 text-white px-4 md:px-8 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Tu salud merece estar organizada
        </h2>
        <p className="text-blue-100 mt-4">Únete a VidaRecord hoy. Es gratis.</p>
        <Link
          href="/register"
          className="inline-block bg-white text-blue-900 font-semibold rounded-lg px-8 py-4 mt-8 hover:bg-blue-50 transition-colors"
        >
          Crear mi cuenta gratis
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 px-4 md:px-8 py-10">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3 text-center">
          <Logo theme="dark" iconClassName="h-8 w-8" textClassName="text-base" />
          <p className="text-sm text-gray-400">
            © 2026 VidaRecord. Todos los derechos reservados.
          </p>
          <p className="text-xs text-gray-500">
            Desarrollado por Nexus Digital — Santo Domingo, RD
          </p>
        </div>
      </footer>
    </div>
  )
}
