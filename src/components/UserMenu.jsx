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

  const initial = email?.[0]?.toUpperCase() ?? '?'

  return (
    <div ref={ref} style={{
      position: 'absolute',
      top: 12, right: 12,
      zIndex: 50,
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        title={email ?? '사용자'}
        style={{
          width: 36, height: 36,
          borderRadius: '50%',
          background: '#2ea84e',
          border: 'none',
          color: '#fff',
          fontSize: 14, fontWeight: 700,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--ff)',
          boxShadow: '0 1px 4px rgba(0,0,0,.1)',
        }}
      >
        {initial}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 42, right: 0,
          minWidth: 200,
          background: '#fff',
          border: '0.5px solid #e8e8e8',
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,.08)',
          padding: 6,
          fontFamily: 'var(--ff)',
        }}>
          <div style={{
            padding: '8px 10px',
            fontSize: 11.5, color: '#666',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {email ?? '...'}
          </div>
          <div style={{ height: 0.5, background: '#eee', margin: '4px 6px' }} />
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '9px 10px',
              background: 'none',
              border: 'none',
              borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              color: '#991f1f',
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
