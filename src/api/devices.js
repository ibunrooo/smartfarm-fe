import { apiFetch, buildQuery } from './client'

// BE는 snake_case로 응답 — camelCase로 정규화. camelCase로 이미 와도 안전하게 폴백.
function mapDevice(raw) {
  if (!raw) return null
  return {
    deviceId:     raw.deviceId     ?? raw.device_id,
    deviceType:   raw.deviceType   ?? raw.device_type,
    greenhouseId: raw.greenhouseId ?? raw.greenhouse_id,
    deviceStatus: raw.deviceStatus ?? raw.device_status ?? null,
    status:       raw.status ?? null,
    lastSeenAt:   raw.lastSeenAt   ?? raw.last_seen_at ?? null,
    createdAt:    raw.createdAt    ?? raw.created_at ?? null,
  }
}

// POST /api/devices/register
// body: { greenhouseId, deviceId, deviceType: 'sensor'|'light'|'pump'|'window' }
export function registerDevice({ greenhouseId, deviceId, deviceType }) {
  return apiFetch('/api/devices/register', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, deviceId, deviceType }),
  })
}

// POST /api/devices/:deviceId/provision
// body: { greenhouseId }
// 응답: { ok, provisioning: { mqttUrl, username, password, expiresAt, topics } }
// password는 1회만 노출되므로 호출자가 사용자에게 즉시 보여줘야 한다.
export function provisionDevice(deviceId, greenhouseId) {
  return apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/provision`, {
    method: 'POST',
    body: JSON.stringify({ greenhouseId }),
  })
}

// GET /api/devices?greenhouseId=
export async function getDevices(greenhouseId) {
  const data = await apiFetch(`/api/devices${buildQuery({ greenhouseId })}`)
  // 응답 형식이 [...] 또는 { devices: [...] } 둘 다 가능 — 안전하게 두 케이스 처리
  const list = Array.isArray(data) ? data : Array.isArray(data?.devices) ? data.devices : []
  return list.map(mapDevice).filter(d => d && d.deviceId)
}

// GET /api/devices/:deviceId/status
// 응답: { ok, status: 'online'|'offline', deviceStatus: 'active'|'revoked', lastSeenAt }
export async function getDeviceStatus(deviceId) {
  const raw = await apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/status`)
  return {
    status:       raw?.status ?? null,
    deviceStatus: raw?.deviceStatus ?? raw?.device_status ?? null,
    lastSeenAt:   raw?.lastSeenAt ?? raw?.last_seen_at ?? null,
  }
}

// POST /api/devices/:deviceId/revoke
export function revokeDevice(deviceId) {
  return apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/revoke`, {
    method: 'POST',
  })
}

export const DEVICE_TYPE_LABEL = {
  sensor: '센서 모듈',
  light:  '조명',
  pump:   '펌프',
  window: '창문',
}
