'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DoctorCard, { type Doctor } from './DoctorCard'
import DoctorModal from './DoctorModal'

export default function DoctorsList({ userId }: { userId: string }) {
  const supabase = createClient()

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  const fetchDoctors = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    setDoctors((data as Doctor[]) ?? [])
    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchDoctors()
  }, [fetchDoctors])

  const query = search.trim().toLowerCase()
  const visible = query
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.specialty?.toLowerCase().includes(query)
      )
    : doctors

  const openNewModal = () => {
    setEditingDoctor(null)
    setModalOpen(true)
  }

  const openEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id))
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingDoctor(null)
    fetchDoctors()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Médicos</h1>
        <button
          type="button"
          onClick={openNewModal}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          + Médico
        </button>
      </div>

      {doctors.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o especialidad"
            className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando médicos...</p>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes médicos registrados
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Guarda los datos de contacto de tus médicos para tenerlos siempre
            a la mano.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Registrar mi primer médico
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            No se encontraron médicos para &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <DoctorModal
          userId={userId}
          doctor={editingDoctor}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
