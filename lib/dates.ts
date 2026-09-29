export function todayDateString() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

function parseDate(dateStr: string) {
  return dateStr.length === 10 ? new Date(`${dateStr}T00:00:00`) : new Date(dateStr)
}

export function formatDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  })
}

// Días desde hoy hasta la fecha (negativo si ya pasó).
export function daysUntil(dateStr: string) {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  return Math.round((startOf(parseDate(dateStr)) - startOf(new Date())) / 86_400_000)
}

// "Hoy", "Mañana", "En 5 días", "En 3 semanas"...
export function countdownLabel(dateStr: string) {
  const days = daysUntil(dateStr)
  if (days < 0) return null
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  if (days < 14) return `En ${days} días`
  if (days < 60) return `En ${Math.floor(days / 7)} semanas`
  return `En ${Math.floor(days / 30)} meses`
}

// "hoy", "ayer", "hace 5 días", "hace 3 semanas", "hace 2 meses"...
export function timeAgo(dateStr: string) {
  const date = parseDate(dateStr)
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((startOf(new Date()) - startOf(date)) / 86_400_000)

  if (days <= 0) return 'hoy'
  if (days === 1) return 'ayer'
  if (days < 14) return `hace ${days} días`
  if (days < 60) return `hace ${Math.floor(days / 7)} semanas`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  const years = Math.floor(days / 365)
  return years === 1 ? 'hace 1 año' : `hace ${years} años`
}
