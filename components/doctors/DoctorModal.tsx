'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Doctor } from './DoctorCard'

export default function DoctorModal({
  userId,
  doctor,
  onClose,
  onSuccess,
}: {
  userId: string
  doctor: Doctor | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()
  const isEditing = Boolean(doctor)

  const [name, setName] = useState(doctor?.name ?? '')
  const [specialty, setSpecialty] = useState(doctor?.specialty ?? '')
  const [phone, setPhone] = useState(doctor?.phone ?? '')
  const [email, setEmail] = useState(doctor?.email ?? '')
  const [clinicName, setClinicName] = useState(doctor?.clinic_name ?? '')
  const [address, setAddress] = useState(doctor?.address ?? '')
  const [notes, setNotes] = useState(doctor?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre completo es obligatorio.')
      return
    }

    setSaving(true)

    const payload = {
      user_id: userId,
      name: name.trim(),
      specialty: specialty.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      clinic_name: clinicName.trim() || null,
      address: address.trim() || null,
      notes: notes.trim() || null,
    }

    const { error: saveError } = doctor
      ? await supabase.from('doctors').update(payload).eq('id', doctor.id)
      : await supabase.from('doctors').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar el médico. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar médico' : 'Nuevo médico'}
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
          <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. / Dra. Nombre Apellido"
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="specialty"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Especialidad
              </label>
              <input
                id="specialty"
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej: Cardiología, Urología, Medicina interna"
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="clinicName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Centro médico / Clínica
              </label>
              <input
                id="clinicName"
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dirección
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Notas
              </label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar médico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
