'use client'

import { useState } from 'react'

type Status = 'idle' | 'loading' | 'error'

export default function PayPalButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const handleClick = async () => {
    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'premium' }),
      })

      if (!res.ok) {
        throw new Error('create-order-failed')
      }

      const data = await res.json()

      if (!data.approvalUrl) {
        throw new Error('no-approval-url')
      }

      window.location.href = data.approvalUrl
    } catch {
      setStatus('error')
      setError('No se pudo iniciar el pago. Intenta de nuevo.')
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 transition-colors"
      >
        <span className="font-black italic tracking-tight">
          Pay<span className="text-blue-200">Pal</span>
        </span>
        <span>
          {status === 'loading'
            ? 'Redirigiendo...'
            : 'Pagar con PayPal — $4.95/mes'}
        </span>
      </button>

      {status === 'error' && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  )
}
