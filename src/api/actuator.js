import { apiFetch, buildQuery } from './client'

export function mapActuatorLog(raw) {
  if (!raw) return null
  return {
    greenhouseId: raw.greenhouse_id,
    actuator:     raw.actuator,
    action:       raw.action,
    ts:           raw.ts ?? raw.created_at,
  }
}

// GET /api/actuators?greenhouseId=xxx
export async function getActuatorLogs(greenhouseId) {
  const data = await apiFetch(`/api/actuators${buildQuery({ greenhouseId })}`)
  return Array.isArray(data) ? data.map(mapActuatorLog) : []
}

// POST /api/control
// actuator: 'pump' | 'led' | 'window'
// action:   'ON' | 'OFF' | 'OPEN' | 'CLOSE'
export function controlActuator(greenhouseId, actuator, action) {
  return apiFetch('/api/control', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, actuator, action }),
  })
}
