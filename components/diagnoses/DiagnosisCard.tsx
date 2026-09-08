'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Diagnosis = {
  id: string
  profile_id: string
  user_id: string
  appointment_id: string | null
  doctor_id: string | null
  name: string
  description: string | null
  diagnosed_at: string | null
  is_active: boolean
  is_chronic: boolean
  notes: string | null
  created_at: string
  doctors: { name: string } | null
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DiagnosisCard({
  diagnosis,
  onEdit,
  onDelete,
}: {
  diagnosis: Diagnosis
  onEdit: (diagnosis: Diagnosis) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const date = formatDate(diagnosis.diagnosed_at)

  const borderColor = !diagnosis.is_active
    ? 'border-gray-300'
    : diagnosis.is_chronic
      ? 'border-red-500'
      : 'border-orange-400'

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este diagnóstico? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase
      .from('diagnoses')
      .delete()
      .eq('id', diagnosis.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el diagnóstico. Intenta de nuevo.')
      return
    }

    onDelete(diagnosis.id)
  }

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm p-5 border-l-4 ${borderColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-2">
            <p className="text-lg font-bold text-gray-800">{diagnosis.name}</p>
            {diagnosis.is_chronic && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                Crónico
              </span>
            )}
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                diagnosis.is_active
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {diagnosis.is_active ? 'Activo' : 'Resuelto'}
            </span>
          </div>

          {diagnosis.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {diagnosis.description}
            </p>
          )}

          {diagnosis.doctors?.name && (
            <p className="text-sm text-gray-500 mt-1">
              Diagnosticado por {diagnosis.doctors.name}
            </p>
          )}

          {date && <p className="text-sm text-gray-500 mt-1">{date}</p>}

          {diagnosis.notes && (
            <p className="text-xs text-gray-400 mt-2">{diagnosis.notes}</p>
          )}
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
                    onEdit(diagnosis)
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
  )
}
