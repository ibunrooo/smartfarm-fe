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

// DELETE /api/greenhouse?greenhouseId=xxx
// 본인 소유 온실만 삭제. 관련 센서/날씨/알림/동작/리포트/식물 등록 데이터 cascade.
export function deleteGreenhouse(greenhouseId) {
  return apiFetch(`/api/greenhouse${buildQuery({ greenhouseId })}`, {
    method: 'DELETE',
  })
}

// GET /api/greenhouses
// 로그인 사용자의 모든 온실 반환 (로그아웃-재로그인 후 복원용)
export async function getMyGreenhouses() {
  const data = await apiFetch('/api/greenhouses')
  if (!Array.isArray(data)) return []
  return data.map(mapGreenhouse).filter(Boolean)
}
