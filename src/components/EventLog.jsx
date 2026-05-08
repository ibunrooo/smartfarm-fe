import { categoryDotColor } from '../data/eventLogs'

function EventLog({ logs, title = '이벤트 로그', showAllLink = true, onShowAll }) {
  return (
    <div style={{
      background: '#fff', border: '0.5px solid #e8e8e8',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        padding: '9px 13px 8px',
        borderBottom: '0.5px solid #e8e8e8',
        fontSize: 14, fontWeight: 600, color: '#1a1a1a',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        {title}
        {showAllLink && (
          <button
            onClick={onShowAll}
            style={{
              fontSize: 12.5, color: '#2ea84e', fontWeight: 500,
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
          borderBottom: i < logs.length - 1 ? '0.5px solid #f0f0f0' : 'none',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: categoryDotColor[log.category],
            marginTop: 4, flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.4 }}>{log.text}</div>
            <div style={{ fontSize: 11.5, color: '#aaa' }}>{log.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default EventLog
