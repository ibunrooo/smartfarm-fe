function GreenhouseCard({ greenhouse, onClick, onDelete }) {
  const { plant, weather } = greenhouse
  const theme = plant.theme ?? { main: '#2ea84e', accent: '#4db866' }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.()
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        boxShadow: 'var(--shadow-xs)',
        borderRadius: 14,
        padding: 14, display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 92,
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      {/* 우측 상단: 삭제 버튼 + 날씨 미니 */}
      <div style={{
        position: 'absolute', right: 10, top: 8,
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {weather && weather.temp !== '-' && weather.summary !== '-' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'var(--surface-2)',
            border: '0.5px solid var(--bd-soft)',
            borderRadius: 18, padding: '3px 8px',
            fontSize: 12, color: 'var(--tx-2)',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M3 6.5a2 2 0 011.7-2 2.5 2.5 0 014.7.6A1.8 1.8 0 019 8.5H4a1.5 1.5 0 01-1-2zM4.5 10l-.5 1M6 10l-.5 1M7.5 10l-.5 1"
                stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".7"/>
            </svg>
            {weather.temp}° · {weather.summary}
          </div>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            title="식물 삭제"
            aria-label="식물 삭제"
            style={{
              width: 24, height: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--surface-2)',
              border: '0.5px solid var(--bd-soft)',
              borderRadius: 8,
              color: 'var(--tx-3)',
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--ff)',
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M3 3l6 6M9 3l-6 6"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* 식물 아이콘 — plant theme 컬러는 여기에만 한정 */}
      <div style={{
        width: 44, height: 44,
        background: 'var(--brand-soft)',
        border: '0.5px solid var(--brand-line)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        color: theme.main,
      }}>
        <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
          <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
            stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
          <line x1="13" y1="9" x2="13" y2="19"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/>
          <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
            stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity=".7"/>
        </svg>
      </div>

      {/* 식물 정보 */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: 'var(--tx-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {plant.name}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 2 }}>
          {plant.sub}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          borderRadius: 20, padding: '3px 9px',
          fontSize: 11.5, color: 'var(--brand-strong)', fontWeight: 600,
        }}>
          <div style={{ width: 5, height: 5, background: 'var(--brand)', borderRadius: '50%' }} />
          {plant.status}
        </div>
      </div>
    </div>
  )
}

export default GreenhouseCard
