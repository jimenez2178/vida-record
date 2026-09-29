const WIDTH = 120
const HEIGHT = 36
const PAD = 3

// Mini gráfica de tendencia. Cada serie es una lista de valores en orden
// cronológico (de la más antigua a la más reciente).
export default function Sparkline({
  series,
  label,
}: {
  series: { values: number[]; className: string }[]
  label: string
}) {
  const all = series.flatMap((s) => s.values)
  if (all.length === 0) return null

  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1

  const toPoints = (values: number[]) =>
    values
      .map((v, i) => {
        const x =
          values.length === 1
            ? WIDTH / 2
            : PAD + (i / (values.length - 1)) * (WIDTH - PAD * 2)
        const y = HEIGHT - PAD - ((v - min) / range) * (HEIGHT - PAD * 2)
        return [x, y] as const
      })

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-9 w-full overflow-visible"
      role="img"
      aria-label={label}
    >
      {series.map((s, index) => {
        const points = toPoints(s.values)
        const last = points[points.length - 1]
        return (
          <g key={index} className={s.className}>
            <polyline
              points={points.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {last && <circle cx={last[0]} cy={last[1]} r={2.5} fill="currentColor" />}
          </g>
        )
      })}
    </svg>
  )
}
