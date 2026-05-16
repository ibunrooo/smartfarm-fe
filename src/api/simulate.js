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

// POST /api/simulate/publish — 1회 발행 (사용자 수동 입력 값을 BE → MQTT로 publish)
// payload: { temperature, humidity, soilMoisture, plantType?, lux?, ts? }
export function publishOnce(greenhouseId, payload) {
  return apiFetch('/api/simulate/publish', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, ...payload }),
  })
}
