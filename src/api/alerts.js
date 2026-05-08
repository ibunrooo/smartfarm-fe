import { apiFetch, buildQuery } from './client'

// GET /api/alerts?greenhouseId=xxx&limit=20
export function getAlerts(greenhouseId, limit = 20) {
  return apiFetch(`/api/alerts${buildQuery({ greenhouseId, limit })}`)
}
