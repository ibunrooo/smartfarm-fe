import { apiFetch } from './client'

// BE는 엔드포인트마다 응답 키 케이스가 달라서 (camel/snake) 둘 다 받음
// 특히 /api/plant/list는 DB row 원본(snake_case)이라 plant_key/name_ko로 옴
export function mapPlant(raw) {
  if (!raw) return null
  return {
    id:              raw.plantKey ?? raw.plant_key ?? raw.key ?? null,
    name:            raw.name ?? raw.nameKo ?? raw.name_ko ?? '',
    difficulty:      raw.difficulty ?? null,
    description:     raw.description ?? '',
    recommendReason: raw.recommendReason ?? raw.reason ?? '',
    sunPref:         raw.sunPref ?? raw.lightLevel ?? raw.light_level ?? null,
    imageUrl:        raw.imageUrl ?? raw.image ?? raw.image_url ?? null,
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
