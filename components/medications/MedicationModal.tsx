'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Medication } from './MedicationCard'

export default function MedicationModal({
  profileId,
  userId,
  medication,
  onClose,
  onSuccess,
}: {
  profileId: string
  userId: string
  medication: Medication | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()
  const isEditing = Boolean(medication)

  const [name, setName] = useState(medication?.name ?? '')
  const [dose, setDose] = useState(medication?.dose ?? '')
  const [frequency, setFrequency] = useState(medication?.frequency ?? '')
  const [startDate, setStartDate] = useState(medication?.start_date ?? '')
  const [endDate, setEndDate] = useState(medication?.end_date ?? '')
  const [doctorName, setDoctorName] = useState(medication?.doctors?.name ?? '')
  const [quantityInitial, setQuantityInitial] = useState(
    medication?.quantity_initial != null ? String(medication.quantity_initial) : ''
  )
  const [quantityRemaining, setQuantityRemaining] = useState(
    medication?.quantity_remaining != null
      ? String(medication.quantity_remaining)
      : ''
  )
  const [isActive, setIsActive] = useState(medication?.is_active ?? true)
  const [notes, setNotes] = useState(medication?.notes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre del medicamento es obligatorio.')
      return
    }

    setSaving(true)

    let doctorId: string | null = medication?.doctor_id ?? null
    const trimmedDoctorName = doctorName.trim()

    if (trimmedDoctorName) {
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', trimmedDoctorName)
        .maybeSingle()

      if (existingDoctor) {
        doctorId = existingDoctor.id
      } else {
        const { data: newDoctor, error: doctorError } = await supabase
          .from('doctors')
          .insert({ user_id: userId, name: trimmedDoctorName })
          .select('id')
          .single()

        if (doctorError || !newDoctor) {
          setSaving(false)
          setError('No se pudo guardar el médico. Intenta de nuevo.')
          return
        }
        doctorId = newDoctor.id
      }
    } else {
      doctorId = null
    }

    const payload = {
      profile_id: profileId,
      user_id: userId,
      doctor_id: doctorId,
      name: name.trim(),
      dose: dose.trim() || null,
      frequency: frequency.trim() || null,
      start_date: startDate || null,
      end_date: endDate || null,
      quantity_initial: quantityInitial === '' ? null : Number(quantityInitial),
      quantity_remaining:
        quantityRemaining === '' ? null : Number(quantityRemaining),
      is_active: isActive,
      notes: notes.trim() || null,
    }

    const { error: saveError } = medication
      ? await supabase.from('medications').update(payload).eq('id', medication.id)
      : await supabase.from('medications').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar el medicamento. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar medicamento' : 'Nuevo medicamento'}
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
                htmlFor="name"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Nombre del medicamento
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Losartán"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="dose"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Dosis
              </label>
              <input
                id="dose"
                type="text"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ej: 10mg, 500mg"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="frequency"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Frecuencia
              </label>
              <input
                id="frequency"
                type="text"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Ej: 1 vez al día, cada 8 horas"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-6 h-6 rounded border-2 border-gray-300 text-blue-700 focus:ring-blue-500"
              />
              <span className="text-base font-semibold text-gray-700">
                ¿Está activo?
              </span>
            </label>

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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha inicio
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha fin
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="doctorName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Médico que lo indicó
                  </label>
                  <input
                    id="doctorName"
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Nombre del médico"
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="quantityInitial"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Cantidad inicial
                    </label>
                    <input
                      id="quantityInitial"
                      type="number"
                      min={0}
                      value={quantityInitial}
                      onChange={(e) => setQuantityInitial(e.target.value)}
                      placeholder="Ej: 30 pastillas"
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="quantityRemaining"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Cantidad restante
                    </label>
                    <input
                      id="quantityRemaining"
                      type="number"
                      min={0}
                      value={quantityRemaining}
                      onChange={(e) => setQuantityRemaining(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                    />
                  </div>
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
              {saving ? 'Guardando...' : 'Guardar medicamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
