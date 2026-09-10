import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

function tomorrowDateString() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
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

async function sendTelegramMessage(chatId: string, text: string) {
  const res = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    }
  )
  return res.ok
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tomorrow = tomorrowDateString()

  const { data: appointments, error } = await supabaseAdmin
    .from('appointments')
    .select(
      'id, date, time, specialty, clinic_name, user_id, profile_id, doctors ( name )'
    )
    .eq('status', 'programada')
    .eq('date', tomorrow)

  if (error) {
    return NextResponse.json(
      { error: 'No se pudieron consultar las citas' },
      { status: 500 }
    )
  }

  let remindersSent = 0

  for (const appt of appointments ?? []) {
    const [{ data: userRow }, { data: profileRow }] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('email, telegram_chat_id')
        .eq('id', appt.user_id)
        .maybeSingle(),
      supabaseAdmin
        .from('profiles')
        .select('full_name')
        .eq('id', appt.profile_id)
        .maybeSingle(),
    ])

    const chatId = userRow?.telegram_chat_id || process.env.TELEGRAM_CHAT_ID

    if (!chatId) {
      continue
    }

    const message = buildReminderMessage({
      profileName: profileRow?.full_name ?? 'Paciente',
      specialty: appt.specialty,
      doctorName:
        (appt.doctors as unknown as { name: string } | null)?.name ?? null,
      clinicName: appt.clinic_name,
      date: appt.date,
      time: appt.time,
    })

    try {
      const sent = await sendTelegramMessage(chatId, message)
      if (sent) {
        remindersSent += 1
      }
      console.log('APPOINTMENT REMINDER:', userRow?.email, appt.id, sent)
    } catch (err) {
      console.error('TELEGRAM ERROR:', JSON.stringify(err))
    }
  }

  return NextResponse.json({ success: true, reminders_sent: remindersSent })
}
