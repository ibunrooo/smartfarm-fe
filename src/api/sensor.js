import { apiFetch, buildQuery } from './client'

export function mapSensorReading(raw) {
  if (!raw) return null
  return {
    greenhouseId:      raw.greenhouse_id,
    temp:              raw.temperature,
    humidity:          raw.humidity,
    soil:              raw.soil_moisture,
    lux:               raw.lux,
    ts:                raw.ts,
    // BE 데이터 출처 — `sensor` 또는 `weather_fallback`
    dataSource:        raw.data_source ?? null,
    isWeatherFallback: raw.is_weather_fallback === true,
  }
}

// GET /api/latest?greenhouseId=xxx
export async function getLatestSensor(greenhouseId) {
  const data = await apiFetch(`/api/latest${buildQuery({ greenhouseId })}`)
  return mapSensorReading(data)
}

// GET /api/history?greenhouseId=xxx&minutes=60
// 스펙: minutes는 1~1440 (1분 ~ 24시간)
const HISTORY_MIN_MINUTES = 1
const HISTORY_MAX_MINUTES = 1440

export async function getSensorHistory(greenhouseId, minutes = 60) {
  const clamped = Math.min(HISTORY_MAX_MINUTES, Math.max(HISTORY_MIN_MINUTES, Math.trunc(Number(minutes) || 60)))
  const data = await apiFetch(`/api/history${buildQuery({ greenhouseId, minutes: clamped })}`)
  return Array.isArray(data) ? data.map(mapSensorReading) : []
}
