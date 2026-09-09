'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { FamilyProfile } from './FamilyCard'
import { relationshipOptions } from './FamilyCard'

const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
]

export default function FamilyModal({
  userId,
  profile,
  onClose,
  onSuccess,
}: {
  userId: string
  profile: FamilyProfile | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()
  const isEditing = Boolean(profile)

  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [relationship, setRelationship] = useState(profile?.relationship ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth ?? '')
  const [gender, setGender] = useState(profile?.gender ?? '')
  const [bloodType, setBloodType] = useState(profile?.blood_type ?? '')
  const [allergies, setAllergies] = useState(profile?.allergies ?? '')
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile?.emergency_contact_name ?? ''
  )
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile?.emergency_contact_phone ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio.')
      return
    }

    if (!relationship) {
      setError('La relación es obligatoria.')
      return
    }

    setSaving(true)

    const payload = {
      full_name: fullName.trim(),
      relationship,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      blood_type: bloodType || null,
      allergies: allergies.trim() || null,
      emergency_contact_name: emergencyContactName.trim() || null,
      emergency_contact_phone: emergencyContactPhone.trim() || null,
    }

    const { error: saveError } = profile
      ? await supabase.from('profiles').update(payload).eq('id', profile.id)
      : await supabase
          .from('profiles')
          .insert({ ...payload, user_id: userId, is_owner: false })

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar el familiar. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar familiar' : 'Agregar familiar'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: María González"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="relationship"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Relación
              </label>
              <select
                id="relationship"
                required
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
              >
                <option value="">Selecciona una opción</option>
                {relationshipOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-base font-semibold text-gray-700 mb-1.5"
                >
                  Fecha de nacimiento
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-base font-semibold text-gray-700 mb-1.5"
                >
                  Género
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
                >
                  <option value="">Selecciona una opción</option>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowMoreOptions((v) => !v)}
              className="flex items-center gap-1.5 text-blue-600 text-sm font-medium bg-transparent border-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className={`w-4 h-4 transition-transform duration-200 ${
                  showMoreOptions ? 'rotate-180' : ''
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
              {showMoreOptions ? 'Ver menos opciones' : '+ Ver más opciones'}
            </button>

            {showMoreOptions && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="bloodType"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tipo de sangre
                  </label>
                  <input
                    id="bloodType"
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    placeholder="Ej: O+"
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Alergias
                  </label>
                  <textarea
                    id="allergies"
                    rows={3}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Ej: Penicilina, Aspirina, Polen..."
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="emergencyContactName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Contacto de emergencia
                    </label>
                    <input
                      id="emergencyContactName"
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="emergencyContactPhone"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Teléfono de emergencia
                    </label>
                    <input
                      id="emergencyContactPhone"
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[56px] px-4 py-4 text-lg font-bold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto min-h-[56px] bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-bold rounded-xl px-5 py-4 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar familiar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
