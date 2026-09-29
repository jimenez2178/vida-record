import Link from 'next/link'

export type DashboardDiagnosis = {
  id: string
  name: string
  description: string | null
  is_chronic: boolean
  diagnosed_at: string | null
}

const MAX_VISIBLE = 4

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function ActiveDiagnosesCard({
  diagnoses,
}: {
  diagnoses: DashboardDiagnosis[]
}) {
  const visible = diagnoses.slice(0, MAX_VISIBLE)

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-base font-bold text-blue-800">
          Diagnósticos activos
          {diagnoses.length > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-500">
              ({diagnoses.length})
            </span>
          )}
        </p>
        <Link
          href="/diagnosticos"
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          {diagnoses.length > 0 ? 'Ver todos →' : 'Agregar diagnóstico →'}
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="text-base text-gray-600">
          No tienes diagnósticos activos registrados.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {visible.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-gray-900">{d.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    d.is_chronic
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {d.is_chronic ? 'Crónico' : 'Agudo'}
                </span>
              </div>
              {d.diagnosed_at && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {formatDate(d.diagnosed_at)}
                </p>
              )}
              {d.description?.trim() ? (
                <p className="text-sm text-gray-700 mt-1.5 line-clamp-2">
                  {d.description}
                </p>
              ) : (
                <p className="text-sm italic text-gray-400 mt-1.5">
                  Sin descripción
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {diagnoses.length > MAX_VISIBLE && (
        <p className="text-sm text-gray-500 mt-3">
          y {diagnoses.length - MAX_VISIBLE} más
        </p>
      )}
    </section>
  )
}
