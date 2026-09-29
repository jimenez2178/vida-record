export type AttentionLevel = 'urgent' | 'warning' | 'info'

export type AttentionItem = {
  id: string
  level: AttentionLevel
  title: string
  detail: string
  href: string
  cta: string
}

type AttentionInput = {
  today: string
  profileHref: string
  isPremium: boolean
  profile: {
    date_of_birth: string | null
    blood_type: string | null
    emergency_contact_name: string | null
  } | null
  nextAppointment: {
    date: string
    time: string | null
    specialty: string | null
    doctors: { name: string } | null
  } | null
  medications: {
    name: string
    quantity_remaining: number | null
    start_date: string | null
  }[]
  diagnoses: { name: string; description: string | null }[]
  unanalyzedStudies: { name: string }[]
  // Consultas programadas cuya fecha ya pasó.
  unconfirmedAppointments: { specialty: string | null }[]
  lastBloodPressure: {
    value_primary: number | null
    value_secondary: number | null
    measured_at: string
  } | null
}

// Mismo umbral que la alerta de la tarjeta de medicamentos.
const LOW_STOCK_THRESHOLD = 5
const APPOINTMENT_WINDOW_DAYS = 7

const levelOrder: Record<AttentionLevel, number> = {
  urgent: 0,
  warning: 1,
  info: 2,
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T00:00:00`).getTime()
  return Math.round((end - start) / 86_400_000)
}

function listNames(names: string[], max = 3) {
  if (names.length <= max) return names.join(', ')
  return `${names.slice(0, max).join(', ')} y ${names.length - max} más`
}

function whenLabel(days: number) {
  if (days === 0) return 'hoy'
  if (days === 1) return 'mañana'
  return `en ${days} días`
}

export function buildAttentionItems(input: AttentionInput): AttentionItem[] {
  const items: AttentionItem[] = []

  const appointment = input.nextAppointment
  if (appointment) {
    const days = daysBetween(input.today, appointment.date)
    if (days >= 0 && days <= APPOINTMENT_WINDOW_DAYS) {
      const who = [appointment.specialty, appointment.doctors?.name]
        .filter(Boolean)
        .join(' con ')
      const time = appointment.time ? ` a las ${appointment.time.slice(0, 5)}` : ''
      items.push({
        id: 'appointment-soon',
        level: days <= 1 ? 'warning' : 'info',
        title: `Tienes una cita ${whenLabel(days)}${time}`,
        detail: who || 'Consulta médica',
        href: '/citas',
        cta: 'Ver cita',
      })
    }
  }

  const unconfirmed = input.unconfirmedAppointments
  if (unconfirmed.length > 0) {
    items.push({
      id: 'appointments-unconfirmed',
      level: 'info',
      title:
        unconfirmed.length === 1
          ? '¿Asististe a tu consulta?'
          : `${unconfirmed.length} consultas pasadas sin confirmar`,
      detail: `${listNames(
        unconfirmed.map((a) => a.specialty || 'Consulta médica')
      )}: siguen como programadas aunque su fecha ya pasó.`,
      href: '/citas',
      cta: 'Confirmar',
    })
  }

  const bp = input.lastBloodPressure
  if (bp && bp.value_primary !== null && bp.value_secondary !== null) {
    const sys = bp.value_primary
    const dia = bp.value_secondary
    const reading = `${sys}/${dia} mmHg`

    if (sys <= dia || sys - dia < 20) {
      items.push({
        id: 'bp-suspicious',
        level: 'warning',
        title: 'Revisa tu última presión arterial',
        detail: `${reading} tiene muy poca diferencia entre la alta y la baja. Puede que se haya anotado mal.`,
        href: '/indicadores',
        cta: 'Revisar',
      })
    } else if (sys >= 180 || dia >= 120) {
      items.push({
        id: 'bp-crisis',
        level: 'urgent',
        title: 'Presión arterial muy alta',
        detail: `Tu última medición fue ${reading}. Si tienes síntomas, busca atención médica de inmediato.`,
        href: '/indicadores',
        cta: 'Ver registro',
      })
    } else if (sys >= 140 || dia >= 90) {
      items.push({
        id: 'bp-high',
        level: 'warning',
        title: 'Presión arterial elevada',
        detail: `Tu última medición fue ${reading}. Coméntalo con tu médico.`,
        href: '/indicadores',
        cta: 'Ver registro',
      })
    }
  }

  const lowStock = input.medications.filter(
    (m) =>
      typeof m.quantity_remaining === 'number' &&
      m.quantity_remaining <= LOW_STOCK_THRESHOLD
  )
  if (lowStock.length > 0) {
    items.push({
      id: 'medications-low-stock',
      level: 'warning',
      title:
        lowStock.length === 1
          ? 'Un medicamento está por agotarse'
          : `${lowStock.length} medicamentos están por agotarse`,
      detail: listNames(
        lowStock.map((m) => `${m.name} (quedan ${m.quantity_remaining})`)
      ),
      href: '/medicamentos',
      cta: 'Ver medicamentos',
    })
  }

  const futureStart = input.medications.filter(
    (m) => m.start_date && m.start_date > input.today
  )
  if (futureStart.length > 0) {
    items.push({
      id: 'medications-future-start',
      level: 'info',
      title: 'Fecha de inicio en el futuro',
      detail: `${listNames(futureStart.map((m) => m.name))}: revisa si la fecha "Desde" es correcta.`,
      href: '/medicamentos',
      cta: 'Corregir',
    })
  }

  const withoutDescription = input.diagnoses.filter((d) => !d.description?.trim())
  if (withoutDescription.length > 0) {
    items.push({
      id: 'diagnoses-without-description',
      level: 'info',
      title:
        withoutDescription.length === 1
          ? 'Un diagnóstico no tiene descripción'
          : `${withoutDescription.length} diagnósticos no tienen descripción`,
      detail: `${listNames(withoutDescription.map((d) => d.name), 2)}. Agrégala para que tu médico lo entienda en el Resumen PDF.`,
      href: '/diagnosticos',
      cta: 'Completar',
    })
  }

  if (input.isPremium && input.unanalyzedStudies.length > 0) {
    items.push({
      id: 'studies-unanalyzed',
      level: 'info',
      title:
        input.unanalyzedStudies.length === 1
          ? 'Un estudio sin analizar'
          : `${input.unanalyzedStudies.length} estudios sin analizar`,
      detail: `${listNames(input.unanalyzedStudies.map((s) => s.name))}. La IA puede ${
        input.unanalyzedStudies.length === 1 ? 'explicártelo' : 'explicártelos'
      } en palabras sencillas.`,
      href: '/estudios',
      cta: 'Analizar',
    })
  }

  if (input.profile) {
    const missing = [
      !input.profile.blood_type && 'tipo de sangre',
      !input.profile.date_of_birth && 'fecha de nacimiento',
      !input.profile.emergency_contact_name && 'contacto de emergencia',
    ].filter((field): field is string => Boolean(field))

    if (missing.length > 0) {
      items.push({
        id: 'profile-incomplete',
        level: 'info',
        title: 'Completa tu perfil médico',
        detail: `Falta: ${missing.join(', ')}. Es lo primero que necesita un médico en una emergencia.`,
        href: input.profileHref,
        cta: 'Completar',
      })
    }
  }

  return items.sort((a, b) => levelOrder[a.level] - levelOrder[b.level])
}
