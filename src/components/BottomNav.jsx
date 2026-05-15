function BottomNav({ navItems, currentPath, navigate }) {
  return (
    <nav className="bottom-nav" style={{
      gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid var(--bd-soft)',
      padding: '8px 0 10px',
      flexShrink: 0,
    }}>
      {navItems.map((item) => {
        const isActive = currentPath === item.id
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? 'var(--brand)' : 'var(--tx-4)',
              padding: 0,
              transition: 'color .15s',
            }}
          >
            {item.icon}
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-strong)' : 'var(--tx-4)',
              fontFamily: 'var(--ff)',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                width: 4, height: 4,
                background: 'var(--brand)',
                borderRadius: '50%',
                marginTop: -1,
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
