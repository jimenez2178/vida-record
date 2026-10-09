'use client'

import { useEffect, useState } from 'react'
import { InstallGuideModal } from '@/components/pwa/InstallGuide'
import {
  dismissInstallBanner,
  promptInstall,
  usePwaInstall,
} from '@/components/pwa/usePwaInstall'

export default function InstallPWA() {
  const { canPrompt, isInstalled, dismissed } = usePwaInstall()
  const [guideOpen, setGuideOpen] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  if (isInstalled) return null

  return (
    <>
      {!dismissed && (
        <div className="md:hidden fixed bottom-16 inset-x-0 z-40 px-4">
          <div className="bg-white rounded-t-2xl shadow-lg border border-gray-200 p-4 flex items-center gap-3">
            <p className="flex-1 text-sm text-gray-700 font-medium">
              📱 Instala VidaRecord en tu celular
            </p>
            <button
              type="button"
              onClick={canPrompt ? promptInstall : () => setGuideOpen(true)}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg px-3 py-2 transition-colors"
            >
              {canPrompt ? 'Instalar' : 'Ver cómo'}
            </button>
            <button
              type="button"
              onClick={dismissInstallBanner}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Cerrar"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      {guideOpen && <InstallGuideModal onClose={() => setGuideOpen(false)} />}
    </>
  )
}
