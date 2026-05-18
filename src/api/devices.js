import { apiFetch, buildQuery } from './client'

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
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.devices)) return data.devices
  return []
}

// GET /api/devices/:deviceId/status
// 응답: { ok, status: 'online'|'offline', deviceStatus: 'active'|'revoked', lastSeenAt }
export function getDeviceStatus(deviceId) {
  return apiFetch(`/api/devices/${encodeURIComponent(deviceId)}/status`)
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
