'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/hooks/usePlan'
import { todayDateString } from '@/lib/dates'
import FreeLimitBanner from '@/components/ui/FreeLimitBanner'
import AppointmentCard, {
  isUnconfirmed,
  type Appointment,
  type AppointmentStatus,
} from './AppointmentCard'
import AppointmentModal, { type AppointmentPrefill } from './AppointmentModal'

type Tab = 'proximas' | 'pasadas'

// Próximas: programadas de hoy en adelante. Todo lo demás (completadas,
// canceladas y programadas cuya fecha ya pasó) va en Pasadas.
function isUpcoming(appointment: Appointment, today: string) {
  return appointment.status === 'programada' && appointment.date >= today
}

function sortKey(appointment: Appointment) {
  return `${appointment.date} ${appointment.time ?? '99:99'}`
}

export default function AppointmentsList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()
  const { canAdd, refetch: refetchPlan } = usePlan()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('proximas')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)
  const [prefill, setPrefill] = useState<AppointmentPrefill | null>(null)
  const [expandDetails, setExpandDetails] = useState(false)

  const loadAppointments = useCallback(async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })

    return (data as Appointment[]) ?? []
  }, [profileId, supabase])

  const fetchAppointments = useCallback(() => {
    loadAppointments().then(setAppointments)
  }, [loadAppointments])

  useEffect(() => {
    let cancelled = false
    loadAppointments().then((data) => {
      if (cancelled) return
      setAppointments(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadAppointments])

  const today = todayDateString()
  const proximas = appointments
    .filter((a) => isUpcoming(a, today))
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
  const pasadas = appointments
    .filter((a) => !isUpcoming(a, today))
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)))
  const unconfirmedCount = pasadas.filter(isUnconfirmed).length
  const visible = tab === 'proximas' ? proximas : pasadas

  // Un seguimiento se considera agendado si existe otra consulta (no
  // cancelada) posterior a la original con la misma especialidad.
  const hasFollowUp = (appointment: Appointment) =>
    appointments.some(
      (other) =>
        other.id !== appointment.id &&
        other.status !== 'cancelada' &&
        other.date > appointment.date &&
        (other.specialty ?? '').trim().toLowerCase() ===
          (appointment.specialty ?? '').trim().toLowerCase()
    )

  const openNewModal = () => {
    setEditingAppointment(null)
    setPrefill(null)
    setExpandDetails(false)
    setModalOpen(true)
  }

  const openEditModal = (
    appointment: Appointment,
    options?: { expandDetails?: boolean }
  ) => {
    setEditingAppointment(appointment)
    setPrefill(null)
    setExpandDetails(Boolean(options?.expandDetails))
    setModalOpen(true)
  }

  const openFollowUpModal = (appointment: Appointment) => {
    setEditingAppointment(null)
    setPrefill({
      date: appointment.next_appointment_date ?? '',
      specialty: appointment.specialty ?? '',
      doctorName: appointment.doctors?.name ?? '',
      clinicName: appointment.clinic_name ?? '',
    })
    setExpandDetails(false)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
    refetchPlan()
  }

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingAppointment(null)
    setPrefill(null)
    fetchAppointments()
    refetchPlan()
  }

  const tabClass = (value: Tab) =>
    `flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
      tab === value
        ? 'border-blue-700 text-blue-700'
        : 'border-transparent text-gray-500 hover:text-gray-700'
    }`

  const countClass = (value: Tab) =>
    `rounded-full px-2 py-0.5 text-xs font-semibold ${
      tab === value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
    }`

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis consultas</h1>
        <button
          type="button"
          onClick={openNewModal}
          disabled={!canAdd.appointments}
          className={`shrink-0 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors ${
            canAdd.appointments
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          + Nueva consulta
        </button>
      </div>

      {!canAdd.appointments && <FreeLimitBanner feature="appointments" />}

      {!loading && unconfirmedCount > 0 && tab === 'proximas' && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            {unconfirmedCount === 1
              ? 'Tienes 1 consulta que ya pasó y sigue como programada.'
              : `Tienes ${unconfirmedCount} consultas que ya pasaron y siguen como programadas.`}
          </p>
          <button
            type="button"
            onClick={() => setTab('pasadas')}
            className="shrink-0 text-sm font-semibold text-amber-900 hover:underline"
          >
            Confirmar ahora →
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button type="button" onClick={() => setTab('proximas')} className={tabClass('proximas')}>
          Próximas
          {!loading && <span className={countClass('proximas')}>{proximas.length}</span>}
        </button>
        <button type="button" onClick={() => setTab('pasadas')} className={tabClass('pasadas')}>
          Pasadas
          {!loading && <span className={countClass('pasadas')}>{pasadas.length}</span>}
          {!loading && unconfirmedCount > 0 && (
            <span
              className="h-2 w-2 rounded-full bg-amber-500"
              aria-label={`${unconfirmedCount} sin confirmar`}
            />
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando consultas...</p>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes consultas registradas
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Lleva el control de tus citas médicas, diagnósticos y notas en un
            solo lugar.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            disabled={!canAdd.appointments}
            className={`text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors ${
              canAdd.appointments
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Registrar mi primera consulta
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            {tab === 'proximas'
              ? 'No tienes consultas próximas.'
              : 'No tienes consultas pasadas.'}
          </p>
          {tab === 'proximas' && canAdd.appointments && (
            <button
              type="button"
              onClick={openNewModal}
              className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Agendar una consulta →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              followUpScheduled={hasFollowUp(appointment)}
              onEdit={openEditModal}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              onScheduleFollowUp={openFollowUpModal}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          profileId={profileId}
          userId={userId}
          appointment={editingAppointment}
          prefill={prefill}
          expandDetails={expandDetails}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
