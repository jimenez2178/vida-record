'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Medication = {
  id: string
  profile_id: string
  user_id: string
  appointment_id: string | null
  doctor_id: string | null
  name: string
  dose: string | null
  frequency: string | null
  start_date: string | null
  end_date: string | null
  quantity_initial: number | null
  quantity_remaining: number | null
  is_active: boolean
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

export default function MedicationCard({
  medication,
  onEdit,
  onDelete,
}: {
  medication: Medication
  onEdit: (medication: Medication) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const startDate = formatDate(medication.start_date)
  const endDate = formatDate(medication.end_date)

  const hasProgress =
    typeof medication.quantity_initial === 'number' &&
    medication.quantity_initial > 0 &&
    typeof medication.quantity_remaining === 'number'

  const percentage = hasProgress
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((medication.quantity_remaining as number) /
              (medication.quantity_initial as number)) *
              100
          )
        )
      )
    : 0

  const barColor =
    percentage > 50
      ? 'bg-green-500'
      : percentage >= 20
        ? 'bg-yellow-500'
        : 'bg-red-500'

  const showLowStockAlert =
    medication.is_active &&
    typeof medication.quantity_remaining === 'number' &&
    medication.quantity_remaining <= 5

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este medicamento? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', medication.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el medicamento. Intenta de nuevo.')
      return
    }

    onDelete(medication.id)
  }

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm p-5 border-l-4 ${
        medication.is_active ? 'border-green-500' : 'border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-gray-800">{medication.name}</p>

          {(medication.dose || medication.frequency) && (
            <p className="text-sm text-gray-600 mt-0.5">
              {[medication.dose, medication.frequency]
                .filter(Boolean)
                .join(' · ')}
            </p>
          )}

          {medication.doctors?.name && (
            <p className="text-sm text-gray-500 mt-0.5">
              Indicado por {medication.doctors.name}
            </p>
          )}

          {(startDate || endDate) && (
            <p className="text-sm text-gray-500 mt-1">
              {startDate ? `Desde ${startDate}` : ''}
              {startDate && endDate ? ' · ' : ''}
              {endDate ? `Hasta ${endDate}` : ''}
            </p>
          )}

          {hasProgress && (
            <div className="mt-3 max-w-xs">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Cantidad restante</span>
                <span>
                  {medication.quantity_remaining} / {medication.quantity_initial}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {showLowStockAlert && (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-2.5 py-1.5 mt-3 font-medium inline-block">
              ⚠️ Quedan pocas dosis
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
              medication.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {medication.is_active ? 'Activo' : 'Finalizado'}
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
                      onEdit(medication)
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
