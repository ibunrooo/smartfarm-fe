import { apiFetch } from './client'

// GET /api/push/public-key
export async function getVapidPublicKey() {
  const data = await apiFetch('/api/push/public-key')
  return data?.publicKey ?? null
}

// POST /api/push/subscribe
// subscription: { endpoint, expirationTime, keys: { p256dh, auth } }
export function subscribePush(greenhouseId, subscription) {
  return apiFetch('/api/push/subscribe', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, subscription }),
  })
}

// DELETE /api/push/subscribe
export function unsubscribePush(greenhouseId, endpoint) {
  return apiFetch('/api/push/subscribe', {
    method: 'DELETE',
    body: JSON.stringify({ greenhouseId, endpoint }),
  })
}

// POST /api/push/test
export function sendPushTest(greenhouseId, { title, body, url } = {}) {
  return apiFetch('/api/push/test', {
    method: 'POST',
    body: JSON.stringify({ greenhouseId, title, body, url }),
  })
}
