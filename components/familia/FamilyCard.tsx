'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type FamilyProfile = {
  id: string
  user_id: string
  full_name: string
  is_owner: boolean
  relationship: string | null
  date_of_birth: string | null
  gender: string | null
  blood_type: string | null
  allergies: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  avatar_url: string | null
  created_at: string
}

export const relationshipOptions = [
  { value: 'hijo', label: 'Hijo/a' },
  { value: 'padre_madre', label: 'Padre/Madre' },
  { value: 'esposo', label: 'Esposo/a' },
  { value: 'hermano', label: 'Hermano/a' },
  { value: 'abuelo', label: 'Abuelo/a' },
  { value: 'otro', label: 'Otro' },
] as const

const relationshipLabels: Record<string, string> = Object.fromEntries(
  relationshipOptions.map((option) => [option.value, option.label])
)

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null

  const birth = new Date(`${dateOfBirth}T00:00:00`)
  const today = new Date()

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export default function FamilyCard({
  profile,
  onEdit,
  onDelete,
}: {
  profile: FamilyProfile
  onEdit: (profile: FamilyProfile) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [navigating, setNavigating] = useState(false)

  const initial = profile.full_name.trim().charAt(0).toUpperCase() || '?'
  const age = calculateAge(profile.date_of_birth)

  const handleViewHistory = async () => {
    setNavigating(true)

    const { error } = await supabase
      .from('users')
      .update({ active_profile_id: profile.id })
      .eq('id', profile.user_id)

    if (error) {
      setNavigating(false)
      window.alert('No se pudo cambiar de perfil. Intenta de nuevo.')
      return
    }

    window.location.href = '/dashboard'
  }

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      `¿Seguro que quieres eliminar el perfil de ${profile.full_name}? Se borrará todo su historial médico y no se puede deshacer.`
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase.from('profiles').delete().eq('id', profile.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el perfil. Intenta de nuevo.')
      return
    }

    onDelete(profile.id)
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg shrink-0">
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <p className="text-base font-bold text-gray-800 truncate">
                {profile.full_name}
              </p>
              {profile.is_owner ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Tu perfil
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  {relationshipLabels[profile.relationship ?? ''] ??
                    profile.relationship ??
                    'Familiar'}
                </span>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-sm text-gray-500">
              {age !== null && <span>{age} años</span>}
              {profile.blood_type && <span>Tipo {profile.blood_type}</span>}
            </div>
          </div>
        </div>

        {!profile.is_owner && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Más opciones"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M12 6.75a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 20.25a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(profile)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleViewHistory}
        disabled={navigating}
        className="mt-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
      >
        {navigating ? 'Cargando...' : 'Ver historial'}
      </button>
    </div>
  )
}
