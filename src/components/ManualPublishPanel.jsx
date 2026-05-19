import { useState } from 'react'

const METRICS = [
  { key: 'temperature',  label: '온도',     unit: '°C',  min: -10,  max: 50,     step: 0.5,  decimals: 1 },
  { key: 'humidity',     label: '습도',     unit: '%',   min: 0,    max: 100,    step: 1,    decimals: 0 },
  { key: 'soilMoisture', label: '토양수분', unit: '%',   min: 0,    max: 100,    step: 1,    decimals: 0 },
  { key: 'lux',          label: '조도',     unit: 'lux', min: 0,    max: 20000,  step: 100,  decimals: 0 },
]

function ManualPublishPanel({ initialValues, plantType, onPublish, onStart, onStop, onClose }) {
  const [values, setValues] = useState(() => ({
    temperature:  Number(initialValues?.temperature  ?? 22),
    humidity:     Number(initialValues?.humidity     ?? 60),
    soilMoisture: Number(initialValues?.soilMoisture ?? 40),
    lux:          Number(initialValues?.lux          ?? 1000),
  }))
  const [busy, setBusy] = useState(null) // 'publish' | 'start' | 'stop' | null
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null) // { action, at }

  const setValue = (key, v) => setValues(prev => ({ ...prev, [key]: Number(v) }))

  const run = (action, fn, successLabel) => async () => {
    if (busy) return
    setBusy(action)
    setError(null)
    try {
      await fn()
      setStatus({ action: successLabel, at: new Date() })
    } catch (e) {
      setError(e?.message ?? '요청에 실패했어요.')
    } finally {
      setBusy(null)
    }
  }

  const handlePublish = run('publish', () => onPublish({ ...values, plantType }), '1회 발행')
  const handleStart   = run('start',   () => onStart({ ...values, plantType }),   '시뮬레이션 시작')
  const handleStop    = run('stop',    () => onStop(),                            '중지')

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={handleStart}
          disabled={!!busy}
          style={primaryButtonStyle(busy === 'start', !!busy)}
        >
          {busy === 'start' ? '시작 중…' : '시뮬레이션 시작'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handlePublish}
            disabled={!!busy}
            style={secondaryButtonStyle(busy === 'publish', !!busy)}
          >
            {busy === 'publish' ? '발행 중…' : '1회만'}
          </button>
          <button
            onClick={handleStop}
            disabled={!!busy}
            style={dangerButtonStyle(busy === 'stop', !!busy)}
          >
            {busy === 'stop' ? '중지 중…' : '중지'}
          </button>
        </div>
        {status && (
          <span style={{ fontSize: 11.5, color: 'var(--tx-3)', textAlign: 'right' }}>
            마지막 {status.action} {formatTime(status.at)}
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

function buttonStyle({ bg, color, border = 'none', active, disabled }) {
  return {
    flex: 1,
    padding: '11px',
    background: active ? 'var(--brand-tint)' : bg,
    border,
    borderRadius: 10,
    fontSize: 13.5, fontWeight: 700,
    color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--ff)',
    boxShadow: (disabled || active) ? 'none' : 'var(--shadow-xs)',
    opacity: disabled && !active ? 0.5 : 1,
  }
}
const primaryButtonStyle   = (active, disabled) => buttonStyle({ bg: 'var(--brand)',   color: '#fff',             active, disabled })
const secondaryButtonStyle = (active, disabled) => buttonStyle({ bg: 'var(--surface)', color: 'var(--tx-1)',      border: '0.5px solid var(--bd)',       active, disabled })
const dangerButtonStyle    = (active, disabled) => buttonStyle({ bg: 'var(--surface)', color: 'var(--danger-tx)', border: '0.5px solid var(--danger-bd)', active, disabled })

function formatTime(d) {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default ManualPublishPanel
