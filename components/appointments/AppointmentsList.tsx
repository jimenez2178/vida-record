'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppointmentCard, { type Appointment } from './AppointmentCard'
import AppointmentModal from './AppointmentModal'

type Tab = 'proximas' | 'pasadas'

function isUpcoming(appointment: Appointment) {
  if (appointment.status === 'programada') return true

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return new Date(`${appointment.date}T00:00:00`) >= today
}

function isPast(appointment: Appointment) {
  return (
    appointment.status === 'completada' || appointment.status === 'cancelada'
  )
}

export default function AppointmentsList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('proximas')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('appointments')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })

    setAppointments((data as Appointment[]) ?? [])
    setLoading(false)
  }, [profileId, supabase])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const proximas = appointments.filter(isUpcoming)
  const pasadas = appointments.filter(isPast)
  const visible = tab === 'proximas' ? proximas : pasadas

  const openNewModal = () => {
    setEditingAppointment(null)
    setModalOpen(true)
  }

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingAppointment(null)
    fetchAppointments()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mis consultas</h1>
        <button
          type="button"
          onClick={openNewModal}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          + Nueva consulta
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('proximas')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'proximas'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Próximas
        </button>
        <button
          type="button"
          onClick={() => setTab('pasadas')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'pasadas'
              ? 'border-blue-700 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pasadas
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
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
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
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AppointmentModal
          profileId={profileId}
          userId={userId}
          appointment={editingAppointment}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
