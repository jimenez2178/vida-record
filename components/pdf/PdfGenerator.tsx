'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Profile = {
  id: string
  full_name: string
  date_of_birth: string | null
  blood_type: string | null
  allergies: string | null
  medical_notes: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
}

type AppointmentRow = {
  id: string
  date: string
  specialty: string | null
  diagnosis: string | null
  doctors: { name: string } | null
}

type MedicationRow = {
  id: string
  name: string
  dose: string | null
  frequency: string | null
  start_date: string | null
}

type DiagnosisRow = {
  id: string
  name: string
  is_chronic: boolean
  diagnosed_at: string | null
}

type StudyRow = {
  id: string
  name: string
  type: string | null
  date: string | null
}

type IndicatorRow = {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
}

type SectionKey =
  | 'personal'
  | 'medications'
  | 'appointments'
  | 'diagnoses'
  | 'studies'
  | 'indicators'

const sectionLabels: Record<SectionKey, string> = {
  personal: 'Datos personales',
  medications: 'Medicamentos activos',
  appointments: 'Últimas consultas',
  diagnoses: 'Diagnósticos activos',
  studies: 'Estudios recientes',
  indicators: 'Indicadores de salud',
}

const indicatorTypeLabels: Record<string, string> = {
  presion: 'Presión arterial',
  glucosa: 'Glucosa',
  peso: 'Peso',
  temperatura: 'Temperatura',
  frecuencia_cardiaca: 'Frecuencia cardíaca',
  colesterol: 'Colesterol',
  otro: 'Otro',
}

const studyTypeLabels: Record<string, string> = {
  laboratorio: 'Laboratorio',
  imagen: 'Imagen',
  receta: 'Receta',
  otro: 'Otro',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  const date = dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatIndicatorValue(indicator: IndicatorRow) {
  if (indicator.type === 'presion') {
    return `${indicator.value_primary}/${indicator.value_secondary}${
      indicator.unit ? ` ${indicator.unit}` : ''
    }`
  }
  return `${indicator.value_primary}${indicator.unit ? ` ${indicator.unit}` : ''}`
}

function getLastAutoTableFinalY(doc: jsPDF, fallback: number) {
  const docWithTable = doc as unknown as { lastAutoTable?: { finalY: number } }
  return docWithTable.lastAutoTable?.finalY ?? fallback
}

export default function PdfGenerator({
  profile,
  appointments,
  medications,
  diagnoses,
  studies,
  indicators,
}: {
  profile: Profile
  appointments: AppointmentRow[]
  medications: MedicationRow[]
  diagnoses: DiagnosisRow[]
  studies: StudyRow[]
  indicators: IndicatorRow[]
}) {
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    medications: true,
    appointments: true,
    diagnoses: true,
    studies: true,
    indicators: true,
  })
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleSection = (key: SectionKey) => {
    setSuccess(false)
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const todayLabel = (() => {
    const label = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return label
  })()

  const handleGeneratePdf = () => {
    setGenerating(true)
    setSuccess(false)

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginX = 15
    let y = 20

    const ensureSpace = (needed: number) => {
      const pageHeight = doc.internal.pageSize.getHeight()
      if (y + needed > pageHeight - 22) {
        doc.addPage()
        y = 20
      }
    }

    const addSectionTitle = (title: string) => {
      ensureSpace(20)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(29, 78, 216)
      doc.text(title, marginX, y)
      doc.setFont('helvetica', 'normal')
      y += 7
    }

    // Header
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(29, 78, 216)
    doc.text('VidaRecord', marginX, y)

    y += 7
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)
    doc.text('Resumen Médico Personal', marginX, y)

    y += 4
    doc.setDrawColor(29, 78, 216)
    doc.setLineWidth(0.8)
    doc.line(marginX, y, pageWidth - marginX, y)

    y += 6
    doc.setFontSize(9)
    doc.setTextColor(130, 130, 130)
    doc.text(`Generado el ${todayLabel}`, marginX, y)

    y += 10

    if (sections.personal) {
      addSectionTitle('Datos personales')

      const lines = [
        `Nombre: ${profile.full_name}`,
        `Fecha de nacimiento: ${formatDate(profile.date_of_birth) || 'No especificada'}`,
        `Tipo de sangre: ${profile.blood_type || 'No especificado'}`,
        `Alergias: ${profile.allergies || 'Ninguna registrada'}`,
        `Notas médicas importantes: ${profile.medical_notes || 'Ninguna'}`,
        `Contacto de emergencia: ${
          profile.emergency_contact_name
            ? `${profile.emergency_contact_name}${
                profile.emergency_contact_phone
                  ? ` - ${profile.emergency_contact_phone}`
                  : ''
              }`
            : 'No especificado'
        }`,
      ]

      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      lines.forEach((line) => {
        ensureSpace(7)
        doc.text(line, marginX, y)
        y += 6
      })
      y += 6
    }

    if (sections.medications) {
      addSectionTitle('Medicamentos activos')

      if (medications.length === 0) {
        doc.setFontSize(10)
        doc.setTextColor(130, 130, 130)
        doc.text('Sin medicamentos activos.', marginX, y)
        y += 10
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [['Medicamento', 'Dosis', 'Frecuencia', 'Desde']],
          body: medications.map((m) => [
            m.name,
            m.dose || '—',
            m.frequency || '—',
            formatDate(m.start_date) || '—',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [29, 78, 216] },
          styles: { fontSize: 9 },
        })
        y = getLastAutoTableFinalY(doc, y) + 10
      }
    }

    if (sections.appointments) {
      addSectionTitle('Últimas consultas')

      if (appointments.length === 0) {
        doc.setFontSize(10)
        doc.setTextColor(130, 130, 130)
        doc.text('Sin consultas registradas.', marginX, y)
        y += 10
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [['Fecha', 'Especialidad', 'Médico', 'Diagnóstico']],
          body: appointments.map((a) => [
            formatDate(a.date) || '—',
            a.specialty || '—',
            a.doctors?.name || '—',
            a.diagnosis || '—',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [29, 78, 216] },
          styles: { fontSize: 9 },
        })
        y = getLastAutoTableFinalY(doc, y) + 10
      }
    }

    if (sections.diagnoses) {
      addSectionTitle('Diagnósticos activos')

      if (diagnoses.length === 0) {
        doc.setFontSize(10)
        doc.setTextColor(130, 130, 130)
        doc.text('Sin diagnósticos activos.', marginX, y)
        y += 10
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [['Diagnóstico', 'Tipo', 'Fecha']],
          body: diagnoses.map((d) => [
            d.name,
            d.is_chronic ? 'Crónico' : 'Agudo',
            formatDate(d.diagnosed_at) || '—',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [29, 78, 216] },
          styles: { fontSize: 9 },
        })
        y = getLastAutoTableFinalY(doc, y) + 10
      }
    }

    if (sections.studies) {
      addSectionTitle('Estudios recientes')

      if (studies.length === 0) {
        doc.setFontSize(10)
        doc.setTextColor(130, 130, 130)
        doc.text('Sin estudios registrados.', marginX, y)
        y += 10
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [['Estudio', 'Tipo', 'Fecha']],
          body: studies.map((s) => [
            s.name,
            (s.type && studyTypeLabels[s.type]) || s.type || '—',
            formatDate(s.date) || '—',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [29, 78, 216] },
          styles: { fontSize: 9 },
        })
        y = getLastAutoTableFinalY(doc, y) + 10
      }
    }

    if (sections.indicators) {
      addSectionTitle('Indicadores de salud')

      if (indicators.length === 0) {
        doc.setFontSize(10)
        doc.setTextColor(130, 130, 130)
        doc.text('Sin indicadores registrados.', marginX, y)
        y += 10
      } else {
        autoTable(doc, {
          startY: y,
          margin: { left: marginX, right: marginX },
          head: [['Indicador', 'Último valor', 'Fecha']],
          body: indicators.map((i) => [
            indicatorTypeLabels[i.type] ?? i.type,
            formatIndicatorValue(i),
            formatDate(i.measured_at) || '—',
          ]),
          theme: 'striped',
          headStyles: { fillColor: [29, 78, 216] },
          styles: { fontSize: 9 },
        })
        y = getLastAutoTableFinalY(doc, y) + 10
      }
    }

    // Footer on every page
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      const pageHeight = doc.internal.pageSize.getHeight()

      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        'VidaRecord — Tu historial médico. Siempre contigo.',
        marginX,
        pageHeight - 14
      )
      doc.text(
        'Este resumen es informativo y no sustituye la evaluación de un profesional de salud.',
        marginX,
        pageHeight - 10
      )
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 10, {
        align: 'right',
      })
    }

    const fileDate = new Date().toISOString().slice(0, 10)
    doc.save(`VidaRecord-Resumen-${fileDate}.pdf`)

    setGenerating(false)
    setSuccess(true)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Resumen PDF</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-gray-800 font-semibold mb-4">
            ¿Qué incluir en el resumen?
          </h2>

          <div className="space-y-3">
            {(Object.keys(sectionLabels) as SectionKey[]).map((key) => (
              <label
                key={key}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={sections[key]}
                  onChange={() => toggleSection(key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-700 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  {sectionLabels[key]}
                </span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={handleGeneratePdf}
            disabled={generating}
            className="w-full mt-6 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 transition-colors"
          >
            {generating ? 'Generando PDF...' : '📄 Generar y descargar PDF'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            El PDF se descargará directamente en tu dispositivo
          </p>

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3 text-center">
              PDF generado y descargado correctamente.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="border-b-2 border-blue-700 pb-4 mb-6">
            <p className="text-2xl font-bold text-blue-700">VidaRecord</p>
            <p className="text-gray-600 mt-1">Resumen Médico Personal</p>
            <p className="text-xs text-gray-400 mt-2">
              Generado el {todayLabel}
            </p>
          </div>

          <div className="space-y-6">
            {sections.personal && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Datos personales
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Nombre: {profile.full_name}</p>
                  <p>
                    Fecha de nacimiento:{' '}
                    {formatDate(profile.date_of_birth) || 'No especificada'}
                  </p>
                  <p>Tipo de sangre: {profile.blood_type || 'No especificado'}</p>
                  <p>Alergias: {profile.allergies || 'Ninguna registrada'}</p>
                  <p>
                    Notas médicas importantes:{' '}
                    {profile.medical_notes || 'Ninguna'}
                  </p>
                  <p>
                    Contacto de emergencia:{' '}
                    {profile.emergency_contact_name
                      ? `${profile.emergency_contact_name}${
                          profile.emergency_contact_phone
                            ? ` - ${profile.emergency_contact_phone}`
                            : ''
                        }`
                      : 'No especificado'}
                  </p>
                </div>
              </section>
            )}

            {sections.medications && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Medicamentos activos
                </h3>
                {medications.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin medicamentos activos.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-1.5 pr-3 font-medium">Medicamento</th>
                          <th className="py-1.5 pr-3 font-medium">Dosis</th>
                          <th className="py-1.5 pr-3 font-medium">Frecuencia</th>
                          <th className="py-1.5 font-medium">Desde</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medications.map((m) => (
                          <tr key={m.id} className="border-b border-gray-100">
                            <td className="py-1.5 pr-3 text-gray-700">{m.name}</td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {m.dose || '—'}
                            </td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {m.frequency || '—'}
                            </td>
                            <td className="py-1.5 text-gray-500">
                              {formatDate(m.start_date) || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {sections.appointments && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Últimas consultas
                </h3>
                {appointments.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin consultas registradas.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-1.5 pr-3 font-medium">Fecha</th>
                          <th className="py-1.5 pr-3 font-medium">Especialidad</th>
                          <th className="py-1.5 pr-3 font-medium">Médico</th>
                          <th className="py-1.5 font-medium">Diagnóstico</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map((a) => (
                          <tr key={a.id} className="border-b border-gray-100">
                            <td className="py-1.5 pr-3 text-gray-500">
                              {formatDate(a.date) || '—'}
                            </td>
                            <td className="py-1.5 pr-3 text-gray-700">
                              {a.specialty || '—'}
                            </td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {a.doctors?.name || '—'}
                            </td>
                            <td className="py-1.5 text-gray-500">
                              {a.diagnosis || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {sections.diagnoses && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Diagnósticos activos
                </h3>
                {diagnoses.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin diagnósticos activos.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-1.5 pr-3 font-medium">Diagnóstico</th>
                          <th className="py-1.5 pr-3 font-medium">Tipo</th>
                          <th className="py-1.5 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diagnoses.map((d) => (
                          <tr key={d.id} className="border-b border-gray-100">
                            <td className="py-1.5 pr-3 text-gray-700">{d.name}</td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {d.is_chronic ? 'Crónico' : 'Agudo'}
                            </td>
                            <td className="py-1.5 text-gray-500">
                              {formatDate(d.diagnosed_at) || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {sections.studies && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Estudios recientes
                </h3>
                {studies.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin estudios registrados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-1.5 pr-3 font-medium">Estudio</th>
                          <th className="py-1.5 pr-3 font-medium">Tipo</th>
                          <th className="py-1.5 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studies.map((s) => (
                          <tr key={s.id} className="border-b border-gray-100">
                            <td className="py-1.5 pr-3 text-gray-700">{s.name}</td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {(s.type && studyTypeLabels[s.type]) || s.type || '—'}
                            </td>
                            <td className="py-1.5 text-gray-500">
                              {formatDate(s.date) || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {sections.indicators && (
              <section>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Indicadores de salud
                </h3>
                {indicators.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Sin indicadores registrados.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="text-xs text-gray-500 border-b border-gray-200">
                          <th className="py-1.5 pr-3 font-medium">Indicador</th>
                          <th className="py-1.5 pr-3 font-medium">Último valor</th>
                          <th className="py-1.5 font-medium">Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {indicators.map((i) => (
                          <tr key={i.type} className="border-b border-gray-100">
                            <td className="py-1.5 pr-3 text-gray-700">
                              {indicatorTypeLabels[i.type] ?? i.type}
                            </td>
                            <td className="py-1.5 pr-3 text-gray-500">
                              {formatIndicatorValue(i)}
                            </td>
                            <td className="py-1.5 text-gray-500">
                              {formatDate(i.measured_at) || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>

          <div className="border-t border-gray-100 mt-8 pt-4 text-center">
            <p className="text-xs text-gray-400">
              Generado por VidaRecord — No sustituye evaluación médica
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
