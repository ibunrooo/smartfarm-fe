import { apiFetch, buildQuery } from './client'

// GET /api/actuators?greenhouseId=xxx
export function getActuatorLogs(greenhouseId) {
  return apiFetch(`/api/actuators${buildQuery({ greenhouseId })}`)
}

// POST /api/control
// body: { greenhouseId, actuator: 'pump'|'led'|'window', action: 'ON'|'OFF'|'OPEN'|'CLOSE' }
export function controlActuator(greenhouseId, actuator, action) {
  return apiFetch('/api/control', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, actuator, action }),
  })
}
