import { categoryDotColor } from '../data/eventLogs'

function EventLog({ logs, title = '이벤트 로그', showAllLink = true, onShowAll }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '0.5px solid var(--bd)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '9px 13px 8px',
        borderBottom: '0.5px solid var(--bd-soft)',
        fontSize: 14, fontWeight: 600, color: 'var(--tx-1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {title}
        {showAllLink && (
          <button
            onClick={onShowAll}
            style={{
              fontSize: 12.5, color: 'var(--brand)', fontWeight: 500,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0,
              fontFamily: 'var(--ff)',
            }}
          >
            전체 보기 →
          </button>
        )}
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{
          padding: '7px 13px',
          borderBottom: i < logs.length - 1 ? '0.5px solid var(--bd-soft)' : 'none',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: categoryDotColor[log.category],
            marginTop: 4, flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.4 }}>{log.text}</div>
            <div style={{ fontSize: 11.5, color: 'var(--tx-4)' }}>{log.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EventLog
