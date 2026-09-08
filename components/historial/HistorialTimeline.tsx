'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type EventType = 'cita' | 'medicamento' | 'estudio' | 'diagnostico'

type TimelineEvent = {
  id: string
  type: EventType
  date: string
  title: string
  subtitle: string | null
  badge: string | null
  color: string
}

type AppointmentRow = {
  id: string
  date: string
  specialty: string | null
  status: string
  diagnosis: string | null
  clinic_name: string | null
  doctors: { name: string } | null
}

type MedicationRow = {
  id: string
  created_at: string
  name: string
  dose: string | null
  frequency: string | null
  is_active: boolean
  doctors: { name: string } | null
}

type StudyRow = {
  id: string
  date: string | null
  created_at: string
  name: string
  type: string | null
}

type DiagnosisRow = {
  id: string
  diagnosed_at: string | null
  created_at: string
  name: string
  is_active: boolean
  is_chronic: boolean
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
  { dot: string; iconWrap: string; badge: string; icon: React.ReactNode }
> = {
  cita: {
    dot: 'bg-blue-500',
    iconWrap: 'bg-blue-50 text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
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
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3a2.25 2.25 0 00-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75h-6a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75h6m-6 3.75h6"
        />
      </>
    ),
  },
}

const filters: { value: 'todos' | EventType; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'cita', label: 'Consultas' },
  { value: 'medicamento', label: 'Medicamentos' },
  { value: 'estudio', label: 'Estudios' },
  { value: 'diagnostico', label: 'Diagnósticos' },
]

function parseEventDate(raw: string) {
  return raw.length === 10 ? new Date(`${raw}T00:00:00`) : new Date(raw)
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

function TimelineItem({
  event,
  isLast,
}: {
  event: TimelineEvent
  isLast: boolean
}) {
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
        {!isLast && <span className="w-0.5 flex-1 bg-blue-200 mt-1" />}
      </div>

      <div className="flex-1 pb-6 min-w-0">
        <div className="bg-white rounded-xl shadow-sm p-4">
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
              >
                {config.icon}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)

      const [
        { data: appointmentsData },
        { data: medicationsData },
        { data: studiesData },
        { data: diagnosesData },
      ] = await Promise.all([
        supabase
          .from('appointments')
          .select(
            'id, date, specialty, status, diagnosis, clinic_name, doctors ( name )'
          )
          .eq('profile_id', profileId),
        supabase
          .from('medications')
          .select('id, created_at, name, dose, frequency, is_active, doctors ( name )')
          .eq('profile_id', profileId),
        supabase
          .from('studies')
          .select('id, date, created_at, name, type')
          .eq('profile_id', profileId),
        supabase
          .from('diagnoses')
          .select('id, diagnosed_at, created_at, name, is_active, is_chronic')
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
          subtitle: a.doctors?.name || a.clinic_name || null,
          badge: appointmentStatusLabels[a.status] ?? a.status,
          color: typeConfig.cita.dot,
        })
      })

      ;(medicationsData as MedicationRow[] | null)?.forEach((m) => {
        mapped.push({
          id: `medicamento-${m.id}`,
          type: 'medicamento',
          date: m.created_at,
          title: m.name,
          subtitle: [m.dose, m.frequency].filter(Boolean).join(' · ') || null,
          badge: m.is_active ? 'Activo' : 'Finalizado',
          color: typeConfig.medicamento.dot,
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
          color: typeConfig.estudio.dot,
        })
      })

      ;(diagnosesData as DiagnosisRow[] | null)?.forEach((d) => {
        mapped.push({
          id: `diagnostico-${d.id}`,
          type: 'diagnostico',
          date: d.diagnosed_at || d.created_at,
          title: d.name,
          subtitle: d.is_chronic ? 'Condición crónica' : 'Diagnóstico',
          badge: d.is_active ? 'Activo' : 'Resuelto',
          color: typeConfig.diagnostico.dot,
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

  const visible =
    filter === 'todos' ? events : events.filter((e) => e.type === filter)

  const nodes: React.ReactNode[] = []
  let lastMonthKey = ''

  visible.forEach((event, index) => {
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
      <TimelineItem
        key={event.id}
        event={event}
        isLast={index === visible.length - 1}
      />
    )
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Historial cronológico
      </h1>

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
            A medida que registres consultas, medicamentos, estudios y
            diagnósticos, aparecerán aquí en orden cronológico.
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <p className="text-gray-500 text-sm">
            No tienes eventos de este tipo.
          </p>
        </div>
      ) : (
        <div>{nodes}</div>
      )}
    </div>
  )
}
