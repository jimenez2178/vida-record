'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Study, StudyType } from './StudyCard'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png']

export default function StudyModal({
  profileId,
  userId,
  study,
  onClose,
  onSuccess,
}: {
  profileId: string
  userId: string
  study: Study | null
  onClose: () => void
  onSuccess: () => void
}) {
  const supabase = createClient()
  const isEditing = Boolean(study)

  const [name, setName] = useState(study?.name ?? '')
  const [type, setType] = useState<StudyType>(study?.type ?? 'laboratorio')
  const [date, setDate] = useState(study?.date ?? '')
  const [doctorName, setDoctorName] = useState(study?.doctors?.name ?? '')
  const [notes, setNotes] = useState(study?.notes ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [viewingCurrentFile, setViewingCurrentFile] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const extension = selected.name.split('.').pop()?.toLowerCase() ?? ''

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Solo se aceptan archivos PDF, JPG o PNG.')
      e.target.value = ''
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError('El archivo no puede superar 10MB.')
      e.target.value = ''
      return
    }

    setError('')
    setFile(selected)
  }

  const handleViewCurrentFile = async () => {
    if (!study?.file_url) return

    setViewingCurrentFile(true)
    const { data, error: signError } = await supabase.storage
      .from('medical-documents')
      .createSignedUrl(study.file_url, 60)
    setViewingCurrentFile(false)

    if (signError || !data) {
      setError('No se pudo abrir el archivo actual.')
      return
    }

    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('El nombre del estudio es obligatorio.')
      return
    }

    setSaving(true)

    let doctorId: string | null = study?.doctor_id ?? null
    const trimmedDoctorName = doctorName.trim()

    if (trimmedDoctorName) {
      const { data: existingDoctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('user_id', userId)
        .ilike('name', trimmedDoctorName)
        .maybeSingle()

      if (existingDoctor) {
        doctorId = existingDoctor.id
      } else {
        const { data: newDoctor, error: doctorError } = await supabase
          .from('doctors')
          .insert({ user_id: userId, name: trimmedDoctorName })
          .select('id')
          .single()

        if (doctorError || !newDoctor) {
          setSaving(false)
          setError('No se pudo guardar el médico. Intenta de nuevo.')
          return
        }
        doctorId = newDoctor.id
      }
    } else {
      doctorId = null
    }

    let filePath = study?.file_url ?? null
    let fileType = study?.file_type ?? null

    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? 'dat'
      const newPath = `${userId}/${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(newPath, file, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setSaving(false)
        setError('No se pudo subir el archivo. Intenta de nuevo.')
        return
      }

      if (study?.file_url) {
        await supabase.storage.from('medical-documents').remove([study.file_url])
      }

      filePath = newPath
      fileType = extension === 'pdf' ? 'pdf' : 'image'
    }

    const payload = {
      profile_id: profileId,
      user_id: userId,
      doctor_id: doctorId,
      name: name.trim(),
      type,
      date: date || null,
      file_url: filePath,
      file_type: fileType,
      notes: notes.trim() || null,
    }

    const { error: saveError } = study
      ? await supabase.from('studies').update(payload).eq('id', study.id)
      : await supabase.from('studies').insert(payload)

    setSaving(false)

    if (saveError) {
      setError('No se pudo guardar el estudio. Intenta de nuevo.')
      return
    }

    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-[600px] max-h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? 'Editar estudio' : 'Subir estudio'}
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
          <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre del estudio
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Hemograma, Perfil lipídico, Radiografía de tórax"
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value as StudyType)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                >
                  <option value="laboratorio">Laboratorio</option>
                  <option value="imagen">Imagen</option>
                  <option value="receta">Receta</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha del estudio
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="doctorName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Médico que lo ordenó
              </label>
              <input
                id="doctorName"
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Nombre del médico"
                className="w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400"
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

            <div>
              <label
                htmlFor="file"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Archivo
              </label>

              {study?.file_url && !file && (
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-2">
                  <button
                    type="button"
                    onClick={handleViewCurrentFile}
                    disabled={viewingCurrentFile}
                    className="text-sm text-blue-600 hover:underline disabled:opacity-60"
                  >
                    {viewingCurrentFile ? 'Abriendo...' : 'Ver archivo actual'}
                  </button>
                  <span className="text-xs text-gray-400">
                    Selecciona un archivo nuevo para reemplazarlo
                  </span>
                </div>
              )}

              <input
                id="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-sm file:font-medium hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                PDF, JPG o PNG. Máximo 10MB.
              </p>
              {file && (
                <p className="text-sm text-gray-600 mt-1">
                  Archivo seleccionado: {file.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg px-5 py-2.5 transition-colors"
            >
              {saving
                ? file
                  ? 'Subiendo y guardando...'
                  : 'Guardando...'
                : 'Guardar estudio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
