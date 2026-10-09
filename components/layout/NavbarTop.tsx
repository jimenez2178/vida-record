'use client'

import { useRouter } from 'next/navigation'
import InstallGuideButton from '@/components/pwa/InstallGuide'

export default function NavbarTop({ plan }: { plan: 'free' | 'premium' }) {
  const router = useRouter()

  return (
    <header className="hidden md:flex h-14 bg-white shadow-sm items-center justify-end px-4 md:px-8 gap-3 shrink-0">
      <InstallGuideButton className="mr-auto text-xs font-medium text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5 transition-colors" />
      {plan === 'premium' ? (
        <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          ⭐ Plan Premium
        </span>
      ) : (
        <>
          <span className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white">
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
