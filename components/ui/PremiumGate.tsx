import Link from 'next/link'

export default function PremiumGate({
  featureName,
  description,
}: {
  featureName: string
  description: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-10 max-w-md mx-auto text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-xl font-bold text-gray-800 mb-2">
        Función exclusiva Premium
      </h1>
      <p className="text-sm font-medium text-gray-700 mb-1">{featureName}</p>
      <p className="text-sm text-gray-500 mb-6">{description}</p>
      <Link
        href="/configuracion"
        className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
      >
        Actualizar a Premium — $3.99/mes
      </Link>
    </div>
  )
}
