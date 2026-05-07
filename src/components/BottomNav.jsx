function BottomNav({ navItems, currentPath, navigate }) {
  return (
    <nav className="bottom-nav" style={{
      gridTemplateColumns: `repeat(${navItems.length}, 1fr)`,
      background: '#fff',
      borderTop: '0.5px solid #e8e8e8',
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
              color: isActive ? '#2ea84e' : '#bbb',
              padding: 0,
            }}
          >
            {item.icon}
            <span style={{
              fontSize: 9,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#1e8a3c' : '#bbb',
              fontFamily: 'var(--ff)',
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                width: 4, height: 4,
                background: '#2ea84e',
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