function Sidebar({ navItems, currentPath, navigate }) {
  return (
    <aside className="sidebar" style={{
      width: 54,
      background: '#fff',
      borderRight: '0.5px solid #e8e8e8',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '14px 0 12px',
      gap: 4,
      flexShrink: 0,
    }}>

      {/* 로고 */}
      <div style={{
        width: 30, height: 30,
        background: '#2ea84e',
        borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2C5.5 2 3.5 4 3.5 6.5c0 1.6.7 3 1.9 3.9L5 14h6l-.4-3.6c1.2-.9 1.9-2.3 1.9-3.9C12.5 4 10.5 2 8 2z"
            fill="white" opacity=".9"/>
          <line x1="8" y1="5" x2="8" y2="12" stroke="rgba(46,168,78,.9)" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M6 8c0 0 .9-1.2 2-1.2S10 8 10 8"
            stroke="rgba(46,168,78,.9)" strokeWidth="1" strokeLinecap="round" fill="none"/>
        </svg>
      </div>

      {/* 네비 아이템 */}
      {navItems.map((item) => {
        const isActive = currentPath === item.id
        return (
          <button
            key={item.id}
            className="nav-btn"
            onClick={() => navigate(item.path)}
            title={item.label}
            style={{
              width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10,
              border: 'none',
              background: isActive ? '#f2faf3' : 'none',
              cursor: 'pointer',
              color: isActive ? '#2ea84e' : '#aaa',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            {isActive && (
              <div style={{
                position: 'absolute',
                left: -1, top: 8, bottom: 8,
                width: 3,
                background: '#2ea84e',
                borderRadius: '0 3px 3px 0',
              }} />
            )}
            {item.icon}
          </button>
        )
      })}

      <div style={{ flex: 1 }} />
    </aside>
  )
}

export default Sidebar