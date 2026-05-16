/* Web Push 구독 헬퍼 (Firebase 없이 VAPID 표준)
 * API 명세 §10 흐름:
 *   1. 권한 요청 → 2. VAPID 공개키 GET → 3. PushManager.subscribe
 *   4. 모든 등록 온실에 endpoint+keys POST
 */

import { getVapidPublicKey, subscribePush, unsubscribePush } from '../api/push'
import { getMyGreenhouses } from '../api/greenhouse'

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  )
}

// VAPID 공개키(URL-safe base64) → Uint8Array
function urlBase64ToUint8Array(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalized)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function serializeSubscription(sub) {
  const json = sub.toJSON()
  return {
    endpoint:       json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys?.p256dh ?? '',
      auth:   json.keys?.auth ?? '',
    },
  }
}

// 권한 요청 + 브라우저 구독 생성 (이미 있으면 재사용)
async function ensureSubscription() {
  if (!isPushSupported()) {
    throw new Error('이 브라우저는 푸시 알림을 지원하지 않아요.')
  }
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('알림 권한이 허용되지 않았어요.')
  }
  const registration = await navigator.serviceWorker.ready

  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing

  const publicKey = await getVapidPublicKey()
  if (!publicKey) throw new Error('서버에서 VAPID 공개키를 받지 못했어요.')

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  })
}

// 모든 온실에 현재 디바이스 구독 등록
export async function enablePushForAllGreenhouses() {
  const subscription = await ensureSubscription()
  const serialized = serializeSubscription(subscription)

  const greenhouses = await getMyGreenhouses()
  if (greenhouses.length === 0) {
    // 식물이 아직 없어도 브라우저 구독은 만들어두고, 등록은 다음에
    return { subscribed: 0, total: 0 }
  }

  const results = await Promise.allSettled(
    greenhouses.map(gh => subscribePush(gh.greenhouseId, serialized))
  )
  const ok = results.filter(r => r.status === 'fulfilled').length
  return { subscribed: ok, total: greenhouses.length }
}

// 모든 온실에서 현재 디바이스 endpoint 해지 + 브라우저 구독 해지
export async function disablePushForAllGreenhouses() {
  if (!isPushSupported()) return
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return

  const { endpoint } = subscription
  const greenhouses = await getMyGreenhouses().catch(() => [])

  await Promise.allSettled(
    greenhouses.map(gh => unsubscribePush(gh.greenhouseId, endpoint))
  )
  await subscription.unsubscribe().catch(() => {})
}
