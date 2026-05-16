import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function UserMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    let mounted = true
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setEmail(data.user?.email ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return
      setEmail(sess?.user?.email ?? null)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const handleLogout = async () => {
    setOpen(false)
    if (!window.confirm('로그아웃 하시겠어요?')) return
    await supabase.auth.signOut().catch(() => {})
    try {
      localStorage.removeItem('farm-me:greenhouseIds')
      localStorage.removeItem('farm-me:activeGreenhouseId')
    } catch { /* private mode 등 무시 */ }
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={email ?? '사용자'}
        style={{
          width: 32, height: 32,
          padding: 0,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          color: 'var(--tx-3)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--ff)',
          transition: 'color .15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--tx-2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--tx-3)'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <path d="M3.51135 23.3917C3.51135 25.4894 5.60904 25.4894 5.60904 25.4894H22.3906C22.3906 25.4894 24.4883 25.4894 24.4883 23.3917C24.4883 21.294 22.3906 15.001 13.9998 15.001C5.60904 15.001 3.51135 21.294 3.51135 23.3917Z" fill="currentColor"/>
          <path d="M18.2419 11.6555C17.1168 12.7806 15.5908 13.4127 13.9996 13.4127C12.4084 13.4127 10.8824 12.7806 9.75724 11.6555C8.6321 10.5304 8 9.00435 8 7.41316C8 5.82197 8.6321 4.29595 9.75724 3.17081C10.8824 2.04567 12.4084 1.41357 13.9996 1.41357C15.5908 1.41357 17.1168 2.04567 18.2419 3.17081C19.3671 4.29595 19.9992 5.82197 19.9992 7.41316C19.9992 9.00435 19.3671 10.5304 18.2419 11.6555Z" fill="currentColor"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 40, right: 0,
          minWidth: 200,
          background: 'var(--surface)',
          border: '0.5px solid var(--bd)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
          padding: 6,
          fontFamily: 'var(--ff)',
          zIndex: 50,
        }}>
          <div style={{
            padding: '8px 10px',
            fontSize: 11.5, color: 'var(--tx-3)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {email ?? '...'}
          </div>
          <div style={{ height: 0.5, background: 'var(--bd-soft)', margin: '4px 6px' }} />
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px 10px',
              background: 'none',
              border: 'none',
              borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              color: 'var(--danger-tx)',
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'var(--ff)',
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
