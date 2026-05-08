import { apiFetch } from './client'

// GET /api/plant/list
export function getPlantList() {
  return apiFetch('/api/plant/list')
}

// POST /api/plant/recommend
// body: { locationType: 'indoor'|'outdoor', lightLevel?, waterFreq?, bugSensitive? }
// rate-limited: 1분당 3회 (429 가능)
export function recommendPlant(payload) {
  return apiFetch('/api/plant/recommend', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// POST /api/plant/register
// body: { greenhouseId, plantKey }
export function registerPlant(greenhouseId, plantKey) {
  return apiFetch('/api/plant/register', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, plantKey }),
  })
}
