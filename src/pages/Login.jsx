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

  const handleOAuth = (provider, label) => async () => {
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/home`,
        },
      })
      if (oauthErr) throw oauthErr
      // 성공 시 브라우저가 자동으로 provider 페이지로 리다이렉트됩니다.
    } catch (err) {
      console.error(`${label} 로그인 실패:`, err)
      setError(err.message || `${label} 로그인을 시작하지 못했어요.`)
      setLoading(false)
    }
  }

  const handleGoogle = handleOAuth('google', 'Google')
  const handleKakao  = handleOAuth('kakao',  'Kakao')

  const resendConfirmation = async () => {
    if (loading) return
    if (!email) {
      setError('이메일을 먼저 입력해주세요.')
      return
    }
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { error: resendErr } = await supabase.auth.resend({ type: 'signup', email })
      if (resendErr) throw resendErr
      setInfo('확인 메일을 다시 보냈어요. 메일함을 확인해 주세요.')
    } catch (err) {
      console.error('재전송 실패:', err)
      setError(err.message || '메일 재전송에 실패했어요.')
    }
    setLoading(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (loading) return
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (mode === 'reset') {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        })
        if (resetErr) throw resetErr
        setInfo('재설정 메일을 보냈어요. 메일함을 확인해 주세요.')
        setMode('signin')
        setLoading(false)
        return
      }

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
      background: 'var(--bg)',
      fontFamily: 'var(--ff)',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        padding: 28,
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* 로고 */}
        <div style={{
          width: 56, height: 56,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          color: 'var(--brand)',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
        }}>
          <svg width="30" height="30" viewBox="0 0 26 26" fill="none">
            <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
              stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
            <line x1="13" y1="9" x2="13" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/>
            <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
              stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity=".7"/>
          </svg>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--tx-1)' }}>팜-므파탈</div>
          <div style={{ fontSize: 13, color: 'var(--tx-3)', marginTop: 4 }}>
            {mode === 'signin' ? '로그인해 식물을 돌봐주세요'
              : mode === 'signup' ? '가입하고 시작해보세요'
              : '비밀번호 재설정 메일을 보내드릴게요'}
          </div>
        </div>

        {mode !== 'reset' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: 'var(--surface)',
              border: '0.5px solid var(--bd)',
              borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: 'var(--tx-1)',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <GoogleIcon />
            Google로 계속하기
          </button>

          <button
            type="button"
            onClick={handleKakao}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              background: '#FEE500',
              border: 'none',
              borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: '#1a1a1a',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <KakaoIcon />
            카카오로 계속하기
          </button>
        </div>
        )}

        {mode !== 'reset' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            marginBottom: 14,
          }}>
            <div style={{ flex: 1, height: 0.5, background: 'var(--bd)' }} />
            <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>또는 이메일로</span>
            <div style={{ flex: 1, height: 0.5, background: 'var(--bd)' }} />
          </div>
        )}

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
          {mode !== 'reset' && (
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
          )}

          {error && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--danger-bg)',
              border: '0.5px solid var(--danger-bd)',
              borderRadius: 10,
              fontSize: 12.5, color: 'var(--danger-tx)', lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}
          {info && (
            <div style={{
              padding: '10px 12px',
              background: 'var(--brand-soft)',
              border: '0.5px solid var(--brand-line)',
              borderRadius: 10,
              fontSize: 12.5, color: 'var(--brand-strong)', lineHeight: 1.5,
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
              background: loading ? 'var(--brand-tint)' : 'var(--brand)',
              color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff)',
              boxShadow: loading ? 'none' : 'var(--shadow-xs)',
            }}
          >
            {loading
              ? (mode === 'signin' ? '로그인 중…' : mode === 'signup' ? '가입 중…' : '메일 보내는 중…')
              : (mode === 'signin' ? '로그인' : mode === 'signup' ? '가입하기' : '재설정 메일 보내기')}
          </button>
        </form>

        {mode === 'signin' && (
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 12, fontSize: 12, color: 'var(--tx-3)',
          }}>
            <span>
              메일 못 받으셨나요?{' '}
              <button
                type="button"
                onClick={resendConfirmation}
                disabled={loading}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--brand)', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--ff)',
                  fontSize: 12, padding: 0,
                  opacity: loading ? 0.5 : 1,
                }}
              >
                재전송
              </button>
            </span>
            <button
              type="button"
              onClick={() => {
                setMode('reset')
                setError(null)
                setInfo(null)
              }}
              style={{
                background: 'none', border: 'none',
                color: 'var(--brand)', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--ff)',
                fontSize: 12, padding: 0,
              }}
            >
              비밀번호 잊으셨나요?
            </button>
          </div>
        )}

        <div style={{
          textAlign: 'center', marginTop: 12,
          fontSize: 12.5, color: 'var(--tx-2)',
        }}>
          {mode === 'signin' && '계정이 없으신가요? '}
          {mode === 'signup' && '이미 계정이 있으신가요? '}
          {mode === 'reset'  && '로그인 화면으로 '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin')
              setError(null)
              setInfo(null)
            }}
            style={{
              background: 'none', border: 'none',
              color: 'var(--brand)', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--ff)',
              fontSize: 12.5, padding: 0,
            }}
          >
            {mode === 'signin' ? '회원가입' : mode === 'signup' ? '로그인' : '돌아가기'}
          </button>
        </div>
      </div>
    </div>
  )
}

const fieldStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'var(--surface)',
  border: '0.5px solid var(--bd)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'var(--ff)',
  outline: 'none',
  color: 'var(--tx-1)',
  boxSizing: 'border-box',
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.32A9 9 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.32z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.36l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.32C4.68 5.16 6.66 3.58 9 3.58z"/>
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#000" d="M9 2C4.86 2 1.5 4.62 1.5 7.85c0 2.09 1.4 3.91 3.5 4.94l-.7 2.55c-.06.21.17.38.36.26l3.05-2.01c.43.05.86.07 1.29.07 4.14 0 7.5-2.62 7.5-5.81S13.14 2 9 2z"/>
    </svg>
  )
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
