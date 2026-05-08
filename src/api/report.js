import { apiFetch, buildQuery } from './client'

export function mapReport(raw) {
  if (!raw) return null
  return {
    greenhouseId:     raw.greenhouseId ?? raw.greenhouse_id,
    date:             raw.date,
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
// GET /api/reports?limit=7
export async function getReportList(limit = 7) {
  const data = await apiFetch(`/api/reports${buildQuery({ limit })}`)
  return Array.isArray(data) ? data.map(mapReport) : []
}

// GET /api/reports/today
export async function getTodayReport() {
  const data = await apiFetch('/api/reports/today')
  return mapReport(data)
}

// POST /api/reports/generate
export async function generateTodayReport() {
  const data = await apiFetch('/api/reports/generate', { method: 'POST' })
  return mapReport(data)
}
