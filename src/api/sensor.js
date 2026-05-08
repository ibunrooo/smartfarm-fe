import { apiFetch, buildQuery } from './client'

export function mapSensorReading(raw) {
  if (!raw) return null
  return {
    greenhouseId: raw.greenhouse_id,
    temp:         raw.temperature,
    humidity:     raw.humidity,
    soil:         raw.soil_moisture,
    ts:           raw.ts,
  }
}

// GET /api/latest?greenhouseId=xxx
export async function getLatestSensor(greenhouseId) {
  const data = await apiFetch(`/api/latest${buildQuery({ greenhouseId })}`)
  return mapSensorReading(data)
}

// GET /api/history?greenhouseId=xxx&minutes=60
export async function getSensorHistory(greenhouseId, minutes = 60) {
  const data = await apiFetch(`/api/history${buildQuery({ greenhouseId, minutes })}`)
  return Array.isArray(data) ? data.map(mapSensorReading) : []
}
