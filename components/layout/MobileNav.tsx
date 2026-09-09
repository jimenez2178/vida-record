'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Logo from '@/components/ui/Logo'
import SidebarNav from '@/components/layout/SidebarNav'

type NavLink = {
  href: string
  label: string
  icon: React.ReactNode
}

export default function MobileNav({
  links,
  plan,
}: {
  links: NavLink[]
  plan: 'free' | 'premium'
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-blue-900 flex items-center justify-between px-4">
        <Logo variant="full" theme="dark" iconClassName="h-8 w-8" textClassName="text-lg" />

        <div className="flex items-center gap-3">
          {plan === 'premium' ? (
            <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
              ⭐ Plan Premium
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-teal-600 text-white">
              Plan Gratuito
            </span>
          )}

          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-7 h-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
              />
            </svg>
          </button>
        </div>
      </header>

      <div
        role="presentation"
        onClick={() => setOpen(false)}
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-blue-900 flex flex-col transform transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Logo theme="dark" iconClassName="h-9 w-9" textClassName="text-xl" />

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <SidebarNav links={links} onLinkClick={() => setOpen(false)} />

        <div className="px-3 py-4 border-t border-blue-800">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold rounded-xl transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
