'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { countdownLabel, daysUntil, formatDate as formatLongDate } from '@/lib/dates'

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
    badge: 'bg-emerald-100 text-emerald-700',
    border: 'border-emerald-500',
    label: 'Completada',
  },
  cancelada: {
    badge: 'bg-gray-100 text-gray-500',
    border: 'border-gray-300',
    label: 'Cancelada',
  },
}

const unconfirmedStyles = {
  badge: 'bg-amber-100 text-amber-800',
  border: 'border-amber-500',
  label: 'Sin confirmar',
}

function formatDate(dateStr: string) {
  const label = new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatTime(timeStr: string | null) {
  if (!timeStr) return null
  const [hours, minutes] = timeStr.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes))
  return date.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit' })
}

export function isUnconfirmed(appointment: Appointment) {
  return appointment.status === 'programada' && daysUntil(appointment.date) < 0
}

export default function AppointmentCard({
  appointment,
  followUpScheduled,
  onEdit,
  onDelete,
  onStatusChange,
  onScheduleFollowUp,
}: {
  appointment: Appointment
  followUpScheduled: boolean
  onEdit: (appointment: Appointment, options?: { expandDetails?: boolean }) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: AppointmentStatus) => void
  onScheduleFollowUp: (appointment: Appointment) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const unconfirmed = isUnconfirmed(appointment)
  const styles = unconfirmed ? unconfirmedStyles : statusStyles[appointment.status]
  const time = formatTime(appointment.time)
  const countdown =
    appointment.status === 'programada' ? countdownLabel(appointment.date) : null
  const isCancelled = appointment.status === 'cancelada'

  const details = [
    { label: 'Motivo', value: appointment.reason },
    { label: 'Diagnóstico recibido', value: appointment.diagnosis },
    { label: 'Notas', value: appointment.notes },
  ].filter((d) => d.value?.trim())

  const needsFollowUp =
    appointment.status === 'completada' &&
    Boolean(appointment.next_appointment_date) &&
    !followUpScheduled

  const missingNotes =
    appointment.status === 'completada' &&
    !appointment.diagnosis?.trim() &&
    !appointment.notes?.trim()

  const updateStatus = async (status: AppointmentStatus) => {
    setUpdating(true)
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointment.id)
    setUpdating(false)

    if (error) {
      window.alert('No se pudo actualizar la consulta. Intenta de nuevo.')
      return
    }

    onStatusChange(appointment.id, status)
  }

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
      className={`relative bg-white rounded-xl shadow-sm p-5 border-l-4 ${styles.border} ${
        isCancelled ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={`text-lg font-bold text-gray-800 ${
                isCancelled ? 'line-through decoration-gray-400' : ''
              }`}
            >
              {appointment.specialty || 'Consulta médica'}
            </p>
            {countdown && (
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  countdown === 'Hoy' || countdown === 'Mañana'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-50 text-blue-700'
                }`}
              >
                {countdown}
              </span>
            )}
          </div>
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
          {!expanded && appointment.diagnosis && (
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
                <div className="absolute right-0 top-9 z-20 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
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
                  {appointment.status === 'programada' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        updateStatus('cancelada')
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Marcar como cancelada
                    </button>
                  )}
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

      {expanded && (
        <dl className="mt-3 space-y-2 rounded-lg bg-gray-50 px-4 py-3">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {d.label}
              </dt>
              <dd className="text-sm text-gray-800 whitespace-pre-line">{d.value}</dd>
            </div>
          ))}
          {appointment.next_appointment_date && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Próxima cita recomendada
              </dt>
              <dd className="text-sm text-gray-800">
                {formatLongDate(appointment.next_appointment_date)}
              </dd>
            </div>
          )}
        </dl>
      )}

      {unconfirmed && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-amber-900">
            Esta cita ya pasó. ¿Asististe?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus('completada')}
              className="rounded-lg bg-blue-700 hover:bg-blue-800 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Sí, asistí
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus('cancelada')}
              className="rounded-lg border border-gray-300 bg-white hover:bg-gray-50 px-3 py-1.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
            >
              No, se canceló
            </button>
          </div>
        </div>
      )}

      {needsFollowUp && appointment.next_appointment_date && (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-blue-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Seguimiento recomendado:</span>{' '}
            {formatLongDate(appointment.next_appointment_date)}
          </p>
          <button
            type="button"
            onClick={() => onScheduleFollowUp(appointment)}
            className="shrink-0 rounded-lg bg-blue-700 hover:bg-blue-800 px-3 py-1.5 text-sm font-semibold text-white"
          >
            Agendar
          </button>
        </div>
      )}

      {(details.length > 0 || appointment.next_appointment_date || missingNotes) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {(details.length > 0 || appointment.next_appointment_date) && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              aria-expanded={expanded}
            >
              {expanded ? 'Ocultar detalles' : 'Ver detalles'}
            </button>
          )}
          {missingNotes && (
            <button
              type="button"
              onClick={() => onEdit(appointment, { expandDetails: true })}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              + Agregar lo que te dijo el médico
            </button>
          )}
        </div>
      )}
    </div>
  )
}
