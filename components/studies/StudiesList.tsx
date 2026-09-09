'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePlan } from '@/hooks/usePlan'
import FreeLimitBanner from '@/components/ui/FreeLimitBanner'
import StudyCard, { type Study, type StudyType } from './StudyCard'
import StudyModal from './StudyModal'

type Filter = 'todos' | StudyType

const filters: { value: Filter; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'laboratorio', label: 'Laboratorio' },
  { value: 'imagen', label: 'Imagen' },
  { value: 'receta', label: 'Receta' },
  { value: 'otro', label: 'Otro' },
]

export default function StudiesList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()
  const { canAdd, refetch: refetchPlan } = usePlan()

  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudy, setEditingStudy] = useState<Study | null>(null)

  const fetchStudies = useCallback(async () => {
    setLoading(true)

    const { data } = await supabase
      .from('studies')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('date', { ascending: false })

    setStudies((data as Study[]) ?? [])
    setLoading(false)
  }, [profileId, supabase])

  useEffect(() => {
    fetchStudies()
  }, [fetchStudies])

  const visible =
    filter === 'todos' ? studies : studies.filter((s) => s.type === filter)

  const openNewModal = () => {
    setEditingStudy(null)
    setModalOpen(true)
  }

  const openEditModal = (study: Study) => {
    setEditingStudy(study)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setStudies((prev) => prev.filter((s) => s.id !== id))
    refetchPlan()
  }

  const handleSuccess = () => {
    setModalOpen(false)
    setEditingStudy(null)
    fetchStudies()
    refetchPlan()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Estudios y documentos
        </h1>
        <button
          type="button"
          onClick={openNewModal}
          disabled={!canAdd.studies}
          className={`text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors ${
            canAdd.studies
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          + Subir estudio
        </button>
      </div>

      {!canAdd.studies && <FreeLimitBanner feature="studies" />}

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
              filter === f.value
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Cargando estudios...</p>
      ) : studies.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes estudios registrados
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Guarda tus resultados de laboratorio, imágenes y recetas en un
            solo lugar.
          </p>
          <button
            type="button"
            onClick={openNewModal}
            disabled={!canAdd.studies}
            className={`text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors ${
              canAdd.studies
                ? 'bg-blue-700 hover:bg-blue-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Subir mi primer estudio
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            No tienes estudios de este tipo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visible.map((study) => (
            <StudyCard
              key={study.id}
              study={study}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <StudyModal
          profileId={profileId}
          userId={userId}
          study={editingStudy}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
