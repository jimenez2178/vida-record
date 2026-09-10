import Link from 'next/link'

export default function PremiumTopBanner() {
  return (
    <div className="bg-orange-400 text-white px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-1.5 sm:gap-3 text-center shrink-0">
      <p className="text-sm font-medium">
        ⭐ Desbloquea todo el potencial de la app con Premium
      </p>
      <Link
        href="/configuracion"
        className="shrink-0 inline-flex items-center justify-center bg-white text-orange-600 hover:bg-orange-50 text-xs font-semibold rounded-full px-3 py-1 transition-colors"
      >
        Pasar a Premium
      </Link>
    </div>
  )
}
