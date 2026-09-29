import Link from 'next/link'
import { timeAgo } from '@/lib/dashboard/dates'

export type ActivityKind =
  | 'consulta'
  | 'medicamento'
  | 'estudio'
  | 'diagnostico'
  | 'medicion'

export type ActivityItem = {
  id: string
  kind: ActivityKind
  title: string
  createdAt: string
}

const kindConfig: Record<
  ActivityKind,
  { label: string; href: string; dot: string }
> = {
  consulta: { label: 'Consulta', href: '/citas', dot: 'bg-blue-500' },
  medicamento: { label: 'Medicamento', href: '/medicamentos', dot: 'bg-green-500' },
  estudio: { label: 'Estudio', href: '/estudios', dot: 'bg-purple-500' },
  diagnostico: { label: 'Diagnóstico', href: '/diagnosticos', dot: 'bg-amber-500' },
  medicion: { label: 'Medición', href: '/indicadores', dot: 'bg-pink-500' },
}

export default function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-base font-bold text-blue-800">Actividad reciente</p>
        <Link
          href="/historial"
          className="text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          Historial →
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-base text-gray-600">
          Aún no has registrado nada. Usa las acciones rápidas para empezar.
        </p>
      ) : (
        <ol className="relative space-y-4 before:absolute before:left-[4px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">
          {items.map((item) => {
            const config = kindConfig[item.kind]
            return (
              <li key={`${item.kind}-${item.id}`} className="relative pl-6">
                <span
                  className={`absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${config.dot}`}
                  aria-hidden="true"
                />
                <Link href={config.href} className="group block">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {config.label} · {timeAgo(item.createdAt)}
                  </p>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 truncate">
                    {item.title}
                  </p>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
