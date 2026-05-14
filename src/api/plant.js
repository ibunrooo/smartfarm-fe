import { apiFetch } from './client'

// BE 응답이 어떤 키로 올지 명세에 정확히 없어서 안전하게 normalize
export function mapPlant(raw) {
  if (!raw) return null
  return {
    id:              raw.plantKey ?? raw.id ?? raw.key ?? null,
    name:            raw.name ?? '',
    difficulty:      raw.difficulty ?? null,
    description:     raw.description ?? '',
    recommendReason: raw.recommendReason ?? raw.reason ?? '',
    sunPref:         raw.sunPref ?? raw.lightLevel ?? null,
    imageUrl:        raw.imageUrl ?? raw.image ?? null,
  }
}

// GET /api/plant/list
export async function getPlantList() {
  const data = await apiFetch('/api/plant/list')
  if (!Array.isArray(data)) return []
  return data.map(mapPlant).filter(p => p?.id)
}

// POST /api/plant/recommend
// payload: { locationType, lightLevel?, waterFreq?, bugSensitive? }
// rate-limited: 1분당 3회 (429 가능)
export async function recommendPlant(payload) {
  const data = await apiFetch('/api/plant/recommend', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  const list = Array.isArray(data?.plants) ? data.plants : []
  return {
    plants: list.map(mapPlant).filter(p => p?.id),
    message: data?.message ?? null,
  }
}

// POST /api/plant/register
// body: { greenhouseId, plantKey }
export function registerPlant(greenhouseId, plantKey) {
  return apiFetch('/api/plant/register', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, plantKey }),
  })
}
