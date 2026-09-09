import Link from 'next/link'

type Feature = 'appointments' | 'medications' | 'studies'

const messages: Record<Feature, string> = {
  appointments: 'Alcanzaste el límite de 5 consultas en el plan gratuito.',
  medications: 'Alcanzaste el límite de 5 medicamentos en el plan gratuito.',
  studies: 'Alcanzaste el límite de 5 documentos en el plan gratuito.',
}

export default function FreeLimitBanner({ feature }: { feature: Feature }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-2">
        <span className="text-lg leading-none">🔒</span>
        <div>
          <p className="text-sm font-medium text-amber-800">
            {messages[feature]}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            El plan Premium no tiene límites
          </p>
        </div>
      </div>

      <Link
        href="/configuracion"
        className="shrink-0 inline-flex items-center justify-center bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold rounded-full px-3 py-1.5 transition-colors"
      >
        ⭐ Pasar a Premium
      </Link>
    </div>
  )
}
