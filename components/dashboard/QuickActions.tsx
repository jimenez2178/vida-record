'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppointmentModal from '@/components/appointments/AppointmentModal'
import MedicationModal from '@/components/medications/MedicationModal'
import StudyModal from '@/components/studies/StudyModal'
import IndicatorModal from '@/components/health-indicators/IndicatorModal'

type ModalType = 'cita' | 'medicamento' | 'estudio' | 'medicion' | null

export default function QuickActions({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const router = useRouter()
  const [openModal, setOpenModal] = useState<ModalType>(null)

  const handleSuccess = () => {
    setOpenModal(null)
    router.refresh()
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setOpenModal('cita')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
        >
          + Nueva consulta
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('medicamento')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
        >
          + Medicamento
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('estudio')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
        >
          + Estudio
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('medicion')}
          className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl shadow-sm py-3 px-4 text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 transition-colors"
        >
          + Medición
        </button>
      </div>

      {openModal === 'cita' && (
        <AppointmentModal
          profileId={profileId}
          userId={userId}
          appointment={null}
          onClose={() => setOpenModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {openModal === 'medicamento' && (
        <MedicationModal
          profileId={profileId}
          userId={userId}
          medication={null}
          onClose={() => setOpenModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {openModal === 'estudio' && (
        <StudyModal
          profileId={profileId}
          userId={userId}
          study={null}
          onClose={() => setOpenModal(null)}
          onSuccess={handleSuccess}
        />
      )}

      {openModal === 'medicion' && (
        <IndicatorModal
          profileId={profileId}
          userId={userId}
          presetType={null}
          onClose={() => setOpenModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
