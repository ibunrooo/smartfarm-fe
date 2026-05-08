import { apiFetch, buildQuery } from './client'

// GET /api/weather?greenhouseId=xxx
export function getWeather(greenhouseId) {
  return apiFetch(`/api/weather${buildQuery({ greenhouseId })}`)
}
