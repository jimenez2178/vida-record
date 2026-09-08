import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

type ProfileRow = {
  full_name: string
  date_of_birth: string | null
  gender: string | null
  blood_type: string | null
  allergies: string | null
  medical_notes: string | null
} | null

type MedicationRow = {
  name: string
  dose: string | null
  frequency: string | null
}

type AppointmentRow = {
  date: string
  specialty: string | null
  status: string
  diagnosis: string | null
  doctors: { name: string } | null
}

type DiagnosisRow = {
  name: string
  is_chronic: boolean
}

type IndicatorRow = {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
}

function buildMedicalContext({
  profile,
  medications,
  appointments,
  diagnoses,
  indicators,
}: {
  profile: ProfileRow
  medications: MedicationRow[]
  appointments: AppointmentRow[]
  diagnoses: DiagnosisRow[]
  indicators: IndicatorRow[]
}) {
  const lines: string[] = []

  lines.push('DATOS PERSONALES')
  if (profile) {
    lines.push(`Nombre: ${profile.full_name}`)
    if (profile.date_of_birth)
      lines.push(`Fecha de nacimiento: ${profile.date_of_birth}`)
    if (profile.gender) lines.push(`Género: ${profile.gender}`)
    if (profile.blood_type) lines.push(`Tipo de sangre: ${profile.blood_type}`)
    if (profile.allergies) lines.push(`Alergias: ${profile.allergies}`)
    if (profile.medical_notes)
      lines.push(`Notas médicas importantes: ${profile.medical_notes}`)
  } else {
    lines.push('No hay datos de perfil disponibles.')
  }

  lines.push('', 'MEDICAMENTOS ACTIVOS')
  if (medications.length === 0) {
    lines.push('Ninguno registrado.')
  } else {
    medications.forEach((m) => {
      lines.push(
        `- ${m.name}${m.dose ? `, ${m.dose}` : ''}${m.frequency ? `, ${m.frequency}` : ''}`
      )
    })
  }

  lines.push('', 'ÚLTIMAS CITAS')
  if (appointments.length === 0) {
    lines.push('Ninguna registrada.')
  } else {
    appointments.forEach((a) => {
      const doctor = a.doctors?.name ? ` con ${a.doctors.name}` : ''
      const diagnosis = a.diagnosis ? ` — Diagnóstico: ${a.diagnosis}` : ''
      lines.push(
        `- ${a.date}: ${a.specialty || 'Consulta médica'}${doctor} (${a.status})${diagnosis}`
      )
    })
  }

  lines.push('', 'DIAGNÓSTICOS ACTIVOS')
  if (diagnoses.length === 0) {
    lines.push('Ninguno registrado.')
  } else {
    diagnoses.forEach((d) => {
      lines.push(`- ${d.name}${d.is_chronic ? ' (crónico)' : ''}`)
    })
  }

  lines.push('', 'ÚLTIMOS INDICADORES')
  if (indicators.length === 0) {
    lines.push('Ninguno registrado.')
  } else {
    indicators.forEach((i) => {
      const value =
        i.type === 'presion'
          ? `${i.value_primary}/${i.value_secondary}${i.unit ? ` ${i.unit}` : ''}`
          : `${i.value_primary}${i.unit ? ` ${i.unit}` : ''}`
      lines.push(`- ${i.type}: ${value} (${i.measured_at})`)
    })
  }

  return lines.join('\n')
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const { data: userRow } = await supabase
    .from('users')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (userRow?.plan !== 'premium') {
    return NextResponse.json({ error: 'Premium required' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const message = body?.message
  const profileId = body?.profileId

  if (!message || typeof message !== 'string' || !profileId) {
    return NextResponse.json(
      { error: 'message y profileId son requeridos' },
      { status: 400 }
    )
  }

  const [
    { data: profile },
    { data: medications },
    { data: appointments },
    { data: diagnoses },
    { data: indicators },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'full_name, date_of_birth, gender, blood_type, allergies, medical_notes'
      )
      .eq('id', profileId)
      .single(),
    supabase
      .from('medications')
      .select('name, dose, frequency')
      .eq('profile_id', profileId)
      .eq('is_active', true),
    supabase
      .from('appointments')
      .select('date, specialty, status, diagnosis, doctors ( name )')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('diagnoses')
      .select('name, is_chronic')
      .eq('profile_id', profileId)
      .eq('is_active', true),
    supabase
      .from('health_indicators')
      .select('type, value_primary, value_secondary, unit, measured_at')
      .eq('profile_id', profileId)
      .order('measured_at', { ascending: false })
      .limit(3),
  ])

  const context = buildMedicalContext({
    profile: profile as ProfileRow,
    medications: (medications as MedicationRow[] | null) ?? [],
    appointments: (appointments as unknown as AppointmentRow[] | null) ?? [],
    diagnoses: (diagnoses as DiagnosisRow[] | null) ?? [],
    indicators: (indicators as IndicatorRow[] | null) ?? [],
  })

  const systemPrompt = `Eres un asistente médico personal de VidaRecord.
Tu función es ayudar al usuario a organizar y entender su información médica personal.
NUNCA diagnosticas, NUNCA recomiendas medicamentos, NUNCA reemplazas al médico.
Solo organizas, explicas y resumes la información que el usuario ya tiene registrada.
Siempre responde en español.

Información médica del usuario:
${context}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')

    return NextResponse.json({ response: textBlock?.text ?? '' })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'No se pudo obtener respuesta del asistente' },
      { status: 500 }
    )
  }
}
