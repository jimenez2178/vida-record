import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/ai/client'
import { createClient } from '@/lib/supabase/server'

const IMAGE_MEDIA_TYPES: Record<string, 'image/jpeg' | 'image/png'> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

const SYSTEM_PROMPT = `Eres un asistente médico que ayuda a entender resultados médicos en lenguaje sencillo.
Explica qué significa este resultado/documento médico en términos simples que un paciente pueda entender. Menciona valores importantes.
NUNCA diagnostiques ni recomiendes tratamientos.
Siempre sugiere consultar con el médico.
Responde en español.`

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
  const studyId = body?.studyId
  const fileUrl = body?.fileUrl

  if (!studyId || !fileUrl || typeof fileUrl !== 'string') {
    return NextResponse.json(
      { error: 'studyId y fileUrl son requeridos' },
      { status: 400 }
    )
  }

  const extension = fileUrl.split('.').pop()?.toLowerCase() ?? ''
  const isPdf = extension === 'pdf'
  const imageMediaType = IMAGE_MEDIA_TYPES[extension]

  if (!isPdf && !imageMediaType) {
    return NextResponse.json(
      { error: 'Tipo de archivo no soportado' },
      { status: 400 }
    )
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('medical-documents')
    .createSignedUrl(fileUrl, 60)

  if (signedUrlError || !signedUrlData) {
    return NextResponse.json(
      { error: 'No se pudo acceder al archivo' },
      { status: 500 }
    )
  }

  const fileResponse = await fetch(signedUrlData.signedUrl)

  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: 'No se pudo descargar el archivo' },
      { status: 500 }
    )
  }

  const arrayBuffer = await fileResponse.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  const fileBlock = isPdf
    ? ({
        type: 'document' as const,
        source: {
          type: 'base64' as const,
          media_type: 'application/pdf' as const,
          data: base64,
        },
      } as const)
    : ({
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: imageMediaType,
          data: base64,
        },
      } as const)

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            fileBlock,
            { type: 'text', text: 'Explica este documento médico.' },
          ],
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const summary = textBlock?.text ?? ''

    const { error: updateError } = await supabase
      .from('studies')
      .update({ ai_summary: summary, ai_processed: true })
      .eq('id', studyId)

    if (updateError) {
      return NextResponse.json(
        { error: 'No se pudo guardar el análisis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('AI analyze error:', error)
    return NextResponse.json(
      { error: 'No se pudo analizar el documento' },
      { status: 500 }
    )
  }
}
