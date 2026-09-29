'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, todayDateString } from '@/lib/dates'
import {
  formatIndicatorValue,
  indicatorTypeLabels,
} from '@/lib/dashboard/indicators'

type EventType = 'cita' | 'medicamento' | 'estudio' | 'diagnostico' | 'medicion'

type Detail = { label: string; value: string }

type TimelineEvent = {
  id: string
  type: EventType
  date: string
  title: string
  subtitle: string | null
  badge: string | null
  details: Detail[]
  muted: boolean
}

type AppointmentRow = {
  id: string
  date: string
  time: string | null
  specialty: string | null
  status: string
  reason: string | null
  diagnosis: string | null
  notes: string | null
  clinic_name: string | null
  doctors: { name: string } | null
}

type MedicationRow = {
  id: string
  start_date: string | null
  end_date: string | null
  created_at: string
  name: string
  dose: string | null
  frequency: string | null
  notes: string | null
  is_active: boolean
  doctors: { name: string } | null
}

type StudyRow = {
  id: string
  date: string | null
  created_at: string
  name: string
  type: string | null
  notes: string | null
}

type DiagnosisRow = {
  id: string
  diagnosed_at: string | null
  created_at: string
  name: string
  description: string | null
  notes: string | null
  is_active: boolean
  is_chronic: boolean
  doctors: { name: string } | null
}

type IndicatorRow = {
  id: string
  type: string
  value_primary: number | null
  value_secondary: number | null
  unit: string | null
  measured_at: string
  notes: string | null
}

const appointmentStatusLabels: Record<string, string> = {
  programada: 'Programada',
  completada: 'Completada',
  cancelada: 'Cancelada',
}

const studyTypeLabels: Record<string, string> = {
  laboratorio: 'Laboratorio',
  imagen: 'Imagen',
  receta: 'Receta',
  otro: 'Otro',
}

const typeConfig: Record<
  EventType,
  {
    dot: string
    iconWrap: string
    badge: string
    href: string
    icon: React.ReactNode
  }
> = {
  cita: {
    dot: 'bg-blue-500',
    iconWrap: 'bg-blue-50 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    href: '/citas',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 18.75V7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v11.25m-16.5 0A2.25 2.25 0 006 21h12a2.25 2.25 0 002.25-2.25m-16.5 0V11.25A2.25 2.25 0 016 9h12a2.25 2.25 0 012.25 2.25v7.5"
      />
    ),
  },
  medicamento: {
    dot: 'bg-green-500',
    iconWrap: 'bg-green-50 text-green-600',
    badge: 'bg-green-100 text-green-700',
    href: '/medicamentos',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 12.75l7.5-7.5a3.182 3.182 0 014.5 4.5l-7.5 7.5a3.182 3.182 0 01-4.5-4.5zM9 8.25l6 6"
      />
    ),
  },
  estudio: {
    dot: 'bg-purple-500',
    iconWrap: 'bg-purple-50 text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    href: '/estudios',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5.106 14.4c-1.6 1.6-.464 4.35 1.804 4.35h10.18c2.268 0 3.404-2.75 1.804-4.35l-3.985-3.99a2.25 2.25 0 01-.659-1.591V3.104M8.25 3.104h7.5"
      />
    ),
  },
  diagnostico: {
    dot: 'bg-red-500',
    iconWrap: 'bg-red-50 text-red-600',
    badge: 'bg-red-100 text-red-700',
    href: '/diagnosticos',
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3a2.25 2.25 0 00-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75h6m-6 3.75h6" />
      </>
    ),
  },
  medicion: {
    dot: 'bg-pink-500',
    iconWrap: 'bg-pink-50 text-pink-600',
    badge: 'bg-pink-100 text-pink-700',
    href: '/indicadores',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 12h3l2.25-6 4.5 12 2.25-6h4.5"
      />
    ),
  },
}

const filters: { value: 'todos' | EventType; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'cita', label: 'Consultas' },
  { value: 'diagnostico', label: 'Diagnósticos' },
  { value: 'medicamento', label: 'Medicamentos' },
  { value: 'estudio', label: 'Estudios' },
  { value: 'medicion', label: 'Mediciones' },
]

function parseEventDate(raw: string) {
  return raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw)
}

// Fecha del evento como YYYY-MM-DD en hora local, para compararla con hoy.
function localDay(raw: string) {
  if (raw.length === 10) return raw
  const d = new Date(raw)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatMonthYear(date: Date) {
  const label = date.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function toDetails(entries: [string, string | null | undefined][]): Detail[] {
  return entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]?.trim()))
    .map(([label, value]) => ({ label, value: value.trim() }))
}

function normalize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const config = typeConfig[event.type]
  const eventDate = parseEventDate(event.date)

  return (
    <div className="flex gap-3">
      <div className="w-14 shrink-0 text-right text-xs text-gray-400 pt-1">
        {formatDayLabel(eventDate)}
      </div>

      <div className="flex flex-col items-center w-4 shrink-0">
        <span
          className={`w-3 h-3 rounded-full ring-4 ring-gray-50 mt-1.5 shrink-0 ${config.dot}`}
        />
        {!isLast && <span className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>

      <div className="flex-1 pb-5 min-w-0">
        <div
          className={`bg-white rounded-xl shadow-sm p-4 ${event.muted ? 'opacity-60' : ''}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-gray-800 truncate">{event.title}</p>
              {event.subtitle && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {event.subtitle}
                </p>
              )}
              {event.badge && (
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2 ${config.badge}`}
                >
                  {event.badge}
                </span>
              )}
            </div>

            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${config.iconWrap}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-4 h-4"
                aria-hidden="true"
              >
                {config.icon}
              </svg>
            </div>
          </div>

          {expanded && event.details.length > 0 && (
            <dl className="mt-3 space-y-2 rounded-lg bg-gray-50 px-3 py-2.5">
              {event.details.map((d) => (
                <div key={d.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {d.label}
                  </dt>
                  <dd className="text-sm text-gray-800 whitespace-pre-line">{d.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {event.details.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                {expanded ? 'Ocultar detalles' : 'Ver detalles'}
              </button>
            )}
            <Link
              href={config.href}
              className="text-sm font-semibold text-gray-500 hover:text-gray-700"
            >
              Ir a la sección →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderTimeline(list: TimelineEvent[]) {
  const nodes: React.ReactNode[] = []
  let lastMonthKey = ''

  list.forEach((event, index) => {
    const eventDate = parseEventDate(event.date)
    const monthKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}`

    if (monthKey !== lastMonthKey) {
      lastMonthKey = monthKey
      nodes.push(
        <p
          key={`month-${monthKey}`}
          className="text-sm font-semibold text-gray-500 mt-6 mb-3 first:mt-0"
        >
          {formatMonthYear(eventDate)}
        </p>
      )
    }

    nodes.push(
      <TimelineItem key={event.id} event={event} isLast={index === list.length - 1} />
    )
  })

  return nodes
}

export default function HistorialTimeline({
  profileId,
}: {
  profileId: string
}) {
  const supabase = createClient()

  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | EventType>('todos')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)

      const [
        { data: appointmentsData },
        { data: medicationsData },
        { data: studiesData },
        { data: diagnosesData },
        { data: indicatorsData },
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select(
            'id, date, time, specialty, status, reason, diagnosis, notes, clinic_name, doctors ( name )'
          )
          .eq('profile_id', profileId),
        supabase
          .from('medications')
          .select(
            'id, start_date, end_date, created_at, name, dose, frequency, notes, is_active, doctors ( name )'
          )
          .eq('profile_id', profileId),
        supabase
          .from('studies')
          .select('id, date, created_at, name, type, notes')
          .eq('profile_id', profileId),
        supabase
          .from('diagnoses')
          .select(
            'id, diagnosed_at, created_at, name, description, notes, is_active, is_chronic, doctors ( name )'
          )
          .eq('profile_id', profileId),
        supabase
          .from('health_indicators')
          .select('id, type, value_primary, value_secondary, unit, measured_at, notes')
          .eq('profile_id', profileId),
      ])

      if (cancelled) return

      const mapped: TimelineEvent[] = []

      ;(appointmentsData as AppointmentRow[] | null)?.forEach((a) => {
        mapped.push({
          id: `cita-${a.id}`,
          type: 'cita',
          date: a.date,
          title: a.specialty || 'Consulta médica',
          subtitle:
            [a.doctors?.name, a.clinic_name, a.time?.slice(0, 5)]
              .filter(Boolean)
              .join(' · ') || null,
          badge: appointmentStatusLabels[a.status] ?? a.status,
          details: toDetails([
            ['Motivo', a.reason],
            ['Diagnóstico recibido', a.diagnosis],
            ['Notas', a.notes],
          ]),
          muted: a.status === 'cancelada',
        })
      })

      ;(medicationsData as MedicationRow[] | null)?.forEach((m) => {
        mapped.push({
          id: `medicamento-${m.id}`,
          type: 'medicamento',
          date: m.start_date || m.created_at,
          title: m.name,
          subtitle: [m.dose, m.frequency].filter(Boolean).join(' · ') || null,
          badge: m.is_active ? 'Activo' : 'Finalizado',
          details: toDetails([
            ['Indicado por', m.doctors?.name],
            ['Hasta', m.end_date ? formatDate(m.end_date) : null],
            ['Notas', m.notes],
          ]),
          muted: false,
        })
      })

      ;(studiesData as StudyRow[] | null)?.forEach((s) => {
        mapped.push({
          id: `estudio-${s.id}`,
          type: 'estudio',
          date: s.date || s.created_at,
          title: s.name,
          subtitle: s.type ? studyTypeLabels[s.type] ?? s.type : null,
          badge: null,
          details: toDetails([['Notas', s.notes]]),
          muted: false,
        })
      })

      ;(diagnosesData as DiagnosisRow[] | null)?.forEach((d) => {
        mapped.push({
          id: `diagnostico-${d.id}`,
          type: 'diagnostico',
          date: d.diagnosed_at || d.created_at,
          title: d.name,
          subtitle:
            [d.is_chronic ? 'Condición crónica' : 'Diagnóstico', d.doctors?.name]
              .filter(Boolean)
              .join(' · '),
          badge: d.is_active ? 'Activo' : 'Resuelto',
          details: toDetails([
            ['Descripción', d.description],
            ['Notas', d.notes],
          ]),
          muted: false,
        })
      })

      ;(indicatorsData as IndicatorRow[] | null)?.forEach((i) => {
        mapped.push({
          id: `medicion-${i.id}`,
          type: 'medicion',
          date: i.measured_at,
          title: `${indicatorTypeLabels[i.type] ?? i.type}: ${formatIndicatorValue(i)}`,
          subtitle: null,
          badge: null,
          details: toDetails([['Notas', i.notes]]),
          muted: false,
        })
      })

      mapped.sort(
        (a, b) => parseEventDate(b.date).getTime() - parseEventDate(a.date).getTime()
      )

      setEvents(mapped)
      setLoading(false)
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [profileId, supabase])

  const normalizedQuery = normalize(query.trim())
  const visible = events.filter((e) => {
    if (filter !== 'todos' && e.type !== filter) return false
    if (!normalizedQuery) return true
    const haystack = [e.title, e.subtitle, ...e.details.map((d) => d.value)]
      .filter(Boolean)
      .join(' ')
    return normalize(haystack).includes(normalizedQuery)
  })

  const today = todayDateString()
  // Lo que aún no ocurre va aparte, de lo más cercano a lo más lejano.
  const upcoming = visible.filter((e) => localDay(e.date) > today).reverse()
  const past = visible.filter((e) => localDay(e.date) <= today)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Historial cronológico
      </h1>

      <div className="mb-4">
        <label htmlFor="historial-search" className="sr-only">
          Buscar en el historial
        </label>
        <input
          id="historial-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar: médico, diagnóstico, medicamento..."
          className="w-full max-w-xl rounded-xl border border-gray-300 bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-400"
        />
      </div>

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
        <p className="text-gray-500 text-sm">Cargando historial...</p>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-800 font-semibold mb-2">
            Aún no tienes eventos en tu historial
          </p>
          <p className="text-gray-500 text-sm">
            A medida que registres consultas, medicamentos, estudios,
            diagnósticos y mediciones, aparecerán aquí en orden cronológico.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            {normalizedQuery
              ? `No encontramos resultados para "${query.trim()}".`
              : 'No tienes eventos de este tipo.'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 md:p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-blue-800 mb-4">
                Próximamente
              </h2>
              {renderTimeline(upcoming)}
            </section>
          )}
          {past.length > 0 && <section>{renderTimeline(past)}</section>}
        </div>
      )}
    </div>
  )
}
