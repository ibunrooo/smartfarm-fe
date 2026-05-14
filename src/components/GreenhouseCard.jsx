function GreenhouseCard({ greenhouse, onClick }) {
  const { plant, weather } = greenhouse
  const theme = plant.theme ?? { main: '#2ea84e', accent: '#4db866' }
  const isLight = !!theme.textColor

  const txt       = theme.textColor ?? '#fff'
  const txtSub    = isLight ? hexA(theme.textColor, .55) : 'rgba(255,255,255,.65)'
  const chipBg    = isLight ? 'rgba(0,0,0,.06)'  : 'rgba(255,255,255,.18)'
  const chipBd    = isLight ? 'rgba(0,0,0,.10)'  : 'rgba(255,255,255,.25)'
  const iconBg    = isLight ? 'rgba(0,0,0,.06)'  : 'rgba(255,255,255,.18)'
  const statusDot = isLight ? '#2ea84e' : '#a8f0b2'
  const leafFill  = isLight ? theme.textColor : '#fff'
  const leafStroke = isLight ? `${theme.textColor}aa` : 'rgba(46,168,78,.8)'

  return (
    <div
      onClick={onClick}
      style={{
        background: theme.main, borderRadius: 14,
        padding: 14, display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        minHeight: 92,
      }}
    >
      <div style={{
        position: 'absolute', right: -18, top: -18,
        width: 90, height: 90,
        background: theme.accent, borderRadius: '50%', opacity: .35,
      }} />

      {/* 날씨 미니 — 데이터 있을 때만 */}
      {weather && weather.temp !== '-' && weather.summary !== '-' && (
        <div style={{
          position: 'absolute', right: 12, top: 10,
          display: 'flex', alignItems: 'center', gap: 5,
          background: chipBg,
          border: `0.5px solid ${chipBd}`,
          borderRadius: 18, padding: '3px 8px',
          fontSize: 12, color: txt, zIndex: 1,
        }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M3 6.5a2 2 0 011.7-2 2.5 2.5 0 014.7.6A1.8 1.8 0 019 8.5H4a1.5 1.5 0 01-1-2zM4.5 10l-.5 1M6 10l-.5 1M7.5 10l-.5 1"
              stroke={txt} strokeWidth="1" strokeLinecap="round" fill="none" opacity=".9"/>
          </svg>
          {weather.temp}° · {weather.summary}
        </div>
      )}

      {/* 식물 아이콘 */}
      <div style={{
        width: 48, height: 48,
        background: iconBg,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, zIndex: 1,
      }}>
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
            fill={leafFill} opacity=".85"/>
          <line x1="13" y1="9" x2="13" y2="19"
            stroke={leafStroke} strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
            stroke={leafStroke} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* 식물 정보 */}
      <div style={{ zIndex: 1, minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: 15, fontWeight: 700, color: txt,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {plant.name}
        </div>
        <div style={{ fontSize: 12.5, color: txtSub, marginTop: 2 }}>
          {plant.sub}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7,
          background: chipBg,
          border: `0.5px solid ${chipBd}`,
          borderRadius: 20, padding: '3px 9px',
          fontSize: 12, color: txt,
        }}>
          <div style={{ width: 5, height: 5, background: statusDot, borderRadius: '50%' }} />
          {plant.status}
        </div>
      </div>
    </div>
  )
}

function hexA(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default GreenhouseCard
