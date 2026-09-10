'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PayPalButton from './PayPalButton'

type User = {
  id: string
  email: string
  plan: 'free' | 'premium'
  plan_expires_at: string | null
}

type Profile = {
  full_name: string
  avatar_url: string | null
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AccountSettings({
  user,
  profile,
}: {
  user: User
  profile: Profile
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const upgraded = searchParams.get('upgraded') === 'true'
  const cancelled = searchParams.get('cancelled') === 'true'

  const initial = profile.full_name.trim().charAt(0).toUpperCase() || '?'

  const [resettingPassword, setResettingPassword] = useState(false)
  const [passwordResetSent, setPasswordResetSent] = useState(false)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const handleCancelPlan = async () => {
    const confirmed = window.confirm(
      '¿Seguro que quieres cancelar tu plan Premium? Volverás al plan gratuito de inmediato.'
    )

    if (!confirmed) return

    setCancelling(true)
    setCancelError('')

    try {
      const res = await fetch('/api/account/cancel-plan', { method: 'POST' })

      if (!res.ok) {
        throw new Error('cancel-failed')
      }

      router.refresh()
    } catch {
      setCancelError('No se pudo cancelar el plan. Intenta de nuevo.')
    } finally {
      setCancelling(false)
    }
  }

  const handleResetPassword = async () => {
    setResettingPassword(true)
    await supabase.auth.resetPasswordForEmail(user.email)
    setResettingPassword(false)
    setPasswordResetSent(true)
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'ELIMINAR') return

    setDeleting(true)
    setDeleteError('')

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })

      if (!res.ok) {
        throw new Error('delete-failed')
      }

      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      setDeleting(false)
      setDeleteError('No se pudo eliminar la cuenta. Intenta de nuevo.')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h1>

      {upgraded && (
        <div className="mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          🎉 ¡Bienvenido a Premium! Tu cuenta ha sido actualizada.
        </div>
      )}

      {cancelled && (
        <div className="mb-6 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
          El pago fue cancelado. Puedes intentarlo de nuevo.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        <section className="p-6">
          <h2 className="text-gray-800 font-semibold mb-4">Mi cuenta</h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-700 font-bold text-xl shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 truncate">
                {profile.full_name}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <span
                className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mt-2 ${
                  user.plan === 'premium'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {user.plan === 'premium' ? 'Plan Premium ⭐' : 'Plan Gratuito'}
              </span>
            </div>
          </div>
        </section>

        <section className="p-6">
          <h2 className="text-gray-800 font-semibold mb-4">Mi plan</h2>

          {user.plan === 'premium' ? (
            <div className="bg-green-50 rounded-xl p-5">
              <p className="font-semibold text-green-800">
                Plan Premium activo ⭐
              </p>
              {user.plan_expires_at && (
                <p className="text-sm text-green-700 mt-1">
                  Vence el {formatDate(user.plan_expires_at)} — si no renuevas,
                  volverás automáticamente al plan gratuito.
                </p>
              )}
              <button
                type="button"
                onClick={handleCancelPlan}
                disabled={cancelling}
                className="mt-4 bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-700 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
              >
                {cancelling ? 'Cancelando...' : 'Cancelar Premium y volver a Gratuito'}
              </button>

              {cancelError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                  {cancelError}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 rounded-xl p-5">
              <p className="font-semibold text-gray-800">
                Estás en el plan gratuito
              </p>
              <ul className="text-sm text-gray-600 mt-3 space-y-1.5">
                <li>✗ Máximo 5 consultas</li>
                <li>✗ Máximo 3 medicamentos activos</li>
                <li>✗ Máximo 5 documentos</li>
                <li>✗ Sin resumen PDF</li>
                <li>✗ Sin asistente IA</li>
                <li>✗ Sin perfiles familiares</li>
              </ul>
              <div className="mt-5">
                <PayPalButton />
              </div>
            </div>
          )}
        </section>

        <section className="p-6">
          <h2 className="text-gray-800 font-semibold mb-4">Seguridad</h2>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resettingPassword}
            className="bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60 text-gray-700 text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
          >
            {resettingPassword ? 'Enviando...' : 'Cambiar contraseña'}
          </button>

          {passwordResetSent && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3">
              Te enviamos un correo con instrucciones para cambiar tu
              contraseña
            </p>
          )}
        </section>

        <section className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="text-red-700 font-semibold">Eliminar cuenta</h2>
            <p className="text-sm text-red-700/80 mt-2">
              Esta acción es permanente e irreversible. Se eliminarán todos
              tus datos médicos, consultas, medicamentos y documentos.
            </p>
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              Eliminar mi cuenta
            </button>
          </div>
        </section>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Eliminar cuenta
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Esta acción no se puede deshacer. Se borrarán permanentemente
              todos tus datos médicos, documentos, consultas y medicamentos.
              Escribe <span className="font-semibold">ELIMINAR</span> para
              confirmar.
            </p>

            {deleteError && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
                {deleteError}
              </div>
            )}

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full mt-4 rounded-lg border border-gray-300 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
            />

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setConfirmText('')
                  setDeleteError('')
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmText !== 'ELIMINAR' || deleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Eliminar mi cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
