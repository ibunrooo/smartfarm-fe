import { apiFetch } from './client'

// POST /api/simulate/start
// payload: { temperature, humidity, soilMoisture, plantType?, lux?, intervalMs?, *Delta? }
export function startSimulation(greenhouseId, payload) {
  return apiFetch('/api/simulate/start', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, ...payload }),
  })
}

// POST /api/simulate/stop
export function stopSimulation(greenhouseId) {
  return apiFetch('/api/simulate/stop', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId }),
  })
}
