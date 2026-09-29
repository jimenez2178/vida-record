import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getActiveProfileId } from '@/lib/profiles/getActiveProfileId'
import QuickActions from '@/components/dashboard/QuickActions'
import DashboardGreeting from '@/components/dashboard/DashboardGreeting'
import AttentionPanel from '@/components/dashboard/AttentionPanel'
import ActiveDiagnosesCard, {
  type DashboardDiagnosis,
} from '@/components/dashboard/ActiveDiagnosesCard'
import IndicatorSummary from '@/components/dashboard/IndicatorSummary'
import RecentActivity, {
  type ActivityItem,
} from '@/components/dashboard/RecentActivity'
import HealthSummaryCard from '@/components/dashboard/HealthSummaryCard'
import { buildAttentionItems } from '@/lib/dashboard/attention'
import { formatDate, timeAgo, todayDateString } from '@/lib/dates'
import {
  formatIndicatorValue,
  indicatorTypeLabels,
  type IndicatorReading,
} from '@/lib/dashboard/indicators'

type NextAppointment = {
  id: string
  date: string
  time: string | null
  specialty: string | null
  doctors: { name: string } | null
}

type RecentStudy = {
  id: string
  name: string
  type: string | null
  date: string | null
}

const SPARKLINE_READINGS = 8
const ACTIVITY_ITEMS = 6

const cardClass =
  'group bg-white border border-gray-200 rounded-xl shadow-sm p-6 transition-all hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-between text-base font-bold text-blue-800">
      {children}
      <span
        className="text-blue-600 opacity-0 transition-opacity group-hover:opacity-100"
        aria-hidden="true"
      >
        →
      </span>
    </p>
  )
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

  const today = todayDateString()

  const [
    { data: nextAppointment },
    { data: activeMedications },
    { data: recentStudies },
    { data: recentIndicators },
    { data: userRow },
    { data: profile },
    { data: activeDiagnoses },
    { data: unanalyzedStudies },
    { data: lastBloodPressure },
    { data: recentAppointments },
    { data: recentDiagnoses },
    { data: unconfirmedAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('id, date, time, specialty, doctors ( name )')
      .eq('profile_id', profileId)
      .eq('status', 'programada')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('time', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('medications')
      .select('id, name, dose, quantity_remaining, start_date, created_at')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('studies')
      .select('id, name, type, date, created_at')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('health_indicators')
      .select('id, type, value_primary, value_secondary, unit, measured_at, created_at')
      .eq('profile_id', profileId)
      .order('measured_at', { ascending: false })
      .limit(40),
    supabase.from('users').select('plan').eq('id', user.id).single(),
    supabase
      .from('profiles')
      .select(
        'date_of_birth, gender, blood_type, allergies, medical_notes, emergency_contact_name, emergency_contact_phone, is_owner'
      )
      .eq('id', profileId)
      .maybeSingle(),
    supabase
      .from('diagnoses')
      .select('id, name, description, is_chronic, diagnosed_at')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('diagnosed_at', { ascending: false, nullsFirst: false }),
    supabase
      .from('studies')
      .select('name')
      .eq('profile_id', profileId)
      .eq('ai_processed', false)
      .not('file_url', 'is', null),
    supabase
      .from('health_indicators')
      .select('value_primary, value_secondary, measured_at')
      .eq('profile_id', profileId)
      .eq('type', 'presion')
      .order('measured_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('appointments')
      .select('id, specialty, created_at')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('diagnoses')
      .select('id, name, created_at')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('appointments')
      .select('specialty')
      .eq('profile_id', profileId)
      .eq('status', 'programada')
      .lt('date', today),
  ])

  const isPremium = userRow?.plan === 'premium'
  const profileHref = profile?.is_owner === false ? '/familia' : '/perfil'

  const appointment = nextAppointment as NextAppointment | null
  const studies = ((recentStudies as RecentStudy[] | null) ?? []).slice(0, 2)
  const medications = activeMedications ?? []
  const diagnoses = (activeDiagnoses as DashboardDiagnosis[] | null) ?? []

  // Lecturas del último tipo de indicador medido, para la tendencia.
  const indicators = (recentIndicators ?? []) as (IndicatorReading & {
    id: string
    created_at: string
  })[]
  const latestType = indicators[0]?.type
  const indicatorReadings = indicators
    .filter((i) => i.type === latestType)
    .slice(0, SPARKLINE_READINGS)

  const attentionItems = buildAttentionItems({
    today,
    profileHref,
    isPremium,
    profile: profile ?? null,
    nextAppointment: appointment,
    medications,
    diagnoses,
    unanalyzedStudies: unanalyzedStudies ?? [],
    unconfirmedAppointments: unconfirmedAppointments ?? [],
    lastBloodPressure: lastBloodPressure ?? null,
  })

  const profileFields: [string, unknown][] = [
    ['fecha de nacimiento', profile?.date_of_birth],
    ['sexo', profile?.gender],
    ['tipo de sangre', profile?.blood_type],
    ['alergias (escribe "Ninguna" si no tienes)', profile?.allergies],
    ['notas médicas', profile?.medical_notes],
    ['contacto de emergencia', profile?.emergency_contact_name],
    ['teléfono de emergencia', profile?.emergency_contact_phone],
  ]
  const missingFields = profileFields
    .filter(([, value]) => !(typeof value === 'string' && value.trim()))
    .map(([label]) => label)
  const completeness = {
    percent: Math.round(
      ((profileFields.length - missingFields.length) / profileFields.length) * 100
    ),
    missing: missingFields,
  }

  const activity: ActivityItem[] = [
    ...(recentAppointments ?? []).map((a) => ({
      id: a.id,
      kind: 'consulta' as const,
      title: a.specialty || 'Consulta médica',
      createdAt: a.created_at,
    })),
    ...medications.slice(0, 5).map((m) => ({
      id: m.id,
      kind: 'medicamento' as const,
      title: m.name,
      createdAt: m.created_at,
    })),
    ...((recentStudies ?? []) as (RecentStudy & { created_at: string })[]).map(
      (s) => ({
        id: s.id,
        kind: 'estudio' as const,
        title: s.name,
        createdAt: s.created_at,
      })
    ),
    ...(recentDiagnoses ?? []).map((d) => ({
      id: d.id,
      kind: 'diagnostico' as const,
      title: d.name,
      createdAt: d.created_at,
    })),
    ...indicators.slice(0, 5).map((i) => ({
      id: i.id,
      kind: 'medicion' as const,
      title: `${indicatorTypeLabels[i.type] ?? i.type}: ${formatIndicatorValue(i)}`,
      createdAt: i.created_at,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, ACTIVITY_ITEMS)

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <DashboardGreeting displayName={displayName} />

      <AttentionPanel items={attentionItems} />

      <section className="mb-8">
        <h2 className="text-gray-800 font-semibold mb-3">Acciones rápidas</h2>
        <QuickActions profileId={profileId} userId={user.id} />
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/citas" className={cardClass}>
          <CardTitle>Próxima cita</CardTitle>
          {appointment ? (
            <>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {appointment.specialty || 'Consulta médica'}
              </p>
              {appointment.doctors?.name && (
                <p className="text-base font-medium text-gray-700 mt-1">
                  {appointment.doctors.name}
                </p>
              )}
              <p className="text-base font-medium text-gray-700 mt-1">
                {formatDate(appointment.date)}
                {appointment.time && ` · ${appointment.time.slice(0, 5)}`}
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 text-xl font-bold text-gray-900">
                Sin citas programadas
              </p>
              <p className="text-sm font-semibold text-blue-700 mt-3">
                Agenda tu próxima cita →
              </p>
            </>
          )}
        </Link>

        <Link href="/medicamentos" className={cardClass}>
          <CardTitle>Medicamentos activos</CardTitle>
          {medications.length > 0 ? (
            <>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {medications.length}{' '}
                {medications.length === 1 ? 'medicamento' : 'medicamentos'}
              </p>
              <ul className="mt-2 space-y-1.5">
                {medications.slice(0, 3).map((m) => (
                  <li key={m.id} className="text-sm leading-snug">
                    <span className="font-semibold text-gray-800">{m.name}</span>
                    {m.dose && <span className="text-gray-500"> · {m.dose}</span>}
                  </li>
                ))}
              </ul>
              {medications.length > 3 && (
                <p className="text-sm text-gray-500 mt-1.5">
                  y {medications.length - 3} más
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-2 text-xl font-bold text-gray-900">
                Sin medicamentos activos
              </p>
              <p className="text-sm font-semibold text-blue-700 mt-3">
                Agregar medicamento →
              </p>
            </>
          )}
        </Link>

        <Link href="/estudios" className={cardClass}>
          <CardTitle>Últimos estudios</CardTitle>
          {studies.length > 0 ? (
            <div className="mt-2 space-y-2">
              {studies.map((s) => (
                <div key={s.id}>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {s.name}
                  </p>
                  {s.date && (
                    <p className="text-sm font-medium text-gray-600">
                      {formatDate(s.date)} · {timeAgo(s.date)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <p className="mt-2 text-xl font-bold text-gray-900">
                Sin estudios registrados
              </p>
              <p className="text-sm font-semibold text-blue-700 mt-3">
                Subir un estudio →
              </p>
            </>
          )}
        </Link>

        <Link href="/indicadores" className={cardClass}>
          <CardTitle>Indicadores</CardTitle>
          <IndicatorSummary readings={indicatorReadings} />
        </Link>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <ActiveDiagnosesCard diagnoses={diagnoses} />
        </div>
        <div className="space-y-4">
          <HealthSummaryCard
            completeness={completeness}
            profileHref={profileHref}
            isPremium={isPremium}
          />
          <RecentActivity items={activity} />
        </div>
      </section>
    </div>
  )
}
