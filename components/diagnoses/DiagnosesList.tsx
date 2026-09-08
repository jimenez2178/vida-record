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

  const fetchDiagnoses = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('diagnoses')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('diagnosed_at', { ascending: false })

    setDiagnoses((data as Diagnosis[]) ?? [])
    setLoading(false)
  }, [profileId, supabase])

  useEffect(() => {
    fetchDiagnoses()
  }, [fetchDiagnoses])

  const activos = diagnoses.filter((d) => d.is_active)
  const historial = diagnoses.filter((d) => !d.is_active)

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

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingDiagnosis(null)
    fetchDiagnoses()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Diagnósticos</h1>
        <button
          type="button"
          onClick={openNewModal}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
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
            <div className="bg-red-50 rounded-lg px-4 py-2.5 mb-3">
              <h2 className="text-sm font-semibold text-red-700">
                Activos ({activos.length})
              </h2>
            </div>

            {activos.length === 0 ? (
              <p className="text-gray-500 text-sm px-1">
                No tienes diagnósticos activos.
              </p>
            ) : (
              <div className="space-y-3">
                {activos.map((diagnosis) => (
                  <DiagnosisCard
                    key={diagnosis.id}
                    diagnosis={diagnosis}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="bg-gray-50 rounded-lg px-4 py-2.5 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Historial ({historial.length})
              </h2>
            </div>

            {historial.length === 0 ? (
              <p className="text-gray-500 text-sm px-1">
                No tienes diagnósticos en el historial.
              </p>
            ) : (
              <div className="space-y-3">
                {historial.map((diagnosis) => (
                  <DiagnosisCard
                    key={diagnosis.id}
                    diagnosis={diagnosis}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
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
