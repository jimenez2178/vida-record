'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  indicatorConfig,
  indicatorOrder,
  type IndicatorType,
} from './IndicatorCard'

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function IndicatorModal({
  profileId,
  userId,
  presetType,
  onClose,
  onSuccess,
}: {
  profileId: string
  userId: string
  presetType: IndicatorType | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()

  const [type, setType] = useState<IndicatorType>(presetType ?? 'presion')
  const [valuePrimary, setValuePrimary] = useState('')
  const [valueSecondary, setValueSecondary] = useState('')
  const [unit, setUnit] = useState(indicatorConfig[presetType ?? 'presion'].unit)
  const [measuredAt, setMeasuredAt] = useState(() =>
    toDatetimeLocalValue(new Date())
  )
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const handleTypeChange = (newType: IndicatorType) => {
    setType(newType)
    setUnit(indicatorConfig[newType].unit)
    if (newType !== 'presion') {
      setValueSecondary('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!valuePrimary.trim()) {
      setError(
        type === 'presion'
          ? 'La presión sistólica es obligatoria.'
          : 'El valor es obligatorio.'
      )
      return
    }

    if (type === 'presion' && !valueSecondary.trim()) {
      setError('La presión diastólica es obligatoria.')
      return
    }

    setSaving(true)

    const payload = {
      profile_id: profileId,
      user_id: userId,
      type,
      value_primary: Number(valuePrimary),
      value_secondary: type === 'presion' ? Number(valueSecondary) : null,
      unit: unit.trim() || null,
      measured_at: new Date(measuredAt).toISOString(),
      notes: notes.trim() || null,
    }

    const { error: saveError } = await supabase
      .from('health_indicators')
      .insert(payload)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar la medición. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            Registrar medición
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
                htmlFor="type"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Tipo de indicador
              </label>
              <select
                id="type"
                required
                value={type}
                onChange={(e) =>
                  handleTypeChange(e.target.value as IndicatorType)
                }
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
              >
                {indicatorOrder.map((t) => (
                  <option key={t} value={t}>
                    {indicatorConfig[t].label}
                  </option>
                ))}
              </select>
            </div>

            {type === 'presion' ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="valuePrimary"
                    className="block text-base font-semibold text-gray-700 mb-1.5"
                  >
                    Sistólica
                  </label>
                  <input
                    id="valuePrimary"
                    type="number"
                    required
                    value={valuePrimary}
                    onChange={(e) => setValuePrimary(e.target.value)}
                    placeholder="128"
                    className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="valueSecondary"
                    className="block text-base font-semibold text-gray-700 mb-1.5"
                  >
                    Diastólica
                  </label>
                  <input
                    id="valueSecondary"
                    type="number"
                    required
                    value={valueSecondary}
                    onChange={(e) => setValueSecondary(e.target.value)}
                    placeholder="82"
                    className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label
                  htmlFor="valuePrimary"
                  className="block text-base font-semibold text-gray-700 mb-1.5"
                >
                  Valor
                </label>
                <input
                  id="valuePrimary"
                  type="number"
                  required
                  value={valuePrimary}
                  onChange={(e) => setValuePrimary(e.target.value)}
                  className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none px-4 py-3 text-lg text-gray-900"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="unit"
                className="block text-base font-semibold text-gray-700 mb-1.5"
              >
                Unidad
              </label>
              <input
                id="unit"
                type="text"
                value={unit}
                readOnly
                className="w-full min-h-[52px] rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-lg text-gray-600"
              />
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
                    htmlFor="measuredAt"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Fecha y hora
                  </label>
                  <input
                    id="measuredAt"
                    type="datetime-local"
                    required
                    value={measuredAt}
                    onChange={(e) => setMeasuredAt(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
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
              {saving ? 'Guardando...' : 'Guardar medición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
