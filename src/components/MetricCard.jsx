const tagStyle = {
  ok:   { background: '#ddf2e2', color: '#156b2e' },
  warn: { background: '#fff8ec', color: '#8a5c00' },
  bad:  { background: '#fff1f1', color: '#991f1f' },
}

function MetricCard({ label, value, unit, status, statusText, info, infoOpen, onInfoToggle, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#f8fdf9',
        border: '0.5px solid #ddf2e2',
        borderRadius: 12, padding: '10px 10px 9px',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11.5, fontWeight: 500, color: '#999', marginBottom: 4,
      }}>
        {label}
        {info && (
          <button
            onClick={(e) => { e.stopPropagation(); onInfoToggle?.() }}
            title={`${label} 단위 설명`}
            style={{
              width: 12, height: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '0.5px solid #b4e3be',
              background: infoOpen ? '#2ea84e' : '#f8fdf9',
              color: infoOpen ? '#fff' : '#2ea84e',
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
      <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 12.5, fontWeight: 400, color: '#aaa' }}>{unit}</span>
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
          background: '#1a1a1a', color: '#fff',
          fontSize: 12, lineHeight: 1.5,
          padding: '8px 10px', borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,.15)',
        }}>
          {info}
        </div>
      )}
    </div>
  )
}

export default MetricCard
