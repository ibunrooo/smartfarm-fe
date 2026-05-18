import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { setBackendToken } from './lib/authToken'

// 카카오 커스텀 OAuth 콜백: BE가 /home?token=...&provider=kakao 로 리다이렉트하므로
// 라우터 마운트 전에 토큰을 localStorage로 옮기고 쿼리스트링을 정리한다.
;(() => {
  try {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    const provider = url.searchParams.get('provider')
    if (token && provider) {
      setBackendToken(token)
      url.searchParams.delete('token')
      url.searchParams.delete('provider')
      window.history.replaceState({}, '', url.toString())
    }
  } catch { /* URL 파싱 실패 무시 */ }
})()

// 웹 푸시용 SW를 부트스트랩에서 등록 — AIChat을 거치지 않아도 알림을 받기 위함
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.warn('SW 등록 실패:', err)
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
