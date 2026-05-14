import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function UpdatePassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState(null)
  const [info, setInfo]         = useState(null)
  const [loading, setLoading]   = useState(false)
  const [ready, setReady]       = useState(false)

  // 메일 링크의 fragment 토큰이 처리되어 세션이 만들어지면 ready
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setReady(!!data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, sess) => {
      if (!mounted) return
      setReady(!!sess)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password })
      if (updateErr) throw updateErr
      setInfo('비밀번호가 변경되었어요. 잠시 후 홈으로 이동합니다.')
      setTimeout(() => navigate('/home', { replace: true }), 800)
    } catch (err) {
      console.error('비밀번호 변경 실패:', err)
      setError(err.message || '비밀번호 변경에 실패했어요.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      background: '#fafafa',
      fontFamily: 'var(--ff)',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        padding: 28,
        background: '#fff',
        border: '0.5px solid #e8e8e8',
        borderRadius: 16,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>비밀번호 재설정</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            새 비밀번호를 입력해 주세요
          </div>
        </div>

        {!ready ? (
          <div style={{ fontSize: 12.5, color: '#888', textAlign: 'center', padding: '20px 0' }}>
            인증 정보를 확인하는 중…
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="새 비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={fieldStyle}
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="새 비밀번호 확인"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={fieldStyle}
            />

            {error && (
              <div style={{
                padding: '10px 12px',
                background: '#fff1f1',
                border: '0.5px solid #fcc',
                borderRadius: 10,
                fontSize: 12.5, color: '#991f1f', lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}
            {info && (
              <div style={{
                padding: '10px 12px',
                background: '#f8fdf9',
                border: '0.5px solid #ddf2e2',
                borderRadius: 10,
                fontSize: 12.5, color: '#1e8a3c', lineHeight: 1.5,
              }}>
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                padding: '12px',
                background: loading ? '#cfe7d4' : '#2ea84e',
                color: '#fff',
                border: 'none', borderRadius: 10,
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--ff)',
              }}
            >
              {loading ? '변경 중…' : '비밀번호 변경'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  background: '#fff',
  border: '0.5px solid #ddd',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'var(--ff)',
  outline: 'none',
  color: '#1a1a1a',
  boxSizing: 'border-box',
}

export default UpdatePassword
