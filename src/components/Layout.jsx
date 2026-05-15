import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname.replace('/', '') || 'home'

  const navItems = [
    {
      id: 'home', label: '홈', path: '/home',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
          <path d="M7.5 18V13h5v5"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'sensor', label: '센서', path: '/sensor',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="13" width="3" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="8.5" y="9" width="3" height="9" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <rect x="14" y="5" width="3" height="13" rx="1" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M4.5 10.5L8 7l4 3 4-5"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'ai', label: '리포트', path: '/ai',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M4 4h12a1 1 0 011 1v7a1 1 0 01-1 1H7l-3 3V5a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <circle cx="8" cy="8.5" r=".8" fill="currentColor"/>
          <circle cx="10" cy="8.5" r=".8" fill="currentColor"/>
          <circle cx="12" cy="8.5" r=".8" fill="currentColor"/>
        </svg>
      )
    },
    {
      id: 'analysis', label: '분석', path: '/analysis',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 7.5A1.5 1.5 0 014.5 6h.8L6.5 4h7l1.2 2h.8A1.5 1.5 0 0117 7.5v7A1.5 1.5 0 0115.5 16h-11A1.5 1.5 0 013 14.5v-7z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          <circle cx="10" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.3"/>
        </svg>
      )
    },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <Header navItems={navItems} currentPath={currentPath} navigate={navigate} />
      <div className="page-content" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </div>
      <BottomNav navItems={navItems} currentPath={currentPath} navigate={navigate} />
    </div>
  )
}

export default Layout
