// Envía los recordatorios de citas médicas de mañana por Telegram.
// Corre en GitHub Actions (no en Vercel) porque las funciones de Vercel Hobby
// en este proyecto tienen bloqueadas las solicitudes salientes hacia
// api.telegram.org. Duplica la lógica de app/api/cron/appointment-reminders/route.ts
// pero habla directo con la API REST de Supabase (sin @supabase/supabase-js)
// para no requerir `npm install` en el workflow.

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

for (const [name, value] of Object.entries({
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  TELEGRAM_BOT_TOKEN,
})) {
  if (!value) {
    console.error(`Falta la variable de entorno ${name}`)
    process.exit(1)
  }
}

function tomorrowDateString() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const pad = (n) => String(n).padStart(2, '0')
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`
}

function formatDateEs(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildReminderMessage({ profileName, specialty, doctorName, clinicName, date, time }) {
  return `🏥 *Recordatorio de cita médica*

👤 Paciente: ${profileName}
🩺 Especialidad: ${specialty || 'No especificada'}
👨‍⚕️ Médico: ${doctorName || 'No especificado'}
🏨 Centro: ${clinicName || 'No especificado'}
📅 Fecha: ${formatDateEs(date)}
🕐 Hora: ${time || 'No especificada'}

_VidaRecord — vida-record.vercel.app_`
}

async function supabaseRest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
  })
  if (!res.ok) {
    throw new Error(`Supabase REST ${path} -> ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

async function sendTelegramMessage(chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
  return res.ok
}

async function main() {
  const tomorrow = tomorrowDateString()

  const appointments = await supabaseRest(
    `appointments?select=id,date,time,specialty,clinic_name,user_id,profile_id,doctors(name)` +
      `&status=eq.programada&date=eq.${tomorrow}`
  )

  let remindersSent = 0

  for (const appt of appointments) {
    const [users, profiles] = await Promise.all([
      supabaseRest(`users?select=email,telegram_chat_id&id=eq.${appt.user_id}`),
      supabaseRest(`profiles?select=full_name&id=eq.${appt.profile_id}`),
    ])

    const userRow = users[0]
    const profileRow = profiles[0]
    const chatId = userRow?.telegram_chat_id || TELEGRAM_CHAT_ID

    if (!chatId) {
      continue
    }

    const message = buildReminderMessage({
      profileName: profileRow?.full_name ?? 'Paciente',
      specialty: appt.specialty,
      doctorName: appt.doctors?.name ?? null,
      clinicName: appt.clinic_name,
      date: appt.date,
      time: appt.time,
    })

    try {
      const sent = await sendTelegramMessage(chatId, message)
      if (sent) remindersSent += 1
      console.log('APPOINTMENT REMINDER:', userRow?.email, appt.id, sent)
    } catch (err) {
      console.error('TELEGRAM ERROR:', err)
    }
  }

  console.log(`Recordatorios enviados: ${remindersSent}/${appointments.length}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
