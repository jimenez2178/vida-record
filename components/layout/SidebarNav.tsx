'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type NavLink = {
  href: string
  label: string
  icon: React.ReactNode
}

type FamilyProfile = {
  id: string
  full_name: string
}

export default function SidebarNav({
  links,
  onLinkClick,
  profiles,
  activeProfileId,
  userId,
  plan,
}: {
  links: NavLink[]
  onLinkClick?: () => void
  profiles?: FamilyProfile[]
  activeProfileId?: string | null
  userId?: string
  plan?: 'free' | 'premium'
}) {
  const pathname = usePathname()
  const supabase = createClient()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [switching, setSwitching] = useState(false)

  const showSwitcher = plan === 'premium' && (profiles?.length ?? 0) > 1
  const activeProfile = profiles?.find((p) => p.id === activeProfileId) ?? null

  const handleSwitch = async (profileId: string) => {
    setSwitcherOpen(false)
    if (!userId || profileId === activeProfileId) return

    setSwitching(true)
    const { error } = await supabase
      .from('users')
      .update({ active_profile_id: profileId })
      .eq('id', userId)

    if (error) {
      setSwitching(false)
      window.alert('No se pudo cambiar de perfil. Intenta de nuevo.')
      return
    }

    window.location.reload()
  }

  return (
    <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
      {showSwitcher && activeProfile && (
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setSwitcherOpen((v) => !v)}
            disabled={switching}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-blue-800 text-white text-sm font-medium hover:bg-blue-800/70 transition-colors disabled:opacity-60"
          >
            <span className="truncate">
              {switching ? 'Cambiando...' : activeProfile.full_name}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                switcherOpen ? 'rotate-180' : ''
              }`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {switcherOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setSwitcherOpen(false)}
              />
              <div className="absolute left-0 right-0 top-11 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1">
                {profiles?.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSwitch(p.id)}
                    className={`w-full text-left px-3 py-2 text-sm ${
                      p.id === activeProfileId
                        ? 'font-semibold text-blue-700 bg-blue-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {p.full_name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {links.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-700 text-white'
                : 'text-white/90 hover:bg-blue-800'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
