import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

      if (result.error) throw result.error

      // signup: 이메일 확인이 필요한 프로젝트는 세션이 즉시 안 만들어짐
      if (mode === 'signup' && !result.data.session) {
        setInfo('가입 메일을 보냈어요. 메일함을 확인해 주세요.')
        setMode('signin')
        setLoading(false)
        return
      }

      navigate('/home', { replace: true })
    } catch (err) {
      console.error('인증 실패:', err)
      setError(translateAuthError(err))
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
        {/* 로고 */}
        <div style={{
          width: 56, height: 56,
          background: '#2ea84e',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="30" height="30" viewBox="0 0 26 26" fill="none">
            <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
              fill="#fff" opacity=".95"/>
            <line x1="13" y1="9" x2="13" y2="19" stroke="#2ea84e" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
              stroke="#2ea84e" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>팜-므파탈</div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
            {mode === 'signin' ? '로그인해 식물을 돌봐주세요' : '가입하고 시작해보세요'}
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={fieldStyle}
          />
          <input
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {loading
              ? (mode === 'signin' ? '로그인 중…' : '가입 중…')
              : (mode === 'signin' ? '로그인' : '가입하기')}
          </button>
        </form>

        <div style={{
          textAlign: 'center', marginTop: 16,
          fontSize: 12.5, color: '#666',
        }}>
          {mode === 'signin' ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            style={{
              background: 'none', border: 'none',
              color: '#2ea84e', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--ff)',
              fontSize: 12.5, padding: 0,
            }}
          >
            {mode === 'signin' ? '회원가입' : '로그인'}
          </button>
        </div>
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

function translateAuthError(err) {
  const msg = err?.message ?? ''
  if (/Invalid login credentials/i.test(msg)) return '이메일 또는 비밀번호가 올바르지 않아요.'
  if (/already registered/i.test(msg))         return '이미 가입된 이메일이에요.'
  if (/Password should be at least/i.test(msg)) return '비밀번호가 너무 짧아요. (6자 이상)'
  if (/Email rate limit/i.test(msg))            return '잠시 후 다시 시도해 주세요.'
  return msg || '인증에 실패했어요.'
}

export default Login
