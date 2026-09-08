'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type StudyType = 'laboratorio' | 'imagen' | 'receta' | 'otro'
export type StudyFileType = 'pdf' | 'image'

export type Study = {
  id: string
  profile_id: string
  user_id: string
  appointment_id: string | null
  doctor_id: string | null
  name: string
  type: StudyType | null
  date: string | null
  file_url: string | null
  file_type: StudyFileType | null
  ai_summary: string | null
  ai_processed: boolean
  notes: string | null
  created_at: string
  doctors: { name: string } | null
}

const typeConfig: Record<
  StudyType,
  { label: string; badge: string; iconWrap: string; icon: React.ReactNode }
> = {
  laboratorio: {
    label: 'Laboratorio',
    badge: 'bg-blue-100 text-blue-700',
    iconWrap: 'bg-blue-50 text-blue-600',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.106 14.4c-1.6 1.6-.464 4.35 1.804 4.35h10.18c2.268 0 3.404-2.75 1.804-4.35l-3.985-3.99a2.25 2.25 0 01-.659-1.591V3.104M8.25 3.104h7.5"
      />
    ),
  },
  imagen: {
    label: 'Imagen',
    badge: 'bg-green-100 text-green-700',
    iconWrap: 'bg-green-50 text-green-600',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 12V4.5A1.5 1.5 0 014.5 3h15A1.5 1.5 0 0121 4.5v15a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19.5V12z"
      />
    ),
  },
  receta: {
    label: 'Receta',
    badge: 'bg-orange-100 text-orange-700',
    iconWrap: 'bg-orange-50 text-orange-600',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 0H6.108c-1.135 0-2.098.847-2.245 1.98A48.424 48.424 0 003.75 12c0 1.153.082 2.287.24 3.395.147 1.133 1.11 1.98 2.245 1.98h.096m10.5-13.395c.53.034 1.058.078 1.583.132.75.075 1.35.68 1.37 1.435.024.926.03 1.849.024 2.766M9 12h6m-6 3h6m-6-6h1.5"
      />
    ),
  },
  otro: {
    label: 'Otro',
    badge: 'bg-gray-100 text-gray-600',
    iconWrap: 'bg-gray-100 text-gray-500',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0v6a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-6m-19.5 0h19.5M8.25 9.75V6.108c0-.483.386-.875.868-.875H14.88c.483 0 .868.392.868.875V9.75"
      />
    ),
  },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function StudyCard({
  study,
  onEdit,
  onDelete,
}: {
  study: Study
  onEdit: (study: Study) => void
  onDelete: (id: string) => void
}) {
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [opening, setOpening] = useState(false)

  const config = typeConfig[study.type ?? 'otro']
  const date = formatDate(study.date)

  const handleViewFile = async () => {
    if (!study.file_url) return

    setOpening(true)
    const { data, error } = await supabase.storage
      .from('medical-documents')
      .createSignedUrl(study.file_url, 60)
    setOpening(false)

    if (error || !data) {
      window.alert('No se pudo abrir el documento. Intenta de nuevo.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDelete = async () => {
    setMenuOpen(false)

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar este estudio? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    setDeleting(true)

    if (study.file_url) {
      await supabase.storage.from('medical-documents').remove([study.file_url])
    }

    const { error } = await supabase.from('studies').delete().eq('id', study.id)
    setDeleting(false)

    if (error) {
      window.alert('No se pudo eliminar el estudio. Intenta de nuevo.')
      return
    }

    onDelete(study.id)
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${config.iconWrap}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5"
            >
              {config.icon}
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-base font-bold text-gray-800 truncate">
              {study.name}
            </p>
            <span
              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${config.badge}`}
            >
              {config.label}
            </span>
            {date && <p className="text-sm text-gray-500 mt-1">{date}</p>}
            {study.doctors?.name && (
              <p className="text-sm text-gray-500">
                Ordenado por {study.doctors.name}
              </p>
            )}
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Más opciones"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
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
              <div className="absolute right-0 top-9 z-20 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(study)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Editar
                </button>
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

      <div className="flex items-center flex-wrap gap-2 mt-4">
        {study.file_url && (
          <button
            type="button"
            onClick={handleViewFile}
            disabled={opening}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 disabled:opacity-60 rounded-lg px-3 py-1.5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`w-4 h-4 ${
                study.file_type === 'pdf' ? 'text-red-500' : 'text-blue-500'
              }`}
            >
              <path
                fillRule="evenodd"
                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z"
                clipRule="evenodd"
              />
              <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
            </svg>
            {opening ? 'Abriendo...' : 'Ver documento'}
          </button>
        )}

        {study.ai_processed && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 rounded-full px-2.5 py-1">
            Analizado por IA
          </span>
        )}
      </div>
    </div>
  )
}
