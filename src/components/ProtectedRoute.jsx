import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getBackendToken } from '../lib/authToken'

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  // 카카오 사용자는 Supabase 세션이 없고 BE JWT만 보유 — 별도 플래그로 추적
  const [hasBackendToken, setHasBackendToken] = useState(() => !!getBackendToken())
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setChecking(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return
      setSession(sess)
    })

    // BE 토큰은 다른 탭/로그아웃으로 바뀔 수 있으므로 storage 이벤트 구독
    const onStorage = (e) => {
      if (e.key === 'farm-me:beToken') setHasBackendToken(!!getBackendToken())
    }
    window.addEventListener('storage', onStorage)

    return () => {
      mounted = false
      subscription.unsubscribe()
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  if (checking) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#888', fontSize: 14, fontFamily: 'var(--ff)',
      }}>
        세션 확인 중…
      </div>
    )
  }
  if (!session && !hasBackendToken) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
