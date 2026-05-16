import UserMenu from './UserMenu'
import logo from '../assets/logo.png'

function Header({ navItems, currentPath, navigate }) {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      height: 64,
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
        aria-label="홈으로"
        style={{
          display: 'flex', alignItems: 'center',
          padding: '4px 6px',
          marginLeft: -6,
          background: 'none',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        <img
          src={logo}
          alt="팜-므파탈"
          style={{ height: 60, width: 'auto', display: 'block' }}
        />
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
