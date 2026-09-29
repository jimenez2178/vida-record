'use client'

import { useSyncExternalStore } from 'react'

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

const subscribe = () => () => {}
// Redondeado al minuto para que el valor sea estable entre renders.
const getMinute = () => Math.floor(Date.now() / 60_000)
// En el servidor no conocemos la hora local del usuario.
const getServerMinute = () => null

export default function DashboardGreeting({
  displayName,
}: {
  displayName: string
}) {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute)
  const now = minute === null ? null : new Date(minute * 60_000)

  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold text-blue-900">
        {now ? getGreeting(now) : 'Hola'}, {displayName} 👋
      </h1>
      <p className="text-gray-500 mt-1">{now ? getTodayLabel(now) : ''}</p>
    </header>
  )
}
