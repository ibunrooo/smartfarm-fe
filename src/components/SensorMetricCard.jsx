import { AreaChart, Area, ResponsiveContainer } from 'recharts'

const tagStyle = {
  ok:   { background: '#ddf2e2', color: '#156b2e' },
  warn: { background: '#fff8ec', color: '#8a5c00' },
  bad:  { background: '#fff1f1', color: '#991f1f' },
}

const chartColor = {
  ok:   '#4db866',
  warn: '#f0a500',
  bad:  '#e84040',
}

function SensorMetricCard({ id, label, value, unit, status, statusText, history }) {
  const color = chartColor[status]
  const gradId = `sensor-grad-${id}`

  return (
    <div style={{
      background: '#f8fdf9',
      border: '0.5px solid #ddf2e2',
      borderRadius: 14, padding: '12px 14px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 6,
      }}>
        <div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: '#888', marginBottom: 4 }}>
            {label}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
            {value}
            <span style={{ fontSize: 12, fontWeight: 400, color: '#aaa', marginLeft: 1 }}>
              {unit}
            </span>
          </div>
        </div>
        <div style={{
          fontSize: 10, fontWeight: 600,
          padding: '3px 8px', borderRadius: 7,
          ...tagStyle[status],
        }}>
          {statusText}
        </div>
      </div>

      <div style={{ marginTop: 8, height: 70, marginLeft: -4, marginRight: -4 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.6}
              fill={`url(#${gradId})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SensorMetricCard
