'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type IndicatorType =
  | 'presion'
  | 'glucosa'
  | 'peso'
  | 'temperatura'
  | 'frecuencia_cardiaca'
  | 'colesterol'
  | 'otro'

export type HealthIndicator = {
  id: string
  profile_id: string
  user_id: string
  type: IndicatorType
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
  notes: string | null
  created_at: string
}

export const indicatorConfig: Record<
  IndicatorType,
  { label: string; unit: string; border: string }
> = {
  presion: {
    label: 'Presión arterial',
    unit: 'mmHg',
    border: 'border-blue-500',
  },
  glucosa: {
    label: 'Glucosa',
    unit: 'mg/dL',
    border: 'border-orange-500',
  },
  peso: {
    label: 'Peso',
    unit: 'kg',
    border: 'border-green-500',
  },
  temperatura: {
    label: 'Temperatura',
    unit: '°C',
    border: 'border-red-400',
  },
  frecuencia_cardiaca: {
    label: 'Frecuencia cardíaca',
    unit: 'bpm',
    border: 'border-pink-500',
  },
  colesterol: {
    label: 'Colesterol',
    unit: 'mg/dL',
    border: 'border-yellow-500',
  },
  otro: {
    label: 'Otro',
    unit: '',
    border: 'border-gray-400',
  },
}

export const indicatorOrder: IndicatorType[] = [
  'presion',
  'glucosa',
  'peso',
  'temperatura',
  'frecuencia_cardiaca',
  'colesterol',
  'otro',
]

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('es-ES', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} · ${timePart}`
}

function formatValue(entry: HealthIndicator) {
  if (entry.type === 'presion') {
    return `${entry.value_primary}/${entry.value_secondary}${
      entry.unit ? ` ${entry.unit}` : ''
    }`
  }
  return `${entry.value_primary}${entry.unit ? ` ${entry.unit}` : ''}`
}

function HistoryRow({
  entry,
  onDelete,
}: {
  entry: HealthIndicator
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este registro?'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase
      .from('health_indicators')
      .delete()
      .eq('id', entry.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el registro. Intenta de nuevo.')
      return
    }

    onDelete(entry.id)
  }

  return (
    <div className="flex items-center justify-between py-2 border-t border-gray-100 first:border-t-0">
      <div>
        <p className="text-sm text-gray-700">{formatValue(entry)}</p>
        <p className="text-xs text-gray-400">
          {formatDateTime(entry.measured_at)}
        </p>
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          disabled={deleting}
          className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-60"
          aria-label="Más opciones"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
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
            <div className="absolute right-0 top-7 z-20 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
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
  )
}

export default function IndicatorCard({
  type,
  entries,
  onAddMeasurement,
  onDeleteEntry,
}: {
  type: IndicatorType
  entries: HealthIndicator[]
  onAddMeasurement: (type: IndicatorType) => void
  onDeleteEntry: (id: string) => void
}) {
  const [showHistory, setShowHistory] = useState(false)

  const config = indicatorConfig[type]
  const latest = entries[0]
  const history = entries.slice(0, 5)

  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${config.border}`}
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <p className="text-sm font-semibold text-gray-600">{config.label}</p>
        <button
          type="button"
          onClick={() => onAddMeasurement(type)}
          className="text-xs font-medium text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg px-2.5 py-1 transition-colors shrink-0"
        >
          + Agregar medición
        </button>
      </div>

      <p className="text-3xl font-bold text-gray-800">{formatValue(latest)}</p>
      <p className="text-sm text-gray-400 mt-1">
        Último registro: {formatDateTime(latest.measured_at)}
      </p>

      {entries.length > 1 && (
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="text-sm text-blue-600 hover:underline mt-3"
        >
          {showHistory ? 'Ocultar' : 'Ver historial'}
        </button>
      )}

      {showHistory && (
        <div className="mt-2">
          {history.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} onDelete={onDeleteEntry} />
          ))}
        </div>
      )}
    </div>
  )
}
