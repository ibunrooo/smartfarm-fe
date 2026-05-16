import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const tagStyle = {
  ok:   { background: 'var(--brand-tint)', color: 'var(--brand-strong)' },
  warn: { background: 'var(--warn-bg)',    color: 'var(--warn-tx)' },
  bad:  { background: 'var(--danger-bg)',  color: 'var(--danger-tx)' },
  idle: { background: 'var(--surface-2)',  color: 'var(--tx-3)' },
}

const chartColor = {
  ok:   '#4db866',
  warn: '#f0a500',
  bad:  '#e84040',
}

function SensorMetricCard({ id, label, value, unit, status, statusText, history, emptyText = '아직 시계열 데이터가 없어요' }) {
  const color = chartColor[status]
  const gradId = `sensor-grad-${id}`

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 14, padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 6,
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--tx-3)', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--tx-1)', lineHeight: 1 }}>
            {value}
            <span style={{ fontSize: 13.5, fontWeight: 400, color: 'var(--tx-4)', marginLeft: 1 }}>
              {unit}
            </span>
          </div>
        </div>
        <div style={{
          fontSize: 11.5, fontWeight: 600,
          padding: '3px 8px', borderRadius: 7,
          ...tagStyle[status],
        }}>
          {statusText}
        </div>
      </div>

      <div style={{ marginTop: 8, height: 70, marginLeft: -4, marginRight: -4 }}>
        {Array.isArray(history) && history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={`url(#${gradId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: 'var(--tx-4)',
          }}>
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}

export default SensorMetricCard
