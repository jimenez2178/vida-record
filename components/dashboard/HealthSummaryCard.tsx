import Link from 'next/link'

export type ProfileCompleteness = {
  percent: number
  missing: string[]
}

export default function HealthSummaryCard({
  completeness,
  profileHref,
  isPremium,
}: {
  completeness: ProfileCompleteness
  profileHref: string
  isPremium: boolean
}) {
  const { percent, missing } = completeness
  const barColor =
    percent === 100 ? 'bg-green-500' : percent >= 60 ? 'bg-teal-500' : 'bg-amber-500'

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <p className="text-base font-bold text-teal-800">Tu resumen médico</p>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-gray-700">Perfil completo</p>
          <p className="text-sm font-bold text-gray-900">{percent}%</p>
        </div>
        <div
          className="mt-1.5 h-2 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Perfil completo"
        >
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
        </div>
        {missing.length > 0 ? (
          <p className="text-sm text-gray-600 mt-2">
            Falta: {missing.join(', ')}.{' '}
            <Link
              href={profileHref}
              className="font-semibold text-teal-700 hover:text-teal-800"
            >
              Completar
            </Link>
          </p>
        ) : (
          <p className="text-sm text-gray-600 mt-2">
            Tu perfil tiene todo lo que un médico necesita saber.
          </p>
        )}
      </div>

      <Link
        href="/resumen-pdf"
        className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
      >
        📄 Resumen PDF para tu médico
        {!isPremium && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">Premium</span>
        )}
      </Link>
    </section>
  )
}
