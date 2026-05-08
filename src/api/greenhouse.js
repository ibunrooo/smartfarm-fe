import { apiFetch, buildQuery } from './client'

// GET /api/greenhouse?greenhouseId=xxx
export function getGreenhouse(greenhouseId) {
  return apiFetch(`/api/greenhouse${buildQuery({ greenhouseId })}`)
}

// POST /api/greenhouse  (Upsert)
// body: { greenhouseId, plantType?, locationType?, useSensor?, lat?, lon? }
export function upsertGreenhouse(payload) {
  return apiFetch('/api/greenhouse', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
