import { useEffect, useRef, useState } from 'react'

const METRIC_DEFS = [
  { key: 'temp',     label: '온도', unit: '°C' },
  { key: 'humidity', label: '습도', unit: '%'  },
  { key: 'soil',     label: '토양', unit: '%'  },
  { key: 'lux',      label: '조도', unit: 'lx' },
]

// 센서 페이지 statusFor와 동일한 기준 — 색만 결정용
function statusFor(key, value) {
  if (value == null) return 'idle'
  if (key === 'temp') {
    if (value >= 35 || value <= 5)  return 'bad'
    if (value >= 30 || value <= 10) return 'warn'
    return 'ok'
  }
  if (key === 'humidity') {
    if (value >= 80 || value <= 25) return 'bad'
    if (value >= 70 || value <= 35) return 'warn'
    return 'ok'
  }
  if (key === 'soil') {
    if (value <= 20)                return 'bad'
    if (value <= 30 || value >= 75) return 'warn'
    return 'ok'
  }
  if (key === 'lux') {
    if (value <= 100)               return 'bad'
    if (value <= 500)               return 'warn'
    return 'ok'
  }
  return 'ok'
}

const STATUS_COLOR = {
  ok:   { bg: 'var(--brand-soft)',  bd: 'var(--brand-line)', dot: 'var(--brand)',     fg: 'var(--brand-strong)' },
  warn: { bg: 'var(--warn-bg)',     bd: 'var(--warn-bd)',    dot: 'var(--warn-tx)',   fg: 'var(--warn-tx)' },
  bad:  { bg: 'var(--danger-bg)',   bd: 'var(--danger-bd)',  dot: 'var(--danger-tx)', fg: 'var(--danger-tx)' },
  idle: { bg: 'var(--surface-2)',   bd: 'var(--bd-soft)',    dot: 'var(--tx-4)',      fg: 'var(--tx-3)' },
}

function aggregateStatus(latest) {
  if (!latest) return { kind: 'idle',  label: '데이터 대기 중' }
  const statuses = METRIC_DEFS.map(m => statusFor(m.key, latest[m.key]))
  if (statuses.includes('bad'))  return { kind: 'bad',  label: '위험 상태' }
  if (statuses.includes('warn')) return { kind: 'warn', label: '주의 필요' }
  if (statuses.every(s => s === 'idle')) return { kind: 'idle', label: '데이터 대기 중' }
  return { kind: 'ok', label: '정상 운영 중' }
}

function GreenhouseCard({ greenhouse, onClick, onEdit, onDelete }) {
  const {
    plantName, plantTheme,
    locationLabel, cityLabel, daysSince, modeLabel,
    latest,
  } = greenhouse

  const status = aggregateStatus(latest)
  const statusStyle = STATUS_COLOR[status.kind]

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        boxShadow: 'var(--shadow-xs)',
        borderRadius: 14,
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      {/* 헤더: 식물명 + 메뉴 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 9, height: 9, borderRadius: '50%',
          background: plantTheme?.main ?? 'var(--brand)',
          flexShrink: 0,
        }} />
        <div style={{
          flex: 1, minWidth: 0,
          fontSize: 16, fontWeight: 700, color: 'var(--tx-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {plantName}
        </div>
        {(onEdit || onDelete) && (
          <KebabMenu onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>

      {/* 메타 정보 */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6,
        fontSize: 12.5, color: 'var(--tx-3)',
      }}>
        <span>{locationLabel}</span>
        <Dot />
        <span>{cityLabel}</span>
        <Dot />
        <span>등록 {daysSince}일차</span>
        <Dot />
        <span>{modeLabel}</span>
      </div>

      {/* 메트릭 4개 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 6,
      }}>
        {METRIC_DEFS.map(m => {
          const value = latest?.[m.key]
          const s = statusFor(m.key, value)
          const c = STATUS_COLOR[s]
          return (
            <div key={m.key} style={{
              padding: '8px 6px',
              background: c.bg,
              border: `0.5px solid ${c.bd}`,
              borderRadius: 9,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 2,
            }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: c.fg, opacity: .8 }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 13.5, fontWeight: 700,
                color: value == null ? c.fg : 'var(--tx-1)',
              }}>
                {value == null ? '-' : `${formatValue(m.key, value)}${m.unit}`}
              </div>
            </div>
          )
        })}
      </div>

      {/* 상태 칩 */}
      <div style={{
        display: 'inline-flex', alignSelf: 'flex-start',
        alignItems: 'center', gap: 6,
        padding: '4px 10px', borderRadius: 20,
        background: statusStyle.bg,
        border: `0.5px solid ${statusStyle.bd}`,
        fontSize: 12, fontWeight: 700,
        color: statusStyle.fg,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: statusStyle.dot,
        }} />
        {status.label}
      </div>
    </div>
  )
}

function formatValue(key, v) {
  if (key === 'lux') return Math.round(v)
  return Math.round(v * 10) / 10
}

function Dot() {
  return <span style={{ opacity: .4 }}>·</span>
}

function KebabMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const stop = (e) => e.stopPropagation()

  return (
    <div ref={ref} onClick={stop} style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        title="메뉴"
        aria-label="메뉴 열기"
        style={{
          width: 28, height: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? 'var(--surface-2)' : 'transparent',
          border: 'none',
          borderRadius: 8,
          color: 'var(--tx-3)',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--ff)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="3" cy="7" r="1.3" fill="currentColor"/>
          <circle cx="7" cy="7" r="1.3" fill="currentColor"/>
          <circle cx="11" cy="7" r="1.3" fill="currentColor"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 32, right: 0,
          minWidth: 130,
          background: 'var(--surface)',
          border: '0.5px solid var(--bd)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-md)',
          padding: 4,
          display: 'flex', flexDirection: 'column',
          zIndex: 10,
        }}>
          {onEdit && (
            <MenuItem onClick={() => { setOpen(false); onEdit() }}>
              정보 수정
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem onClick={() => { setOpen(false); onDelete() }} danger>
              삭제
            </MenuItem>
          )}
        </div>
      )}
    </div>
  )
}

function MenuItem({ onClick, danger, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 10px',
        background: 'transparent',
        border: 'none',
        borderRadius: 7,
        fontSize: 13.5, fontWeight: 500,
        color: danger ? 'var(--danger-tx)' : 'var(--tx-1)',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--ff)',
      }}
    >
      {children}
    </button>
  )
}

export default GreenhouseCard
