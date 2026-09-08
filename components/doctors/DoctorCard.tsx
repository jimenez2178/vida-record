'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Doctor = {
  id: string
  user_id: string
  name: string
  specialty: string | null
  phone: string | null
  email: string | null
  clinic_name: string | null
  address: string | null
  notes: string | null
  created_at: string
}

export default function DoctorCard({
  doctor,
  onEdit,
  onDelete,
}: {
  doctor: Doctor
  onEdit: (doctor: Doctor) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const initial = doctor.name.trim().charAt(0).toUpperCase() || '?'

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      'Este médico está vinculado a tus consultas y medicamentos. ¿Seguro que quieres eliminarlo?'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase.from('doctors').delete().eq('id', doctor.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el médico. Intenta de nuevo.')
      return
    }

    onDelete(doctor.id)
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg shrink-0">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 truncate">
              {doctor.name}
            </p>
            {doctor.specialty && (
              <p className="text-sm text-blue-600 mt-0.5">
                {doctor.specialty}
              </p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
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
                    onEdit(doctor)
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

      <div className="mt-3 space-y-1.5">
        {doctor.phone && (
          <a
            href={`tel:${doctor.phone}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 shrink-0 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
              />
            </svg>
            {doctor.phone}
          </a>
        )}

        {doctor.email && (
          <a
            href={`mailto:${doctor.email}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-700 truncate"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 shrink-0 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75c0-.828.672-1.5 1.5-1.5h16.5c.828 0 1.5.672 1.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6.75z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.75l9.75 6.75 9.75-6.75"
              />
            </svg>
            <span className="truncate">{doctor.email}</span>
          </a>
        )}

        {doctor.clinic_name && (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 shrink-0 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 21V4.5A1.5 1.5 0 016 3h3.75a1.5 1.5 0 011.5 1.5V21m3.75 0V9.75a1.5 1.5 0 011.5-1.5h3.75a1.5 1.5 0 011.5 1.5V21M9 6.75h.008v.008H9V6.75zm0 3h.008v.008H9v-3zm0 3h.008v.008H9v-3zm3.75 3h.008v.008h-.008V15.75zm0 3h.008v.008h-.008V18.75z"
              />
            </svg>
            {doctor.clinic_name}
          </p>
        )}

        {doctor.address && (
          <p className="flex items-center gap-2 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-4 h-4 shrink-0 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {doctor.address}
          </p>
        )}

        {doctor.notes && (
          <p className="text-sm text-gray-400 mt-2 line-clamp-2">
            {doctor.notes}
          </p>
        )}
      </div>
    </div>
  )
}
