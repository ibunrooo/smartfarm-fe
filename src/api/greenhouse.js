import { apiFetch, buildQuery } from './client'

export function mapGreenhouse(raw) {
  if (!raw) return null
  return {
    id:           raw.id,
    greenhouseId: raw.greenhouse_id,
    plantType:    raw.plant_type,
    locationType: raw.location_type,
    useSensor:    raw.use_sensor,
    lat:          raw.lat,
    lon:          raw.lon,
    createdAt:    raw.created_at,
  }
}

// GET /api/greenhouse?greenhouseId=xxx
export async function getGreenhouse(greenhouseId) {
  const data = await apiFetch(`/api/greenhouse${buildQuery({ greenhouseId })}`)
  return mapGreenhouse(data)
}

// POST /api/greenhouse  (Upsert)
// payload: { greenhouseId, plantType?, locationType?, useSensor?, lat?, lon? }
export function upsertGreenhouse(payload) {
  return apiFetch('/api/greenhouse', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
