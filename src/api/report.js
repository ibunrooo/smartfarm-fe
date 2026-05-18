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

// GET /api/report/latest?greenhouseId=xxx
export async function getLatestReport(greenhouseId) {
  const data = await apiFetch(`/api/report/latest${buildQuery({ greenhouseId })}`)
  return mapReport(data)
}

// POST /api/report/daily (UPSERT) — 과거 특정 날짜 리포트를 수동 생성/재생성
// body: { greenhouseId, date: 'YYYY-MM-DD' }
export async function generateDailyReport(greenhouseId, date) {
  const data = await apiFetch('/api/report/daily', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, date }),
  })
  return mapReport(data)
}

// GET /api/reports?greenhouseId=xxx&limit=7
export async function getReportList(greenhouseId, limit = 7) {
  const data = await apiFetch(`/api/reports${buildQuery({ greenhouseId, limit })}`)
  return Array.isArray(data) ? data.map(mapReport) : []
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
export const REPORT_CHAT_MAX_MESSAGE_LENGTH = 1000

export async function postReportChat(greenhouseId, message, chatHistory = []) {
  const text = String(message ?? '')
  if (text.length > REPORT_CHAT_MAX_MESSAGE_LENGTH) {
    throw new Error(`메시지는 ${REPORT_CHAT_MAX_MESSAGE_LENGTH}자 이하로 입력해주세요.`)
  }
  const trimmedHistory = Array.isArray(chatHistory) ? chatHistory.slice(-10) : []
  const data = await apiFetch('/api/report/chat', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, message: text, chatHistory: trimmedHistory }),
  })
  return data
}
