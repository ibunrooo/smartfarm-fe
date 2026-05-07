function GreenhouseCard({ greenhouse, onClick }) {
  const { plant, weather } = greenhouse

  return (
    <div
      onClick={onClick}
      style={{
        background: '#2ea84e', borderRadius: 14,
        padding: 14, display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 92,
      }}
    >
      <div style={{
        position: 'absolute', right: -18, top: -18,
        width: 90, height: 90,
        background: '#4db866', borderRadius: '50%', opacity: .35,
      }} />

      {/* 날씨 미니 */}
      <div style={{
        position: 'absolute', right: 12, top: 10,
        display: 'flex', alignItems: 'center', gap: 5,
        background: 'rgba(255,255,255,.18)',
        border: '0.5px solid rgba(255,255,255,.22)',
        borderRadius: 18, padding: '3px 8px',
        fontSize: 10.5, color: '#fff', zIndex: 1,
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M3 6.5a2 2 0 011.7-2 2.5 2.5 0 014.7.6A1.8 1.8 0 019 8.5H4a1.5 1.5 0 01-1-2zM4.5 10l-.5 1M6 10l-.5 1M7.5 10l-.5 1"
            stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".9"/>
        </svg>
        {weather.temp}° · {weather.summary}
      </div>

      {/* 식물 아이콘 */}
      <div style={{
        width: 48, height: 48,
        background: 'rgba(255,255,255,.18)',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 1,
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
            fill="white" opacity=".85"/>
          <line x1="13" y1="9" x2="13" y2="19"
            stroke="rgba(46,168,78,.8)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
            stroke="rgba(46,168,78,.8)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* 식물 정보 */}
      <div style={{ zIndex: 1, minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: '#fff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {plant.name}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>
          {plant.sub}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7,
          background: 'rgba(255,255,255,.15)',
          border: '0.5px solid rgba(255,255,255,.25)',
          borderRadius: 20, padding: '3px 9px',
          fontSize: 10.5, color: '#fff',
        }}>
          <div style={{ width: 5, height: 5, background: '#a8f0b2', borderRadius: '50%' }} />
          {plant.status}
        </div>
      </div>
    </div>
  )
}

export default GreenhouseCard
