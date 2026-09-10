import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isTomorrow(dateStr: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const target = new Date(`${dateStr}T00:00:00`)
  return target.getTime() === tomorrow.getTime()
}

function formatDateEs(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildReminderMessage({
  profileName,
  specialty,
  doctorName,
  clinicName,
  date,
  time,
}: {
  profileName: string
  specialty: string | null
  doctorName: string | null
  clinicName: string | null
  date: string
  time: string | null
}) {
  return `🏥 *Recordatorio de cita médica*

👤 Paciente: ${profileName}
🩺 Especialidad: ${specialty || 'No especificada'}
👨‍⚕️ Médico: ${doctorName || 'No especificado'}
🏨 Centro: ${clinicName || 'No especificado'}
📅 Fecha: ${formatDateEs(date)}
🕐 Hora: ${time || 'No especificada'}

_VidaRecord — vida-record.vercel.app_`
}

export async function POST(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const appointmentId = body?.appointmentId
  const userId = body?.userId

  if (!appointmentId || typeof appointmentId !== 'string') {
    return NextResponse.json(
      { error: 'appointmentId es requerido' },
      { status: 400 }
    )
  }

  if (userId !== user.id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(
      'id, date, time, specialty, clinic_name, status, profile_id, doctors ( name )'
    )
    .eq('id', appointmentId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!appointment) {
    return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 })
  }

  if (appointment.status !== 'programada' || !isTomorrow(appointment.date)) {
    return NextResponse.json({ success: true, sent: false })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', appointment.profile_id)
    .maybeSingle()

  const message = buildReminderMessage({
    profileName: profile?.full_name ?? 'Paciente',
    specialty: appointment.specialty,
    doctorName:
      (appointment.doctors as unknown as { name: string } | null)?.name ??
      null,
    clinicName: appointment.clinic_name,
    date: appointment.date,
    time: appointment.time,
  })

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )
    const telegramData = await telegramRes.json().catch(() => null)
    console.log(
      'TELEGRAM RESULT:',
      telegramRes.status,
      JSON.stringify(telegramData)
    )
  } catch (error) {
    console.error('TELEGRAM ERROR:', JSON.stringify(error))
  }

  return NextResponse.json({ success: true, sent: true })
}
