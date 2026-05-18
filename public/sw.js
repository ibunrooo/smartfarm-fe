/* 팜-므파탈 서비스 워커
 * 책임: 푸시 알림 수신·표시, 알림 클릭 시 적절한 탭으로 이동.
 */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  // 데이터 없는 push도 알림은 띄워야 한다 — Chrome은 silent push가 누적되면
  // userVisibleOnly 위반으로 구독을 강제 해지함.
  let data = {}
  if (event.data) {
    try { data = event.data.json() }
    catch { data = { body: event.data.text() } }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || '팜-므파탈', {
      body: data.body || '새 알림이 도착했어요.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag,
      data: { url: data.url || '/' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/'
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const c of list) {
      try {
        const cUrl = new URL(c.url)
        const tUrl = new URL(targetUrl, self.location.origin)
        if (cUrl.origin !== tUrl.origin) continue
        await c.focus()
        // 이미 같은 페이지면 그대로 focus만, 아니면 navigate
        if (cUrl.pathname !== tUrl.pathname || cUrl.search !== tUrl.search) {
          return c.navigate(tUrl.href).catch(() => {})
        }
        return
      } catch { /* invalid URL — 다음 클라이언트로 */ }
    }
    return self.clients.openWindow(targetUrl)
  })())
})
