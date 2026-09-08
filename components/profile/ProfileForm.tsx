'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  full_name: string
  date_of_birth: string | null
  gender: string | null
  blood_type: string | null
  allergies: string | null
  medical_notes: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
}

const genderOptions = [
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
]

const bloodTypeOptions = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
  'No sé',
]

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(profile.date_of_birth ?? '')
  const [gender, setGender] = useState(profile.gender ?? '')
  const [bloodType, setBloodType] = useState(profile.blood_type ?? '')
  const [allergies, setAllergies] = useState(profile.allergies ?? '')
  const [medicalNotes, setMedicalNotes] = useState(profile.medical_notes ?? '')
  const [emergencyContactName, setEmergencyContactName] = useState(
    profile.emergency_contact_name ?? ''
  )
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    profile.emergency_contact_phone ?? ''
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!fullName.trim()) {
      setError('El nombre completo es obligatorio.')
      return
    }

    setSaving(true)

    const { error: saveError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        blood_type: bloodType || null,
        allergies: allergies.trim() || null,
        medical_notes: medicalNotes.trim() || null,
        emergency_contact_name: emergencyContactName.trim() || null,
        emergency_contact_phone: emergencyContactPhone.trim() || null,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar el perfil. Intenta de nuevo.')
      return
    }

    setSuccess(true)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">Mi perfil médico</h1>
      <p className="text-gray-500 mt-1 mb-6">
        Esta información aparece en tu resumen médico PDF
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✅ Perfil actualizado correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-800 font-semibold mb-4">
            Información personal
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha de nacimiento
                </label>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Género
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
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

            <div>
              <label
                htmlFor="bloodType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de sangre
              </label>
              <select
                id="bloodType"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full sm:w-1/2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Selecciona una opción</option>
                {bloodTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-800 font-semibold mb-4">
            Información médica importante
          </h2>

          <div className="space-y-4">
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

            <div>
              <label
                htmlFor="medicalNotes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notas médicas importantes
              </label>
              <textarea
                id="medicalNotes"
                rows={3}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                placeholder="Ej: Diabético insulinodependiente, marcapasos, prótesis..."
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-800 font-semibold mb-4">
            Contacto de emergencia
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="emergencyContactName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del contacto
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
                Teléfono del contacto
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
        </section>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg px-6 py-3 transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
