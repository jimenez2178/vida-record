import { createClient } from '@/lib/supabase/server'
import { getActiveProfileId } from '@/lib/profiles/getActiveProfileId'
import QuickActions from '@/components/dashboard/QuickActions'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'

function todayDateString() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const indicatorTypeLabels: Record<string, string> = {
  presion: 'Presión arterial',
  glucosa: 'Glucosa',
  peso: 'Peso',
  temperatura: 'Temperatura',
  frecuencia_cardiaca: 'Frecuencia cardíaca',
  colesterol: 'Colesterol',
  otro: 'Otro',
}

function formatIndicatorValue(indicator: {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
}) {
  if (indicator.type === 'presion') {
    return `${indicator.value_primary}/${indicator.value_secondary}${
      indicator.unit ? ` ${indicator.unit}` : ''
    }`
  }
  return `${indicator.value_primary}${
    indicator.unit ? ` ${indicator.unit}` : ''
  }`
}

type NextAppointment = {
  id: string
  date: string
  specialty: string | null
  doctors: { name: string } | null
}

type RecentStudy = {
  id: string
  name: string
  type: string | null
  date: string | null
}

type LastIndicator = {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const profileId = await getActiveProfileId(supabase, user.id)

  if (!profileId) {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto">
          <p className="text-gray-800 font-semibold mb-2">
            No pudimos encontrar tu perfil
          </p>
          <p className="text-gray-500 text-sm">
            Algo salió mal al crear tu perfil médico principal. Intenta
            cerrar sesión y volver a entrar; si el problema persiste,
            contáctanos.
          </p>
        </div>
      </div>
    )
  }

  const displayName =
    user.user_metadata?.full_name?.toString().split(' ')[0] ||
    user.email?.split('@')[0] ||
    'Usuario'

  const [
    { data: nextAppointment },
    { data: activeMedications, count: activeMedicationsCount },
    { data: recentStudies },
    { data: lastIndicator },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, date, specialty, doctors ( name )')
      .eq('profile_id', profileId)
      .eq('status', 'programada')
      .gte('date', todayDateString())
      .order('date', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('medications')
      .select('name', { count: 'exact' })
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('studies')
      .select('id, name, type, date')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(2),
    supabase
      .from('health_indicators')
      .select('type, value_primary, value_secondary, unit')
      .eq('profile_id', profileId)
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const appointment = nextAppointment as NextAppointment | null
  const studies = (recentStudies as RecentStudy[] | null) ?? []
  const indicator = lastIndicator as LastIndicator | null
  const medicationNames = (activeMedications ?? []).map((m) => m.name)
  const medicationCount = activeMedicationsCount ?? 0

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <DashboardGreeting displayName={displayName} />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-teal-700">Próxima cita</p>
          {appointment ? (
            <>
              <p className="mt-2 text-lg font-semibold text-gray-800">
                {appointment.specialty || 'Consulta médica'}
              </p>
              {appointment.doctors?.name && (
                <p className="text-sm text-gray-500 mt-1">
                  {appointment.doctors.name}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(appointment.date)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-lg font-semibold text-gray-800">
              Sin citas programadas
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-teal-700">
            Medicamentos activos
          </p>
          {medicationCount > 0 ? (
            <>
              <p className="mt-2 text-lg font-semibold text-gray-800">
                {medicationCount}{' '}
                {medicationCount === 1 ? 'medicamento' : 'medicamentos'}
              </p>
              <p className="text-sm text-gray-500 mt-1 truncate">
                {medicationNames.join(', ')}
              </p>
            </>
          ) : (
            <p className="mt-2 text-lg font-semibold text-gray-800">
              Sin medicamentos activos
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-teal-700">Últimos estudios</p>
          {studies.length > 0 ? (
            <div className="mt-2 space-y-1.5">
              {studies.map((s) => (
                <div key={s.id}>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {s.name}
                  </p>
                  {s.date && (
                    <p className="text-xs text-gray-500">
                      {formatDate(s.date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-lg font-semibold text-gray-800">
              Sin estudios registrados
            </p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <p className="text-sm font-medium text-teal-700">Indicadores</p>
          {indicator ? (
            <>
              <p className="mt-2 text-lg font-semibold text-gray-800">
                {formatIndicatorValue(indicator)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {indicatorTypeLabels[indicator.type] ?? indicator.type}
              </p>
            </>
          ) : (
            <p className="mt-2 text-lg font-semibold text-gray-800">
              Sin registros
            </p>
          )}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-gray-800 font-semibold mb-3">Acciones rápidas</h2>
        <QuickActions profileId={profileId} userId={user.id} />
      </section>
    </div>
  )
}
