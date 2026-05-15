import UserMenu from './UserMenu'

function Header({ navItems, currentPath, navigate }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 52,
      padding: '0 20px',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '0.5px solid var(--bd-soft)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* 좌측: 로고 */}
      <button
        onClick={() => navigate('/home')}
        style={{
          display: 'flex', alignItems: 'center', gap: 9,
          padding: '4px 6px',
          marginLeft: -6,
          background: 'none',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          color: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5C5.7 2.5 4 4.3 4 6.6c0 1.4.7 2.6 1.8 3.4L5.3 13.5h5.4l-.5-3.5c1.1-.8 1.8-2 1.8-3.4 0-2.3-1.7-4.1-4-4.1z"
              stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
            <line x1="8" y1="6" x2="8" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </div>
        <span style={{
          fontSize: 14.5, fontWeight: 700, color: 'var(--tx-1)',
          letterSpacing: '-.01em',
        }}>
          팜-므파탈
        </span>
      </button>

      {/* 가운데: 네비 (데스크탑) */}
      <nav className="header-nav" style={{
        gap: 2,
        marginLeft: 24,
        alignItems: 'center',
      }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 11px',
                background: isActive ? 'var(--brand-soft)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: isActive ? 'var(--brand-strong)' : 'var(--tx-2)',
                fontSize: 13.5, fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'var(--ff)',
                transition: 'background .15s, color .15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--surface-2)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {item.icon}
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* 우측: 프로필 */}
      <div style={{ flex: 1 }} />
      <UserMenu />
    </header>
  )
}

export default Header
