import { apiFetch, buildQuery } from './client'

function toDateOnly(value) {
  if (!value || typeof value !== 'string') return value
  const tIdx = value.indexOf('T')
  return tIdx > 0 ? value.slice(0, tIdx) : value
}

export function mapReport(raw) {
  if (!raw) return null
  return {
    greenhouseId:     raw.greenhouseId ?? raw.greenhouse_id,
    date:             toDateOnly(raw.date),
    avgTemp:          raw.avgTemp,
    avgHumidity:      raw.avgHumidity,
    avgSoil:          raw.avgSoil,
    avgLux:           raw.avgLux,
    dataCount:        raw.dataCount,
    alertCount:       raw.alertCount,
    alertTypeCounts:  raw.alertTypeCounts ?? {},
    riskLevel:        raw.riskLevel,
    summary:          raw.summary,
    recommendations:  raw.recommendations ?? [],
    createdAt:        raw.createdAt ?? raw.created_at,
  }
}

// POST /api/report/daily  (UPSERT)
export async function generateDailyReport(greenhouseId, date) {
  const data = await apiFetch('/api/report/daily', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, date }),
  })
  return mapReport(data)
}

// GET /api/report/daily?greenhouseId=xxx&date=YYYY-MM-DD
export async function getDailyReport(greenhouseId, date) {
  const data = await apiFetch(`/api/report/daily${buildQuery({ greenhouseId, date })}`)
  return mapReport(data)
}

// GET /api/report/latest?greenhouseId=xxx
export async function getLatestReport(greenhouseId) {
  const data = await apiFetch(`/api/report/latest${buildQuery({ greenhouseId })}`)
  return mapReport(data)
}

// 호환용 엔드포인트
// GET /api/reports?greenhouseId=xxx&limit=7
export async function getReportList(greenhouseId, limit = 7) {
  const data = await apiFetch(`/api/reports${buildQuery({ greenhouseId, limit })}`)
  return Array.isArray(data) ? data.map(mapReport) : []
}

// GET /api/reports/today?greenhouseId=xxx
export async function getTodayReport(greenhouseId) {
  const data = await apiFetch(`/api/reports/today${buildQuery({ greenhouseId })}`)
  return mapReport(data)
}

// POST /api/reports/generate
// body: { greenhouseId }
export async function generateTodayReport(greenhouseId) {
  const data = await apiFetch('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId }),
  })
  return mapReport(data)
}

// POST /api/report/chat
// body: { greenhouseId, message, chatHistory?: [{role, content}] }
// 서버는 chatHistory의 최근 10개만 사용
export async function postReportChat(greenhouseId, message, chatHistory = []) {
  const data = await apiFetch('/api/report/chat', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, message, chatHistory }),
  })
  return data
}
