/* 백엔드 자체 JWT(Kakao 커스텀 OAuth 발급) localStorage 헬퍼.
 * 이메일 사용자는 Supabase 세션을 그대로 쓰므로 BE 토큰이 없고,
 * 카카오 사용자만 이 값을 갖는다. api/client.js가 헤더 부착 시
 * BE 토큰을 우선 사용하고, 없으면 Supabase access_token으로 폴백한다.
 */

const BACKEND_TOKEN_KEY = 'farm-me:beToken'

export function getBackendToken() {
  try { return localStorage.getItem(BACKEND_TOKEN_KEY) } catch { return null }
}

export function setBackendToken(token) {
  try {
    if (token) localStorage.setItem(BACKEND_TOKEN_KEY, token)
    else       localStorage.removeItem(BACKEND_TOKEN_KEY)
  } catch { /* private mode 등 무시 */ }
}

export function clearBackendToken() {
  try { localStorage.removeItem(BACKEND_TOKEN_KEY) } catch { /* 무시 */ }
}
