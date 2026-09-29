'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DiagnosisCard, { type Diagnosis } from './DiagnosisCard'
import DiagnosisModal from './DiagnosisModal'

export default function DiagnosesList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()

  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(
    null
  )
  const [showResolved, setShowResolved] = useState(false)

  const loadDiagnoses = useCallback(async () => {
    const { data } = await supabase
      .from('diagnoses')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('diagnosed_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    return (data as Diagnosis[]) ?? []
  }, [profileId, supabase])

  useEffect(() => {
    let cancelled = false
    loadDiagnoses().then((data) => {
      if (cancelled) return
      setDiagnoses(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadDiagnoses])

  // Crónicos primero: son los que más importan en una consulta nueva.
  const activos = diagnoses
    .filter((d) => d.is_active)
    .sort((a, b) => Number(b.is_chronic) - Number(a.is_chronic))
  const resueltos = diagnoses.filter((d) => !d.is_active)
  const chronicCount = activos.filter((d) => d.is_chronic).length
  const missingDescription = activos.filter((d) => !d.description?.trim()).length

  const openNewModal = () => {
    setEditingDiagnosis(null)
    setModalOpen(true)
  }

  const openEditModal = (diagnosis: Diagnosis) => {
    setEditingDiagnosis(diagnosis)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.id !== id))
  }

  const handleToggleActive = (id: string, isActive: boolean) => {
    setDiagnoses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, is_active: isActive } : d))
    )
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingDiagnosis(null)
    loadDiagnoses().then(setDiagnoses)
  }

  const renderCards = (list: Diagnosis[]) => (
    <div className="space-y-3">
      {list.map((diagnosis) => (
        <DiagnosisCard
          key={diagnosis.id}
          diagnosis={diagnosis}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onToggleActive={handleToggleActive}
        />
      ))}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Diagnósticos</h1>
        <button
          type="button"
          onClick={openNewModal}
          className="shrink-0 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          + Diagnóstico
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando diagnósticos...</p>
      ) : diagnoses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes diagnósticos registrados
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Lleva el control de tus condiciones activas y su historial en un
            solo lugar.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Registrar mi primer diagnóstico
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
              <h2 className="text-base font-semibold text-gray-800">
                Activos ({activos.length})
              </h2>
              {activos.length > 0 && (
                <p className="text-sm text-gray-500">
                  {chronicCount} {chronicCount === 1 ? 'crónico' : 'crónicos'} ·{' '}
                  {activos.length - chronicCount}{' '}
                  {activos.length - chronicCount === 1 ? 'agudo' : 'agudos'}
                </p>
              )}
            </div>

            {missingDescription > 0 && (
              <p className="mb-3 text-sm text-amber-800">
                {missingDescription === 1
                  ? '1 diagnóstico activo no tiene descripción.'
                  : `${missingDescription} diagnósticos activos no tienen descripción.`}{' '}
                Complétalos para que tu Resumen PDF sea claro para el médico.
              </p>
            )}

            {activos.length === 0 ? (
              <p className="text-gray-500 text-sm px-1">
                No tienes diagnósticos activos.
              </p>
            ) : (
              renderCards(activos)
            )}
          </section>

          {resueltos.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setShowResolved((v) => !v)}
                aria-expanded={showResolved}
                className="flex w-full items-center justify-between rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2.5 mb-3 text-sm font-semibold text-gray-700 transition-colors"
              >
                Resueltos ({resueltos.length})
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className={`w-4 h-4 transition-transform ${showResolved ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {showResolved && renderCards(resueltos)}
            </section>
          )}
        </div>
      )}

      {modalOpen && (
        <DiagnosisModal
          profileId={profileId}
          userId={userId}
          diagnosis={editingDiagnosis}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
