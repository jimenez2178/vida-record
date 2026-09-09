import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function buildWelcomeEmailHtml(name: string) {
  return `
<div style="background-color:#f3f4f6;padding:40px 16px;font-family:Arial, Helvetica, sans-serif;">
  <div style="max-width:480px;margin:0 auto;background-color:#ffffff;border-radius:16px;padding:40px 32px;">
    <p style="font-size:28px;font-weight:bold;color:#1e3a8a;margin:0 0 24px;text-align:center;">
      💙 VidaRecord
    </p>

    <h1 style="font-size:20px;font-weight:bold;color:#1f2937;margin:0 0 16px;text-align:center;">
      ¡Hola, ${name}! Bienvenido a VidaRecord
    </h1>

    <p style="font-size:14px;color:#4b5563;line-height:1.6;margin:0 0 24px;">
      Tu historial médico ya tiene un nuevo hogar. Ahora puedes organizar tus citas, medicamentos, estudios y documentos médicos en un solo lugar.
    </p>

    <ul style="list-style:none;padding:0;margin:0 0 32px;">
      <li style="font-size:14px;color:#374151;margin-bottom:12px;">📅 Registrar tus consultas médicas</li>
      <li style="font-size:14px;color:#374151;margin-bottom:12px;">💊 Controlar tus medicamentos</li>
      <li style="font-size:14px;color:#374151;margin-bottom:12px;">🧪 Guardar tus estudios y resultados</li>
      <li style="font-size:14px;color:#374151;margin-bottom:0;">📄 Generar tu resumen médico PDF</li>
    </ul>

    <div style="text-align:center;margin-bottom:32px;">
      <a
        href="https://vida-record.vercel.app/dashboard"
        style="display:inline-block;background-color:#1d4ed8;color:#ffffff;font-size:16px;font-weight:bold;padding:14px 32px;border-radius:10px;text-decoration:none;"
      >
        Ir a mi cuenta
      </a>
    </div>

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 4px;">
      VidaRecord — Tu historial médico. Siempre contigo.
    </p>
    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
      Desarrollado por Nexus Digital — Santo Domingo, RD
    </p>
  </div>
</div>
`
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
    await Promise.all([
      resend.emails.send({
        from: 'VidaRecord <onboarding@resend.dev>',
        to: email,
        subject: '¡Bienvenido a VidaRecord! 🩺',
        html: buildWelcomeEmailHtml(name),
      }),
      fetch(
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
      ),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('New user notification error:', error)
    return NextResponse.json(
      { error: 'No se pudieron enviar las notificaciones' },
      { status: 500 }
    )
  }
}
