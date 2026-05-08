import { apiFetch, buildQuery } from './client'

// POST /api/report/daily
// body: { greenhouseId, date: 'YYYY-MM-DD' }
export function generateDailyReport(greenhouseId, date) {
  return apiFetch('/api/report/daily', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, date }),
  })
}

// GET /api/report/daily?greenhouseId=xxx&date=YYYY-MM-DD
export function getDailyReport(greenhouseId, date) {
  return apiFetch(`/api/report/daily${buildQuery({ greenhouseId, date })}`)
}

// GET /api/report/latest?greenhouseId=xxx
export function getLatestReport(greenhouseId) {
  return apiFetch(`/api/report/latest${buildQuery({ greenhouseId })}`)
}

// 호환용 엔드포인트
// GET /api/reports?limit=7
export function getReportList(limit = 7) {
  return apiFetch(`/api/reports${buildQuery({ limit })}`)
}

// GET /api/reports/today
export function getTodayReport() {
  return apiFetch('/api/reports/today')
}

// POST /api/reports/generate
export function generateTodayReport() {
  return apiFetch('/api/reports/generate', { method: 'POST' })
}
