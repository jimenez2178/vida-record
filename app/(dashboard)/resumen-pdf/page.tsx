import { createClient } from '@/lib/supabase/server'
import { getActiveProfileId } from '@/lib/profiles/getActiveProfileId'
import PdfGenerator from '@/components/pdf/PdfGenerator'
import PremiumGate from '@/components/ui/PremiumGate'

export default async function ResumenPdfPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (userRow?.plan !== 'premium') {
    return (
      <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8 flex items-center justify-center">
        <PremiumGate
          featureName="Resumen PDF"
          description="Genera y descarga tu historial médico completo en PDF para compartir con cualquier médico."
        />
      </div>
    )
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

  const todayIso = new Date().toISOString().slice(0, 10)

  const [
    { data: profile },
    { data: appointments },
    { data: medications },
    { data: diagnoses },
    { data: studies },
    { data: indicatorsRaw },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, full_name, date_of_birth, blood_type, allergies, medical_notes, emergency_contact_name, emergency_contact_phone'
      )
      .eq('id', profileId)
      .single(),
    supabase
      .from('appointments')
      .select(
        'id, date, specialty, clinic_name, reason, diagnosis, notes, doctors ( name )'
      )
      .eq('profile_id', profileId)
      .neq('status', 'cancelada')
      .lte('date', todayIso)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('medications')
      .select('id, name, dose, frequency, start_date, notes, doctors ( name )')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('name', { ascending: true }),
    supabase
      .from('diagnoses')
      .select(
        'id, name, description, notes, is_chronic, diagnosed_at, doctors ( name )'
      )
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('diagnosed_at', { ascending: false }),
    supabase
      .from('studies')
      .select('id, name, type, date, notes')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('health_indicators')
      .select('type, value_primary, value_secondary, unit, measured_at, notes')
      .eq('profile_id', profileId)
      .order('measured_at', { ascending: false }),
  ])

  if (!profile) {
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

  // Agrupa las lecturas por tipo (vienen de la más reciente a la más antigua)
  // para mostrar el último valor y las anteriores como tendencia.
  const indicatorsByType = new Map<string, NonNullable<typeof indicatorsRaw>>()

  ;(indicatorsRaw ?? []).forEach((indicator) => {
    const readings = indicatorsByType.get(indicator.type) ?? []
    if (readings.length < 4) readings.push(indicator)
    indicatorsByType.set(indicator.type, readings)
  })

  type DoctorRef = { name: string } | null

  type AppointmentRow = {
    id: string
    date: string
    specialty: string | null
    clinic_name: string | null
    reason: string | null
    diagnosis: string | null
    notes: string | null
    doctors: DoctorRef
  }

  type MedicationRow = Omit<NonNullable<typeof medications>[number], 'doctors'> & {
    doctors: DoctorRef
  }

  type DiagnosisRow = Omit<NonNullable<typeof diagnoses>[number], 'doctors'> & {
    doctors: DoctorRef
  }

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-6 md:px-8 md:py-8">
      <PdfGenerator
        profile={profile}
        appointments={(appointments ?? []) as unknown as AppointmentRow[]}
        medications={(medications ?? []) as unknown as MedicationRow[]}
        diagnoses={(diagnoses ?? []) as unknown as DiagnosisRow[]}
        studies={studies ?? []}
        indicators={Array.from(indicatorsByType.values())}
      />
    </div>
  )
}
