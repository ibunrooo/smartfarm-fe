const styles = {
  warn:   { bg: 'var(--warn-bg)',   border: 'var(--warn-bd)',   text: 'var(--warn-tx)',   dot: '#f0a500', label: '주의' },
  danger: { bg: 'var(--danger-bg)', border: 'var(--danger-bd)', text: 'var(--danger-tx)', dot: '#e84040', label: '긴급' },
}

function AlertBanner({ message, type = 'warn', variant = 'banner' }) {
  if (!message) return null
  const s = styles[type]

  if (variant === 'card') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '10px 13px',
        background: s.bg,
        border: `0.5px solid ${s.border}`,
        borderRadius: 10,
        fontSize: 13.5,
        color: s.text,
        fontFamily: 'var(--ff)',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: s.dot, flexShrink: 0,
        }} />
        <span style={{ fontWeight: 700 }}>{s.label}</span>
        <span style={{ opacity: .4 }}>·</span>
        <span>{message}</span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      background: s.bg,
      borderBottom: `0.5px solid ${s.border}`,
      fontSize: 13.5,
      color: s.text,
      fontFamily: 'var(--ff)',
    }}>
      <div style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: s.dot,
        flexShrink: 0,
      }} />
      <span>{message}</span>
    </div>
  )
}

export default AlertBanner
