'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AssistantFab() {
  const pathname = usePathname()

  if (pathname === '/asistente') return null

  return (
    <Link
      href="/asistente"
      className="flex fixed bottom-24 md:bottom-6 right-6 z-30 items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-full shadow-lg px-5 py-3 transition-colors"
    >
      🤖 Asistente IA
    </Link>
  )
}
