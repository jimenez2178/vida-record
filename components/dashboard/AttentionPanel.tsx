import Link from 'next/link'
import type { AttentionItem, AttentionLevel } from '@/lib/dashboard/attention'

const levelStyles: Record<
  AttentionLevel,
  { row: string; dot: string; cta: string }
> = {
  urgent: {
    row: 'bg-red-50 border-red-200',
    dot: 'bg-red-500',
    cta: 'text-red-700 hover:text-red-800',
  },
  warning: {
    row: 'bg-amber-50 border-amber-200',
    dot: 'bg-amber-500',
    cta: 'text-amber-800 hover:text-amber-900',
  },
  info: {
    row: 'bg-white border-gray-200',
    dot: 'bg-blue-500',
    cta: 'text-blue-700 hover:text-blue-800',
  },
}

export default function AttentionPanel({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <section className="mb-8 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-emerald-900">Todo al día</p>
          <p className="text-sm text-emerald-800">
            No hay nada pendiente en tu historial por ahora.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      <h2 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
        Requiere tu atención
        <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white">
          {items.length}
        </span>
      </h2>

      <ul className="space-y-2">
        {items.map((item) => {
          const styles = levelStyles[item.level]
          return (
            <li
              key={item.id}
              className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:gap-4 ${styles.row}`}
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-700">{item.detail}</p>
                </div>
              </div>
              <Link
                href={item.href}
                className={`shrink-0 self-end text-sm font-semibold sm:self-center ${styles.cta}`}
              >
                {item.cta} →
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
