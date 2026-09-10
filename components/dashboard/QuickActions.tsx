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
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl shadow-md hover:shadow-lg py-3.5 px-4 text-sm font-semibold transition-all"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs leading-none shrink-0">
            +
          </span>
          Nueva consulta
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('medicamento')}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl shadow-md hover:shadow-lg py-3.5 px-4 text-sm font-semibold transition-all"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs leading-none shrink-0">
            +
          </span>
          Medicamento
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('estudio')}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl shadow-md hover:shadow-lg py-3.5 px-4 text-sm font-semibold transition-all"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs leading-none shrink-0">
            +
          </span>
          Estudio
        </button>
        <button
          type="button"
          onClick={() => setOpenModal('medicion')}
          className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white rounded-xl shadow-md hover:shadow-lg py-3.5 px-4 text-sm font-semibold transition-all"
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs leading-none shrink-0">
            +
          </span>
          Medición
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
