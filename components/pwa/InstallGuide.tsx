'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { promptInstall, usePwaInstall } from '@/components/pwa/usePwaInstall'

type Tab = 'android' | 'ios'

function StepIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 shrink-0"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const icons = {
  dots: (
    <StepIcon>
      <circle cx="12" cy="5" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </StepIcon>
  ),
  share: (
    <StepIcon>
      <path d="M12 15V3m0 0L8 7m4-4l4 4M7 11H6a1 1 0 00-1 1v8a1 1 0 001 1h12a1 1 0 001-1v-8a1 1 0 00-1-1h-1" />
    </StepIcon>
  ),
  download: (
    <StepIcon>
      <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 17v2a1 1 0 001 1h12a1 1 0 001-1v-2" />
    </StepIcon>
  ),
  plus: (
    <StepIcon>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 9v6m-3-3h6" />
    </StepIcon>
  ),
  phone: (
    <StepIcon>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 18h2" />
    </StepIcon>
  ),
}

const steps: Record<Tab, { text: React.ReactNode; icon: React.ReactNode }[]> = {
  android: [
    {
      text: (
        <>
          Abre VidaRecord en <strong>Chrome</strong> y toca los{' '}
          <strong>tres puntos (⋮)</strong> arriba a la derecha.
        </>
      ),
      icon: icons.dots,
    },
    {
      text: (
        <>
          Toca <strong>«Agregar a pantalla principal»</strong> o{' '}
          <strong>«Instalar app»</strong>.
        </>
      ),
      icon: icons.download,
    },
    {
      text: (
        <>
          Confirma con <strong>«Instalar»</strong>. El ícono aparecerá junto a
          tus otras apps.
        </>
      ),
      icon: icons.plus,
    },
  ],
  ios: [
    {
      text: (
        <>
          Abre VidaRecord en <strong>Safari</strong> y toca el botón{' '}
          <strong>Compartir</strong>. Si no lo ves, toca primero los tres
          puntos (···).
        </>
      ),
      icon: icons.share,
    },
    {
      text: (
        <>
          Desliza hacia abajo y toca <strong>«Agregar a inicio»</strong>{' '}
          (también puede decir «Añadir a pantalla de inicio»).
        </>
      ),
      icon: icons.plus,
    },
    {
      text: (
        <>
          Confirma con <strong>«Agregar»</strong>. El ícono aparecerá junto a
          tus otras apps.
        </>
      ),
      icon: icons.phone,
    },
  ],
}

export function InstallGuideModal({ onClose }: { onClose: () => void }) {
  const { canPrompt, platform } = usePwaInstall()
  const [selectedTab, setSelectedTab] = useState<Tab | null>(null)
  const tab = selectedTab ?? (platform === 'ios' ? 'ios' : 'android')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleInstall = async () => {
    await promptInstall()
    onClose()
  }

  // Se monta en <body> porque algunos botones viven dentro de contenedores
  // con `transform` (menú móvil), que rompen el `position: fixed`.
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-guide-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden text-left"
      >
        <div className="flex items-start justify-between gap-3 px-6 pt-6 shrink-0">
          <h2
            id="install-guide-title"
            className="text-xl font-bold text-gray-900"
          >
            Instala VidaRecord en tu celular
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
            aria-label="Cerrar"
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

        <div className="px-6 pt-3 pb-6 overflow-y-auto space-y-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            <strong className="text-gray-700">
              No necesitas Play Store ni App Store.
            </strong>{' '}
            Se instala desde tu navegador: tendrás la app en tu pantalla de
            inicio y abrirá a pantalla completa.
          </p>

          <div role="tablist" className="grid grid-cols-2 gap-2">
            {(
              [
                ['android', 'Android'],
                ['ios', 'iPhone / iPad'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setSelectedTab(value)}
                className={`font-semibold rounded-xl py-3 transition-colors ${
                  tab === value
                    ? 'bg-blue-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'android' && canPrompt && (
            <button
              type="button"
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-semibold rounded-xl py-3.5 transition-colors"
            >
              {icons.download}
              Instalar ahora
            </button>
          )}

          <ol className="space-y-4">
            {steps[tab].map((step, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 text-base text-gray-700 leading-snug">
                  {step.text}
                </p>
                <span className="text-blue-900">{step.icon}</span>
              </li>
            ))}
          </ol>

          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            ¿Abriste el enlace desde WhatsApp, Instagram o Facebook? Ábrelo
            primero en {tab === 'android' ? 'Chrome' : 'Safari'} para que
            aparezca la opción de instalar.
          </p>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function InstallGuideButton({
  className,
  children = '📱 Cómo instalar la app',
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { isInstalled } = usePwaInstall()
  const [open, setOpen] = useState(false)

  if (isInstalled) return null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && <InstallGuideModal onClose={() => setOpen(false)} />}
    </>
  )
}

export function InstallMenuItem() {
  return (
    <InstallGuideButton className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-left text-emerald-300 hover:bg-blue-800 transition-colors mb-1">
      {icons.phone}
      Instalar la app en mi celular
    </InstallGuideButton>
  )
}
