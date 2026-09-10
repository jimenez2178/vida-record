'use client'

import { useEffect, useRef, useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const quickActions = [
  '¿Qué medicamentos tomo?',
  'Resumen de mis últimas consultas',
  '¿Cuándo fue mi última cita?',
  'Prepara preguntas para mi médico',
]

export default function AssistantChat({
  profileId,
}: {
  profileId: string
  userId: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError('')
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, profileId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'error')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ])
    } catch {
      setError('No se pudo obtener respuesta del asistente. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-blue-700">
          Asistente VidaRecord 🤖
        </h1>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
          Premium ⭐
        </span>
      </div>

      <div className="bg-amber-100 border-2 border-amber-300 text-amber-900 text-base font-medium rounded-xl px-4 py-3 mb-4 shrink-0">
        Este asistente te ayuda a organizar tu información médica. No
        reemplaza la consulta con tu médico.
      </div>

      <p className="text-gray-700 text-base font-semibold mb-2 shrink-0">
        💡 Toca una pregunta para empezar:
      </p>
      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {quickActions.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => sendMessage(action)}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-4 py-2.5 rounded-full shadow-sm disabled:opacity-60 transition-colors"
          >
            ✨ {action}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm p-4 space-y-4 mb-4">
        {messages.length === 0 && (
          <p className="text-base text-gray-600 text-center py-8">
            Pregúntame lo que necesites sobre tu historial médico.
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-base shrink-0 mr-2">
                🤖
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-base whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-700 text-white font-medium rounded-br-sm'
                  : 'bg-slate-100 text-slate-900 font-medium rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-base shrink-0 mr-2">
              🤖
            </div>
            <div className="bg-slate-100 text-slate-700 font-medium rounded-2xl rounded-bl-sm px-4 py-2.5 text-base">
              Pensando...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 shrink-0">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          disabled={loading}
          className="flex-1 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2.5 text-base text-gray-900 placeholder:text-gray-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 shadow-sm transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      </form>
    </div>
  )
}
