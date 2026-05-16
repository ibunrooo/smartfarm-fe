import { useState } from 'react'

const METRICS = [
  { key: 'temperature',  label: '온도',     unit: '°C',  min: -10,  max: 50,     step: 0.5,  decimals: 1 },
  { key: 'humidity',     label: '습도',     unit: '%',   min: 0,    max: 100,    step: 1,    decimals: 0 },
  { key: 'soilMoisture', label: '토양수분', unit: '%',   min: 0,    max: 100,    step: 1,    decimals: 0 },
  { key: 'lux',          label: '조도',     unit: 'lux', min: 0,    max: 20000,  step: 100,  decimals: 0 },
]

function ManualPublishPanel({ initialValues, plantType, onPublish, onClose }) {
  const [values, setValues] = useState(() => ({
    temperature:  Number(initialValues?.temperature  ?? 22),
    humidity:     Number(initialValues?.humidity     ?? 60),
    soilMoisture: Number(initialValues?.soilMoisture ?? 40),
    lux:          Number(initialValues?.lux          ?? 1000),
  }))
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const [lastAt, setLastAt] = useState(null)

  const setValue = (key, v) => setValues(prev => ({ ...prev, [key]: Number(v) }))

  const handlePublish = async () => {
    if (publishing) return
    setPublishing(true)
    setError(null)
    try {
      await onPublish({ ...values, plantType })
      setLastAt(new Date())
    } catch (e) {
      setError(e?.message ?? '발행에 실패했어요.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 14,
      padding: 22,
      display: 'flex', flexDirection: 'column', gap: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)' }}>
            직접 시뮬레이션 해보기
          </div>
          <div style={{
            fontSize: 12, color: 'var(--tx-3)', marginTop: 8, lineHeight: 1.5,
            whiteSpace: 'pre-line',
          }}>
            {'원하는 값을 입력하여 시뮬레이션에 반영할 수 있어요.\n잠시 후에 입력한 값으로 그래프가 갱신돼요.'}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'transparent',
              border: 'none',
              color: 'var(--tx-3)',
              cursor: 'pointer',
              fontSize: 18, lineHeight: 1,
              fontFamily: 'var(--ff)',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {METRICS.map(m => (
          <SliderRow
            key={m.key}
            metric={m}
            value={values[m.key]}
            onChange={(v) => setValue(m.key, v)}
          />
        ))}
      </div>

      {error && (
        <div style={{
          padding: '8px 10px',
          background: 'var(--danger-bg)',
          border: '0.5px solid var(--danger-bd)',
          borderRadius: 8,
          fontSize: 12, color: 'var(--danger-tx)',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            flex: 1,
            padding: '11px',
            background: publishing ? 'var(--brand-tint)' : 'var(--brand)',
            border: 'none',
            borderRadius: 10,
            fontSize: 13.5, fontWeight: 700,
            color: '#fff',
            cursor: publishing ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ff)',
            boxShadow: publishing ? 'none' : 'var(--shadow-xs)',
          }}
        >
          {publishing ? '값 입력 중…' : '시뮬레이션 시작'}
        </button>
        {lastAt && (
          <span style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>
            마지막 발행 {formatTime(lastAt)}
          </span>
        )}
      </div>
    </div>
  )
}

function SliderRow({ metric, value, onChange }) {
  const display = value.toFixed(metric.decimals)
  const filledPct = ((value - metric.min) / (metric.max - metric.min)) * 100
  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--tx-3)' }}>
          {metric.label}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-3)' }}>
          {display}
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--tx-4)', marginLeft: 2 }}>
            {metric.unit}
          </span>
        </span>
      </div>
      <input
        type="range"
        className="sim-slider"
        min={metric.min}
        max={metric.max}
        step={metric.step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ '--filled-pct': `${filledPct}%` }}
      />
    </div>
  )
}

function formatTime(d) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default ManualPublishPanel
