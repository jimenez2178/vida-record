import { NextResponse } from 'next/server'

const LOCAL_ORIGINS = ['http://localhost:3000']

function isAllowedOrigin(request: Request) {
  const source =
    request.headers.get('origin') ?? request.headers.get('referer')

  if (!source) return false

  let requestOrigin: string

  try {
    requestOrigin = new URL(source).origin
  } catch {
    return false
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const allowed = appUrl
    ? [...LOCAL_ORIGINS, new URL(appUrl).origin]
    : LOCAL_ORIGINS

  return allowed.includes(requestOrigin)
}

function buildTelegramMessage(name: string, email: string) {
  const formattedDate = new Date().toLocaleString('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'America/Santo_Domingo',
  })

  return `🩺 *Nuevo usuario en VidaRecord*

👤 Nombre: ${name}
📧 Email: ${email}
🕐 Fecha: ${formattedDate}

_VidaRecord — vida-record.vercel.app_`
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Origen no permitido' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const email = body?.email
  const name = body?.name

  if (!email || typeof email !== 'string' || !name || typeof name !== 'string') {
    return NextResponse.json(
      { error: 'email y name son requeridos' },
      { status: 400 }
    )
  }

  try {
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: buildTelegramMessage(name, email),
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

  return NextResponse.json({ success: true })
}
