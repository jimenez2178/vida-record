'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable, { type RowInput, type Styles } from 'jspdf-autotable'

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

type DoctorRef = { name: string } | null

type AppointmentRow = {
  id: string
  date: string
  specialty: string | null
  clinic_name: string | null
  reason: string | null
  diagnosis: string | null
  notes: string | null
  doctors: DoctorRef
}

type MedicationRow = {
  id: string
  name: string
  dose: string | null
  frequency: string | null
  start_date: string | null
  notes: string | null
  doctors: DoctorRef
}

type DiagnosisRow = {
  id: string
  name: string
  description: string | null
  notes: string | null
  is_chronic: boolean
  diagnosed_at: string | null
  doctors: DoctorRef
}

type StudyRow = {
  id: string
  name: string
  type: string | null
  date: string | null
  notes: string | null
}

type IndicatorRow = {
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
  notes: string | null
}

type SectionKey =
  | 'personal'
  | 'diagnoses'
  | 'medications'
  | 'appointments'
  | 'studies'
  | 'indicators'

type TableSectionKey = Exclude<SectionKey, 'personal'>

// Una fila principal de la tabla más sus detalles de texto libre, que se
// imprimen debajo ocupando todo el ancho para que no se corten.
type Detail = { label: string; value: string | null | undefined }

type TableRow = {
  id: string
  cells: string[]
  details: Detail[]
}

type TableSection = {
  key: TableSectionKey
  head: string[]
  rows: TableRow[]
  empty: string
  // Anchos fijos (mm) por índice de columna; el resto se reparte solo.
  widths: Record<number, number>
}

const sectionLabels: Record<SectionKey, string> = {
  personal: 'Datos personales',
  diagnoses: 'Diagnósticos activos',
  medications: 'Medicamentos activos',
  appointments: 'Últimas consultas',
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

const BLUE: [number, number, number] = [29, 78, 216]
const TEXT_DARK: [number, number, number] = [31, 41, 55]
const TEXT_MUTED: [number, number, number] = [107, 114, 128]
const ROW_ALT: [number, number, number] = [243, 246, 251]
const ROW_BORDER: [number, number, number] = [220, 226, 236]

function parseDate(dateStr: string) {
  return dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr)
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return parseDate(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(dateStr: string | null) {
  if (!dateStr) return null
  return parseDate(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function calculateAge(dateStr: string | null) {
  if (!dateStr) return null
  const birth = parseDate(dateStr)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatIndicatorValue(indicator: IndicatorRow) {
  if (indicator.type === 'presion') {
    return `${indicator.value_primary}/${indicator.value_secondary}${
      indicator.unit ? ` ${indicator.unit}` : ''
    }`
  }
  return `${indicator.value_primary}${indicator.unit ? ` ${indicator.unit}` : ''}`
}

function formatEmergencyContact(profile: Profile) {
  if (!profile.emergency_contact_name) return 'No especificado'
  return `${profile.emergency_contact_name}${
    profile.emergency_contact_phone ? ` - ${profile.emergency_contact_phone}` : ''
  }`
}

function presentDetails(details: Detail[]) {
  return details.filter((d): d is { label: string; value: string } =>
    Boolean(d.value?.trim())
  )
}

// Las fuentes estándar de jsPDF solo cubren WinAnsi (Latin-1 + algunos
// signos). Sustituye los símbolos médicos comunes que quedan fuera y elimina
// el resto (emojis, etc.) para que no salgan caracteres basura en el PDF.
const pdfReplacements: Record<string, string> = {
  '≥': '>=',
  '≤': '<=',
  '≠': '!=',
  '→': '->',
  '←': '<-',
  '−': '-',
  '✓': '',
  '✔': '',
}
const winAnsiExtras = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ'

function toPdfText(text: string) {
  return Array.from(text.normalize('NFC'))
    .map((char) => {
      if (char in pdfReplacements) return pdfReplacements[char]
      const code = char.codePointAt(0) ?? 0
      if (code <= 0xff || winAnsiExtras.includes(char)) return char
      return ''
    })
    .join('')
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
  // Lecturas por tipo, de la más reciente a la más antigua.
  indicators: IndicatorRow[][]
}) {
  const [sections, setSections] = useState<Record<SectionKey, boolean>>({
    personal: true,
    diagnoses: true,
    medications: true,
    appointments: true,
    studies: true,
    indicators: true,
  })
  const [generating, setGenerating] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggleSection = (key: SectionKey) => {
    setSuccess(false)
    setSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const todayLabel = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const age = calculateAge(profile.date_of_birth)
  const patientMeta = [
    age !== null ? `${age} años` : null,
    profile.date_of_birth
      ? `Nacimiento: ${formatDate(profile.date_of_birth)}`
      : null,
    `Tipo de sangre: ${profile.blood_type || 'No especificado'}`,
  ]
    .filter(Boolean)
    .join('   |   ')

  const criticalInfo: Detail[] = [
    { label: 'Alergias', value: profile.allergies || 'Ninguna registrada' },
    {
      label: 'Notas médicas importantes',
      value: profile.medical_notes || 'Ninguna',
    },
  ]

  const tableSections: TableSection[] = [
    {
      key: 'diagnoses',
      head: ['Diagnóstico', 'Tipo', 'Fecha', 'Médico'],
      empty: 'Sin diagnósticos activos.',
      widths: { 1: 18, 2: 26, 3: 44 },
      rows: diagnoses.map((d) => ({
        id: d.id,
        cells: [
          d.name,
          d.is_chronic ? 'Crónico' : 'Agudo',
          formatShortDate(d.diagnosed_at) || '—',
          d.doctors?.name || '—',
        ],
        details: [
          { label: 'Descripción', value: d.description },
          { label: 'Notas', value: d.notes },
        ],
      })),
    },
    {
      key: 'medications',
      head: ['Medicamento', 'Dosis', 'Frecuencia', 'Desde'],
      empty: 'Sin medicamentos activos.',
      widths: { 1: 26, 2: 52, 3: 26 },
      rows: medications.map((m) => ({
        id: m.id,
        cells: [
          m.name,
          m.dose || '—',
          m.frequency || '—',
          formatShortDate(m.start_date) || '—',
        ],
        details: [
          { label: 'Indicado por', value: m.doctors?.name },
          { label: 'Notas', value: m.notes },
        ],
      })),
    },
    {
      key: 'appointments',
      head: ['Fecha', 'Especialidad', 'Médico', 'Centro médico'],
      empty: 'Sin consultas registradas.',
      widths: { 0: 26, 1: 40, 2: 50 },
      rows: appointments.map((a) => ({
        id: a.id,
        cells: [
          formatShortDate(a.date) || '—',
          a.specialty || '—',
          a.doctors?.name || '—',
          a.clinic_name || '—',
        ],
        details: [
          { label: 'Motivo', value: a.reason },
          { label: 'Diagnóstico', value: a.diagnosis },
          { label: 'Notas', value: a.notes },
        ],
      })),
    },
    {
      key: 'studies',
      head: ['Estudio', 'Tipo', 'Fecha'],
      empty: 'Sin estudios registrados.',
      widths: { 1: 30, 2: 30 },
      rows: studies.map((s) => ({
        id: s.id,
        cells: [
          s.name,
          (s.type && studyTypeLabels[s.type]) || s.type || '—',
          formatShortDate(s.date) || '—',
        ],
        details: [{ label: 'Notas', value: s.notes }],
      })),
    },
    {
      key: 'indicators',
      head: ['Indicador', 'Último valor', 'Fecha', 'Lecturas anteriores'],
      empty: 'Sin indicadores registrados.',
      widths: { 0: 38, 1: 30, 2: 26 },
      rows: indicators
        .filter((readings) => readings.length > 0)
        .map((readings) => {
          const [latest, ...previous] = readings
          return {
            id: latest.type,
            cells: [
              indicatorTypeLabels[latest.type] ?? latest.type,
              formatIndicatorValue(latest),
              formatShortDate(latest.measured_at) || '—',
              previous.length > 0
                ? previous
                    .map(
                      (r) =>
                        `${formatIndicatorValue(r)} (${formatShortDate(r.measured_at)})`
                    )
                    .join('\n')
                : '—',
            ],
            details: [{ label: 'Notas', value: latest.notes }],
          }
        }),
    },
  ]

  const handleGeneratePdf = () => {
    setGenerating(true)
    setSuccess(false)

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginX = 15
    const contentWidth = pageWidth - marginX * 2
    const topMargin = 18
    const bottomLimit = pageHeight - 24
    let y = topMargin

    const ensureSpace = (needed: number) => {
      if (y + needed > bottomLimit) {
        doc.addPage()
        y = topMargin
      }
    }

    const addSectionTitle = (title: string) => {
      // Reserva espacio para el título y al menos la primera fila de la tabla.
      ensureSpace(28)
      doc.setFontSize(12.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...BLUE)
      doc.text(title, marginX, y)
      y += 1.8
      doc.setDrawColor(...ROW_BORDER)
      doc.setLineWidth(0.3)
      doc.line(marginX, y, pageWidth - marginX, y)
      doc.setFont('helvetica', 'normal')
      y += 4
    }

    const addEmptyMessage = (message: string) => {
      doc.setFontSize(9.5)
      doc.setTextColor(...TEXT_MUTED)
      doc.text(message, marginX, y + 2)
      y += 12
    }

    const addGroupedTable = (section: TableSection) => {
      const body: RowInput[] = []
      const groupOf: number[] = []
      const isDetailRow: boolean[] = []

      section.rows.forEach((row, groupIndex) => {
        body.push(row.cells.map((cell) => toPdfText(cell || '—')))
        groupOf.push(groupIndex)
        isDetailRow.push(false)

        const details = presentDetails(row.details)
        if (details.length > 0) {
          body.push([
            {
              content: toPdfText(
                details.map((d) => `${d.label}: ${d.value.trim()}`).join('\n')
              ),
              colSpan: section.head.length,
            },
          ])
          groupOf.push(groupIndex)
          isDetailRow.push(true)
        }
      })

      const columnStyles: Record<number, Partial<Styles>> = {}
      Object.entries(section.widths).forEach(([index, width]) => {
        columnStyles[Number(index)] = { cellWidth: width }
      })

      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: marginX, top: topMargin, bottom: 26 },
        head: [section.head],
        body,
        theme: 'plain',
        rowPageBreak: 'avoid',
        showHead: 'everyPage',
        headStyles: {
          fillColor: BLUE,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          textColor: TEXT_DARK,
          cellPadding: { top: 2.2, bottom: 2.2, left: 3, right: 3 },
          overflow: 'linebreak',
          valign: 'top',
        },
        columnStyles,
        didParseCell: (data) => {
          if (data.section !== 'body') return
          const rowIndex = data.row.index
          const styles = data.cell.styles

          if (groupOf[rowIndex] % 2 === 1) styles.fillColor = ROW_ALT

          if (isDetailRow[rowIndex]) {
            styles.fontSize = 8.5
            styles.textColor = [55, 65, 81]
            styles.cellPadding = { top: 0.5, bottom: 3, left: 3, right: 3 }
          } else if (data.column.index === 0) {
            styles.fontStyle = 'bold'
          }

          if (groupOf[rowIndex + 1] !== groupOf[rowIndex]) {
            styles.lineWidth = { bottom: 0.25 }
            styles.lineColor = ROW_BORDER
          }
        },
      })

      y = getLastAutoTableFinalY(doc, y) + 10
    }

    // Encabezado
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...BLUE)
    doc.text('VidaRecord', marginX, y + 2)

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...TEXT_DARK)
    doc.text('Resumen Médico Personal', pageWidth - marginX, y - 1, {
      align: 'right',
    })
    doc.setFontSize(8.5)
    doc.setTextColor(...TEXT_MUTED)
    doc.text(`Generado el ${todayLabel}`, pageWidth - marginX, y + 4, {
      align: 'right',
    })

    y += 8
    doc.setDrawColor(...BLUE)
    doc.setLineWidth(0.8)
    doc.line(marginX, y, pageWidth - marginX, y)
    y += 10

    if (sections.personal) {
      // Paciente
      doc.setFontSize(15)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT_DARK)
      doc.text(toPdfText(profile.full_name), marginX, y)
      y += 6

      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(75, 85, 99)
      doc.text(toPdfText(patientMeta), marginX, y)
      y += 7

      // Recuadro de información crítica (alergias y notas importantes)
      const boxPadding = 4
      const textWidth = contentWidth - boxPadding * 2
      doc.setFontSize(9.5)
      const wrapped = criticalInfo.map(
        (item) =>
          doc.splitTextToSize(toPdfText(item.value ?? ''), textWidth) as string[]
      )
      const lineHeight = 4.4
      const boxHeight =
        boxPadding * 2 +
        wrapped.reduce((sum, lines) => sum + 4.5 + lines.length * lineHeight, 0) +
        (wrapped.length - 1) * 2.5

      ensureSpace(boxHeight + 4)
      doc.setFillColor(254, 242, 242)
      doc.setDrawColor(252, 165, 165)
      doc.setLineWidth(0.3)
      doc.roundedRect(marginX, y, contentWidth, boxHeight, 1.5, 1.5, 'FD')
      doc.setFillColor(220, 38, 38)
      doc.rect(marginX, y, 1.4, boxHeight, 'F')

      let boxY = y + boxPadding + 3
      criticalInfo.forEach((item, index) => {
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(185, 28, 28)
        doc.text(item.label.toUpperCase(), marginX + boxPadding, boxY)
        boxY += 4.5

        doc.setFontSize(9.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...TEXT_DARK)
        doc.text(wrapped[index], marginX + boxPadding, boxY)
        boxY += wrapped[index].length * lineHeight + 2.5
      })
      y += boxHeight + 6

      // Contacto de emergencia
      ensureSpace(8)
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT_DARK)
      const contactLabel = 'Contacto de emergencia: '
      doc.text(contactLabel, marginX, y)
      const contactLabelWidth = doc.getTextWidth(contactLabel)
      doc.setFont('helvetica', 'normal')
      doc.text(
        toPdfText(formatEmergencyContact(profile)),
        marginX + contactLabelWidth,
        y
      )
      y += 12
    }

    tableSections.forEach((section) => {
      if (!sections[section.key]) return
      addSectionTitle(sectionLabels[section.key])
      if (section.rows.length === 0) {
        addEmptyMessage(section.empty)
      } else {
        addGroupedTable(section)
      }
    })

    // Pie de página en todas las páginas
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      doc.setDrawColor(...ROW_BORDER)
      doc.setLineWidth(0.3)
      doc.line(marginX, pageHeight - 18, pageWidth - marginX, pageHeight - 18)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(140, 140, 140)
      doc.text(
        toPdfText(`VidaRecord — Resumen médico de ${profile.full_name}`),
        marginX,
        pageHeight - 13
      )
      doc.text(
        'Este resumen es informativo y no sustituye la evaluación de un profesional de salud.',
        marginX,
        pageHeight - 9
      )
      doc.text(`Página ${i} de ${pageCount}`, pageWidth - marginX, pageHeight - 13, {
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
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            Consejo: la descripción y las notas de cada diagnóstico, consulta
            y medicamento se incluyen completas en el PDF. Mientras más
            detalle escribas, mejor podrá entenderlo tu médico.
          </p>

          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mt-3 text-center">
              PDF generado y descargado correctamente.
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="border-b-2 border-blue-700 pb-4 mb-6 flex items-end justify-between gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="VidaRecord" className="h-12 w-auto" />
            <div className="text-right">
              <p className="text-gray-700">Resumen Médico Personal</p>
              <p className="text-xs text-gray-400 mt-1">
                Generado el {todayLabel}
              </p>
            </div>
          </div>

          <div className="space-y-7">
            {sections.personal && (
              <section>
                <p className="text-lg font-bold text-gray-800">
                  {profile.full_name}
                </p>
                <p className="text-sm text-gray-600 mt-0.5">{patientMeta}</p>

                <div className="mt-4 rounded-lg border border-red-200 border-l-4 border-l-red-600 bg-red-50 px-4 py-3 space-y-2.5">
                  {criticalInfo.map((item) => (
                    <div key={item.label}>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-red-700">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-800 mt-3">
                  <span className="font-semibold">Contacto de emergencia:</span>{' '}
                  {formatEmergencyContact(profile)}
                </p>
              </section>
            )}

            {tableSections.map((section) =>
              sections[section.key] ? (
                <section key={section.key}>
                  <h3 className="text-sm font-semibold text-blue-700 border-b border-gray-200 pb-1 mb-2">
                    {sectionLabels[section.key]}
                  </h3>
                  {section.rows.length === 0 ? (
                    <p className="text-sm text-gray-400">{section.empty}</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr className="text-xs text-gray-500 border-b border-gray-200">
                            {section.head.map((heading) => (
                              <th key={heading} className="py-1.5 pr-3 font-medium">
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        {section.rows.map((row) => {
                          const details = presentDetails(row.details)
                          return (
                            <tbody key={row.id} className="border-b border-gray-100">
                              <tr className="align-top">
                                {row.cells.map((cell, index) => (
                                  <td
                                    key={index}
                                    className={`py-1.5 pr-3 whitespace-pre-line ${
                                      index === 0
                                        ? 'text-gray-800 font-medium'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                              {details.length > 0 && (
                                <tr>
                                  <td
                                    colSpan={section.head.length}
                                    className="pb-2 pr-3 text-xs text-gray-600 space-y-0.5"
                                  >
                                    {details.map((d) => (
                                      <p key={d.label} className="whitespace-pre-line">
                                        <span className="font-semibold text-gray-700">
                                          {d.label}:
                                        </span>{' '}
                                        {d.value}
                                      </p>
                                    ))}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          )
                        })}
                      </table>
                    </div>
                  )}
                </section>
              ) : null
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
