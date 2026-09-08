'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import IndicatorCard, {
  type HealthIndicator,
  type IndicatorType,
  indicatorOrder,
} from './IndicatorCard'
import IndicatorModal from './IndicatorModal'

export default function IndicatorsList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()

  const [indicators, setIndicators] = useState<HealthIndicator[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [presetType, setPresetType] = useState<IndicatorType | null>(null)

  const fetchIndicators = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('health_indicators')
      .select('*')
      .eq('profile_id', profileId)
      .order('measured_at', { ascending: false })

    setIndicators((data as HealthIndicator[]) ?? [])
    setLoading(false)
  }, [profileId, supabase])

  useEffect(() => {
    fetchIndicators()
  }, [fetchIndicators])

  const groups = indicatorOrder
    .map((type) => ({
      type,
      entries: indicators.filter((i) => i.type === type),
    }))
    .filter((group) => group.entries.length > 0)

  const openModal = (type?: IndicatorType) => {
    setPresetType(type ?? null)
    setModalOpen(true)
  }

  const handleDeleteEntry = (id: string) => {
    setIndicators((prev) => prev.filter((i) => i.id !== id))
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setPresetType(null)
    fetchIndicators()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Indicadores de salud
        </h1>
        <button
          type="button"
          onClick={() => openModal()}
          className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors"
        >
          + Registrar medición
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando indicadores...</p>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes indicadores registrados
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Lleva el control de tu presión, glucosa, peso y más en un solo
            lugar.
          </p>
          <button
            type="button"
            onClick={() => openModal()}
            className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
          >
            Registrar mi primera medición
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <IndicatorCard
              key={group.type}
              type={group.type}
              entries={group.entries}
              onAddMeasurement={openModal}
              onDeleteEntry={handleDeleteEntry}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <IndicatorModal
          profileId={profileId}
          userId={userId}
          presetType={presetType}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
