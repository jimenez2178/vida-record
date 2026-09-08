'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AppointmentStatus = 'programada' | 'completada' | 'cancelada'

export type Appointment = {
  id: string
  profile_id: string
  user_id: string
  doctor_id: string | null
  date: string
  time: string | null
  specialty: string | null
  clinic_name: string | null
  reason: string | null
  diagnosis: string | null
  notes: string | null
  next_appointment_date: string | null
  status: AppointmentStatus
  created_at: string
  doctors: { name: string } | null
}

const statusStyles: Record<
  AppointmentStatus,
  { badge: string; border: string; label: string }
> = {
  programada: {
    badge: 'bg-blue-100 text-blue-700',
    border: 'border-blue-500',
    label: 'Programada',
  },
  completada: {
    badge: 'bg-green-100 text-green-700',
    border: 'border-green-500',
    label: 'Completada',
  },
  cancelada: {
    badge: 'bg-gray-100 text-gray-500',
    border: 'border-gray-400',
    label: 'Cancelada',
  },
}

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))
  return date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' })
}

export default function AppointmentCard({
  appointment,
  onEdit,
  onDelete,
}: {
  appointment: Appointment
  onEdit: (appointment: Appointment) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const styles = statusStyles[appointment.status]
  const time = formatTime(appointment.time)

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar esta consulta? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointment.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar la consulta. Intenta de nuevo.')
      return
    }

    onDelete(appointment.id)
  }

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm p-5 border-l-4 ${styles.border}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-800">
            {appointment.specialty || 'Consulta médica'}
          </p>
          {appointment.doctors?.name && (
            <p className="text-sm text-gray-600 mt-0.5">
              {appointment.doctors.name}
            </p>
          )}
          {appointment.clinic_name && (
            <p className="text-sm text-gray-500">{appointment.clinic_name}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(appointment.date)}
            {time ? ` · ${time}` : ''}
          </p>
          {appointment.diagnosis && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {appointment.diagnosis}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${styles.badge}`}
          >
            {styles.label}
          </span>

          <div className="relative">
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
                      onEdit(appointment)
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
        </div>
      </div>
    </div>
  )
}
