const tagStyle = {
  ok:   { background: 'var(--brand-tint)', color: 'var(--brand-strong)' },
  warn: { background: 'var(--warn-bg)',    color: 'var(--warn-tx)' },
  bad:  { background: 'var(--danger-bg)',  color: 'var(--danger-tx)' },
}

function MetricCard({ label, value, unit, status, statusText, info, infoOpen, onInfoToggle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 12, padding: '10px 10px 9px',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11.5, fontWeight: 500, color: 'var(--tx-3)', marginBottom: 4,
      }}>
        {label}
        {info && (
          <button
            onClick={(e) => { e.stopPropagation(); onInfoToggle?.() }}
            title={`${label} 단위 설명`}
            style={{
              width: 12, height: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '0.5px solid var(--brand-line)',
              background: infoOpen ? 'var(--brand)' : 'var(--surface)',
              color: infoOpen ? '#fff' : 'var(--brand)',
              borderRadius: '50%',
              fontSize: 8, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
              padding: 0,
              lineHeight: 1,
            }}
          >
            i
          </button>
        )}
      </div>
      <div style={{ fontSize: 19, fontWeight: 700, color: 'var(--tx-1)', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 12.5, fontWeight: 400, color: 'var(--tx-4)' }}>{unit}</span>
      </div>
      <div style={{
        display: 'inline-block', marginTop: 5,
        fontSize: 11, fontWeight: 600,
        padding: '2px 6px', borderRadius: 6,
        ...tagStyle[status],
      }}>
        {statusText}
      </div>

      {info && infoOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          marginTop: 6, zIndex: 5,
          background: 'var(--tx-1)', color: '#fff',
          fontSize: 12, lineHeight: 1.5,
          padding: '8px 10px', borderRadius: 8,
          boxShadow: 'var(--shadow-md)',
        }}>
          {info}
        </div>
      )}
    </div>
  )
}

export default MetricCard
