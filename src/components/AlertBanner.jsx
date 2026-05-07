function AlertBanner({ message, type = 'warn' }) {
  if (!message) return null

  const styles = {
    warn:   { bg: '#fff8ec', border: '#fde8b0', text: '#8a5c00', dot: '#f0a500' },
    danger: { bg: '#fff1f1', border: '#fcc',    text: '#991f1f', dot: '#e84040' },
  }
  const s = styles[type]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 16px',
      background: s.bg,
      borderBottom: `0.5px solid ${s.border}`,
      fontSize: 12,
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