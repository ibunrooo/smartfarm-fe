const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  constructor(status, message, body) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`

  const headers = { ...(options.headers ?? {}) }
  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url, { ...options, headers })

  const contentType = res.headers.get('content-type') ?? ''
  let body
  if (contentType.includes('application/json')) {
    body = await res.json().catch(() => null)
  } else {
    const text = await res.text()
    body = text || null
  }

  if (!res.ok) {
    const message = body?.error ?? body?.message ?? `HTTP ${res.status}`
    throw new ApiError(res.status, message, body)
  }

  return body
}

export function buildQuery(params) {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (filtered.length === 0) return ''
  return '?' + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString()
}
