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

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export default function StudiesList({
  profileId,
  userId,
}: {
  profileId: string
  userId: string
}) {
  const supabase = createClient()
  const { isPremium, canAdd, refetch: refetchPlan } = usePlan()

  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudy, setEditingStudy] = useState<Study | null>(null)

  const loadStudies = useCallback(async () => {
    const { data } = await supabase
      .from('studies')
      .select('*, doctors ( name )')
      .eq('profile_id', profileId)
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    return (data as Study[]) ?? []
  }, [profileId, supabase])

  useEffect(() => {
    let cancelled = false
    loadStudies().then((data) => {
      if (cancelled) return
      setStudies(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [loadStudies])

  const countFor = (value: Filter) =>
    value === 'todos'
      ? studies.length
      : studies.filter((s) => (s.type ?? 'otro') === value).length

  const normalizedQuery = normalize(query.trim())
  const visible = studies.filter((s) => {
    if (filter !== 'todos' && (s.type ?? 'otro') !== filter) return false
    if (!normalizedQuery) return true
    return normalize(
      [s.name, s.notes, s.doctors?.name].filter(Boolean).join(' ')
    ).includes(normalizedQuery)
  })

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
    loadStudies().then(setStudies)
    refetchPlan()
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Estudios y documentos
        </h1>
        <button
          type="button"
          onClick={openNewModal}
          disabled={!canAdd.studies}
          className={`shrink-0 text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-colors ${
            canAdd.studies
              ? 'bg-blue-700 hover:bg-blue-800'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          + Subir estudio
        </button>
      </div>

      {!canAdd.studies && <FreeLimitBanner feature="studies" />}

      {studies.length > 0 && (
        <>
          <div className="mb-4">
            <label htmlFor="studies-search" className="sr-only">
              Buscar estudios
            </label>
            <input
              id="studies-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, médico o notas..."
              className="w-full max-w-xl rounded-xl border border-gray-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {filters
              .filter((f) => f.value === 'todos' || countFor(f.value) > 0)
              .map((f) => (
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
                  {f.label}{' '}
                  <span className={filter === f.value ? 'text-white/80' : 'text-gray-400'}>
                    {countFor(f.value)}
                  </span>
                </button>
              ))}
          </div>
        </>
      )}

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
            {normalizedQuery
              ? `No encontramos estudios para "${query.trim()}".`
              : 'No tienes estudios de este tipo.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {visible.map((study) => (
            <StudyCard
              // Si cambia el archivo, la tarjeta se reinicia (resumen de IA incluido).
              key={`${study.id}-${study.file_url ?? ''}`}
              study={study}
              onEdit={openEditModal}
              onDelete={handleDelete}
              isPremium={isPremium}
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
