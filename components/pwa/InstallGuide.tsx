'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { promptInstall, usePwaInstall } from '@/components/pwa/usePwaInstall'

type Tab = 'android' | 'ios'

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="inline-block w-5 h-5 align-text-bottom text-blue-600"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15V3m0 0L8 7m4-4l4 4M6 11H5a1 1 0 00-1 1v8a1 1 0 001 1h14a1 1 0 001-1v-8a1 1 0 00-1-1h-1"
      />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block w-5 h-5 align-text-bottom text-gray-700"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

const steps: Record<Tab, React.ReactNode[]> = {
  android: [
    <>
      Abre esta página en <strong>Chrome</strong>.
    </>,
    <>
      Toca los <strong>tres puntos</strong> <DotsIcon /> arriba a la derecha.
    </>,
    <>
      Toca <strong>«Agregar a pantalla principal»</strong> o{' '}
      <strong>«Instalar app»</strong>.
    </>,
    <>
      Confirma tocando <strong>«Instalar»</strong>. El ícono de VidaRecord
      aparecerá en tu pantalla de inicio.
    </>,
  ],
  ios: [
    <>
      Abre esta página en <strong>Safari</strong>.
    </>,
    <>
      Toca el botón <strong>Compartir</strong> <ShareIcon /> en la barra de
      abajo. Si no lo ves, toca primero los tres puntos <strong>···</strong>.
    </>,
    <>
      Desliza hacia abajo y toca <strong>«Agregar a inicio»</strong> (también
      puede decir «Añadir a pantalla de inicio»).
    </>,
    <>
      Toca <strong>«Agregar»</strong> arriba a la derecha. El ícono de
      VidaRecord aparecerá en tu pantalla de inicio.
    </>,
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2
            id="install-guide-title"
            className="text-lg font-semibold text-gray-800"
          >
            📱 Instala VidaRecord en tu celular
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

        <div className="px-6 py-5 overflow-y-auto space-y-4">
          <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 leading-relaxed">
            <strong>No necesitas Play Store ni App Store.</strong> VidaRecord
            se instala directamente desde tu navegador, es gratis y toma menos
            de un minuto.
          </p>

          <div
            role="tablist"
            className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1"
          >
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
                className={`text-sm font-semibold rounded-lg py-2 transition-colors ${
                  tab === value
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'android' && canPrompt && (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstall}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg py-3 transition-colors"
              >
                Instalar ahora
              </button>
              <p className="text-xs text-gray-500 text-center">
                ¿No funcionó el botón? Sigue estos pasos:
              </p>
            </div>
          )}

          <ol className="space-y-3">
            {steps[tab].map((step, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-blue-700 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
            {tab === 'android'
              ? '¿Abriste el enlace desde WhatsApp, Instagram o Facebook? Ábrelo primero en Chrome para que aparezca la opción de instalar.'
              : '¿Abriste el enlace desde WhatsApp, Instagram o Facebook? Ábrelo primero en Safari para que aparezca la opción de instalar.'}
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg py-2.5 transition-colors"
          >
            Entendido
          </button>
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
