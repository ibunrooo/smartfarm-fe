/* localStorage 헬퍼
 * BE에 "내 온실 목록" endpoint가 없어서, 사용자가 등록한 greenhouseId를
 * 브라우저에 보관해 두기 위한 모듈.
 */

const GREENHOUSE_IDS_KEY   = 'farm-me:greenhouseIds'
const ACTIVE_ID_KEY        = 'farm-me:activeGreenhouseId'
const GREENHOUSE_MODES_KEY = 'farm-me:greenhouseModes'  // { [id]: 'virtual' | 'real' }

function safeGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* private mode 등에서 throw 가능 — 무시 */
  }
}

export function getMyGreenhouseIds() {
  const raw = safeGet(GREENHOUSE_IDS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function setMyGreenhouseIds(ids) {
  safeSet(GREENHOUSE_IDS_KEY, JSON.stringify(ids))
}

export function addGreenhouseId(id) {
  if (!id) return getMyGreenhouseIds()
  const ids = getMyGreenhouseIds()
  if (ids.includes(id)) return ids
  const next = [...ids, id]
  setMyGreenhouseIds(next)
  return next
}

export function removeGreenhouseId(id) {
  const next = getMyGreenhouseIds().filter(x => x !== id)
  setMyGreenhouseIds(next)
  return next
}

export function getActiveGreenhouseId() {
  return safeGet(ACTIVE_ID_KEY)
}

export function setActiveGreenhouseId(id) {
  if (id) safeSet(ACTIVE_ID_KEY, id)
}

function getGreenhouseModes() {
  const raw = safeGet(GREENHOUSE_MODES_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return (parsed && typeof parsed === 'object') ? parsed : {}
  } catch {
    return {}
  }
}

export function getGreenhouseMode(id) {
  if (!id) return 'virtual'
  return getGreenhouseModes()[id] ?? 'virtual'
}

export function setGreenhouseMode(id, mode) {
  if (!id) return
  const modes = getGreenhouseModes()
  modes[id] = mode
  safeSet(GREENHOUSE_MODES_KEY, JSON.stringify(modes))
}

export function removeGreenhouseMode(id) {
  if (!id) return
  const modes = getGreenhouseModes()
  if (!(id in modes)) return
  delete modes[id]
  safeSet(GREENHOUSE_MODES_KEY, JSON.stringify(modes))
}
