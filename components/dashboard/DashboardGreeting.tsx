'use client'

import { useEffect, useState } from 'react'

function getGreeting(date: Date) {
  const hour = date.getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

function getTodayLabel(date: Date) {
  const label = date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export default function DashboardGreeting({
  displayName,
}: {
  displayName: string
}) {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
  }, [])

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-teal-600">
        {now ? getGreeting(now) : 'Hola'}, {displayName} 👋
      </h1>
      <p className="text-gray-500 mt-1">{now ? getTodayLabel(now) : ''}</p>
    </header>
  )
}
