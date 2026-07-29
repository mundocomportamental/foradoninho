'use client'

interface BarChartProps {
  data: { periodo: string; valor: number }[]
  color?: string
  formatLabel?: (periodo: string) => string
  height?: number
}

export default function BarChart({ data, color = '#33CCCC', formatLabel, height = 140 }: BarChartProps) {
  if (data.length === 0) {
    return <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Sem dados no período</div>
  }

  const max = Math.max(...data.map(d => d.valor), 1)
  const barWidth = 100 / data.length

  return (
    <div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block' }}>
        {data.map((d, i) => {
          const barH = (d.valor / max) * (height - 24)
          const x = i * barWidth
          return (
            <g key={i}>
              <rect
                x={x + barWidth * 0.15}
                y={height - 20 - barH}
                width={barWidth * 0.7}
                height={Math.max(barH, d.valor > 0 ? 1.5 : 0)}
                rx={1.5}
                fill={color}
                opacity={0.85}
              />
              <text
                x={x + barWidth / 2}
                y={height - 20 - barH - 4}
                fontSize={5.5}
                fill="rgba(255,255,255,0.7)"
                textAnchor="middle"
              >
                {d.valor > 0 ? d.valor : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ width: `${barWidth}%`, textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {formatLabel ? formatLabel(d.periodo) : d.periodo}
          </div>
        ))}
      </div>
    </div>
  )
}
