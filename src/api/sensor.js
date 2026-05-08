import { apiFetch, buildQuery } from './client'

// GET /api/latest?greenhouseId=xxx
export function getLatestSensor(greenhouseId) {
  return apiFetch(`/api/latest${buildQuery({ greenhouseId })}`)
}

// GET /api/history?greenhouseId=xxx&minutes=60
export function getSensorHistory(greenhouseId, minutes = 60) {
  return apiFetch(`/api/history${buildQuery({ greenhouseId, minutes })}`)
}
