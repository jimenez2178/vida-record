import Sparkline from '@/components/dashboard/Sparkline'
import { formatShortDate, timeAgo } from '@/lib/dates'
import {
  classifyIndicator,
  formatIndicatorValue,
  indicatorTypeLabels,
  type IndicatorReading,
  type IndicatorTone,
} from '@/lib/dashboard/indicators'

const toneStyles: Record<IndicatorTone, string> = {
  good: 'bg-emerald-100 text-emerald-800',
  warn: 'bg-amber-100 text-amber-800',
  bad: 'bg-red-100 text-red-800',
}

// Contenido de la tarjeta de indicadores. `readings` son lecturas de un mismo
// tipo, de la más reciente a la más antigua.
export default function IndicatorSummary({
  readings,
}: {
  readings: IndicatorReading[]
}) {
  const latest = readings[0]
  if (!latest) {
    return (
      <>
        <p className="mt-2 text-xl font-bold text-gray-900">Sin registros</p>
        <p className="text-sm font-semibold text-blue-700 mt-3">
          Registra tu primera medición →
        </p>
      </>
    )
  }

  const status = classifyIndicator(latest)
  const chronological = [...readings].reverse()
  const isPressure = latest.type === 'presion'
  const series = [
    {
      values: chronological
        .map((r) => r.value_primary)
        .filter((v): v is number => v !== null),
      className: 'text-blue-600',
    },
    ...(isPressure
      ? [
          {
            values: chronological
              .map((r) => r.value_secondary)
              .filter((v): v is number => v !== null),
            className: 'text-blue-300',
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-xl font-bold text-gray-900">
          {formatIndicatorValue(latest)}
        </p>
        {status && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${toneStyles[status.tone]}`}
          >
            {status.label}
          </span>
        )}
      </div>
      <p className="text-base font-medium text-gray-700 mt-1">
        {indicatorTypeLabels[latest.type] ?? latest.type}
      </p>
      <p className="text-sm text-gray-500">
        {formatShortDate(latest.measured_at)} · {timeAgo(latest.measured_at)}
      </p>
      {readings.length >= 2 && (
        <div className="mt-3">
          <Sparkline
            series={series}
            label={`Tendencia de las últimas ${readings.length} mediciones`}
          />
          <p className="text-xs text-gray-400 mt-1">
            Últimas {readings.length} mediciones
          </p>
        </div>
      )}
    </>
  )
}
