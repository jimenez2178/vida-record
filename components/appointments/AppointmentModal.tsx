'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, AppointmentStatus } from './AppointmentCard'

export default function AppointmentModal({
  profileId,
  userId,
  appointment,
  onClose,
  onSuccess,
}: {
  profileId: string
  userId: string
  appointment: Appointment | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()
  const isEditing = Boolean(appointment)

  const [date, setDate] = useState(appointment?.date ?? '')
  const [time, setTime] = useState(appointment?.time ?? '')
  const [specialty, setSpecialty] = useState(appointment?.specialty ?? '')
  const [doctorName, setDoctorName] = useState(appointment?.doctors?.name ?? '')
  const [clinicName, setClinicName] = useState(appointment?.clinic_name ?? '')
  const [reason, setReason] = useState(appointment?.reason ?? '')
  const [diagnosis, setDiagnosis] = useState(appointment?.diagnosis ?? '')
  const [notes, setNotes] = useState(appointment?.notes ?? '')
  const [nextAppointmentDate, setNextAppointmentDate] = useState(
    appointment?.next_appointment_date ?? ''
  )
  const [status, setStatus] = useState<AppointmentStatus>(
    appointment?.status ?? 'programada'
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!date || !specialty.trim()) {
      setError('La fecha y la especialidad son obligatorias.')
      return
    }

    setSaving(true)

    let doctorId: string | null = appointment?.doctor_id ?? null
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
      date,
      time: time || null,
      specialty: specialty.trim(),
      clinic_name: clinicName.trim() || null,
      reason: reason.trim() || null,
      diagnosis: diagnosis.trim() || null,
      notes: notes.trim() || null,
      next_appointment_date: nextAppointmentDate || null,
      status,
    }

    const { error: saveError } = appointment
      ? await supabase.from('appointments').update(payload).eq('id', appointment.id)
      : await supabase.from('appointments').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar la consulta. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar consulta' : 'Nueva consulta'}
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
                htmlFor="specialty"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Especialidad
              </label>
              <input
                id="specialty"
                type="text"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Ej: Cardiología, Urología, Medicina interna"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="date"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Fecha
              </label>
              <input
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="doctorName"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Médico
              </label>
              <input
                id="doctorName"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Nombre del médico"
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
              >
                <option value="programada">Programada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
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
                    htmlFor="time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hora
                  </label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="clinicName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Centro médico
                  </label>
                  <input
                    id="clinicName"
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Nombre del centro o clínica"
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Motivo de consulta
                  </label>
                  <textarea
                    id="reason"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="diagnosis"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Diagnóstico recibido
                  </label>
                  <textarea
                    id="diagnosis"
                    rows={3}
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notas personales
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="nextAppointmentDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Próxima cita recomendada
                  </label>
                  <input
                    id="nextAppointmentDate"
                    type="date"
                    value={nextAppointmentDate}
                    onChange={(e) => setNextAppointmentDate(e.target.value)}
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
              {saving ? 'Guardando...' : 'Guardar consulta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
