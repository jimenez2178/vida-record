import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getTodayLabel() {
  const label = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    user?.user_metadata?.full_name?.toString().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'Usuario'

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {displayName} 👋
        </h1>
        <p className="text-gray-500 mt-1">{getTodayLabel()}</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-700 text-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-blue-100">Próxima cita</p>
          <p className="mt-2 text-lg font-semibold">Sin citas programadas</p>
        </div>

        <div className="bg-green-600 text-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-green-100">
            Medicamentos activos
          </p>
          <p className="mt-2 text-lg font-semibold">0 medicamentos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Últimos estudios</p>
          <p className="mt-2 text-lg font-semibold text-gray-800">
            Sin estudios
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-gray-500">Indicadores</p>
          <p className="mt-2 text-lg font-semibold text-gray-800">
            Sin registros
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-gray-800 font-semibold mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/citas"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            + Nueva consulta
          </Link>
          <Link
            href="/medicamentos"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            + Medicamento
          </Link>
          <Link
            href="/estudios"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            + Estudio
          </Link>
          <Link
            href="/indicadores"
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
          >
            + Medición
          </Link>
        </div>
      </section>

      <Link
        href="/resumen-pdf"
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full shadow-lg px-5 py-3 transition-colors"
      >
        📄 Resumen PDF
      </Link>
    </div>
  )
}
