import { apiFetch, buildQuery } from './client'

// GET /api/auth/me — Supabase 토큰/BE JWT 둘 다 허용
export async function getAuthMe() {
  return apiFetch('/api/auth/me')
}

// GET /api/auth/kakao/start?redirectTo=...
// 응답: { ok, authorizeUrl, state }
export async function startKakaoLogin(redirectTo) {
  return apiFetch(`/api/auth/kakao/start${buildQuery({ redirectTo })}`)
}
