'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/hooks/usePlan'
import FreeLimitBanner from '@/components/ui/FreeLimitBanner'
import MedicationCard, { type Medication } from './MedicationCard'
import MedicationModal from './MedicationModal'

export default function MedicationsList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()
  const { canAdd, refetch: refetchPlan } = usePlan()

  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  )

  const fetchMedications = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('medications')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })

    setMedications((data as Medication[]) ?? [])
    setLoading(false)
  }, [profileId, supabase])

  useEffect(() => {
    fetchMedications()
  }, [fetchMedications])

  const activos = medications.filter((m) => m.is_active)
  const historial = medications.filter((m) => !m.is_active)

  const openNewModal = () => {
    setEditingMedication(null)
    setModalOpen(true)
  }

  const openEditModal = (medication: Medication) => {
    setEditingMedication(medication)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id))
    refetchPlan()
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingMedication(null)
    fetchMedications()
    refetchPlan()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Medicamentos</h1>
        <button
          type="button"
          onClick={openNewModal}
          disabled={!canAdd.medications}
          className={`text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors ${
            canAdd.medications
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          + Medicamento
        </button>
      </div>

      {!canAdd.medications && <FreeLimitBanner feature="medications" />}

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando medicamentos...</p>
      ) : medications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes medicamentos registrados
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Lleva el control de tus medicamentos activos y su historial en un
            solo lugar.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            disabled={!canAdd.medications}
            className={`text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors ${
              canAdd.medications
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Registrar mi primer medicamento
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <div className="bg-green-50 rounded-lg px-4 py-2.5 mb-3">
              <h2 className="text-sm font-semibold text-green-800">
                Activos ({activos.length})
              </h2>
            </div>

            {activos.length === 0 ? (
              <p className="text-gray-500 text-sm px-1">
                No tienes medicamentos activos.
              </p>
            ) : (
              <div className="space-y-3">
                {activos.map((medication) => (
                  <MedicationCard
                    key={medication.id}
                    medication={medication}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="bg-gray-100 rounded-lg px-4 py-2.5 mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                Historial ({historial.length})
              </h2>
            </div>

            {historial.length === 0 ? (
              <p className="text-gray-500 text-sm px-1">
                No tienes medicamentos en el historial.
              </p>
            ) : (
              <div className="space-y-3">
                {historial.map((medication) => (
                  <MedicationCard
                    key={medication.id}
                    medication={medication}
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
        <MedicationModal
          profileId={profileId}
          userId={userId}
          medication={editingMedication}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
