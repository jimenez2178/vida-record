'use client'

import { useRouter } from 'next/navigation'

export default function NavbarTop({ plan }: { plan: 'free' | 'premium' }) {
  const router = useRouter()

  return (
    <header className="hidden md:flex h-14 bg-white shadow-sm items-center justify-end px-4 md:px-8 gap-3 shrink-0">
      {plan === 'premium' ? (
        <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          ⭐ Plan Premium
        </span>
      ) : (
        <>
          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-teal-600 text-white">
            Plan Gratuito
          </span>
          <button
            type="button"
            onClick={() => router.push('/configuracion')}
            className="bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
          >
            ⭐ Pasar a Premium
          </button>
        </>
      )}
    </header>
  )
}
