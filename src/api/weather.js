import { apiFetch, buildQuery } from './client'

function summarize(desc, rainProb) {
  if (typeof rainProb === 'number' && rainProb >= 50) return '비 예보'
  if (!desc) return '-'
  const lower = String(desc).toLowerCase()
  if (lower.includes('clear'))    return '맑음'
  if (lower.includes('cloud'))    return '흐림'
  if (lower.includes('rain'))     return '비'
  if (lower.includes('snow'))     return '눈'
  if (lower.includes('thunder'))  return '천둥'
  return desc
}

export function mapWeather(raw) {
  if (!raw) return null
  return {
    greenhouseId: raw.greenhouse_id,
    temp:         raw.outdoor_temp,
    humidity:     raw.outdoor_humidity,
    rainProb:     raw.rain_prob,
    description:  raw.weather_desc,
    summary:      summarize(raw.weather_desc, raw.rain_prob),
    ts:           raw.ts ?? raw.created_at,
  }
}

// GET /api/weather?greenhouseId=xxx
export async function getWeather(greenhouseId) {
  const data = await apiFetch(`/api/weather${buildQuery({ greenhouseId })}`)
  return mapWeather(data)
}
