import { apiFetch, buildQuery } from './client'

const ALERT_LABEL = {
  humidity_high:  '습도 높음',
  humidity_low:   '습도 낮음',
  temp_high:      '온도 높음',
  temp_low:       '온도 낮음',
  pest_risk_high: '병해충 위험 높음',
}

const ALERT_SEVERITY = {
  humidity_high:  'warn',
  humidity_low:   'warn',
  temp_high:      'danger',
  temp_low:       'warn',
  pest_risk_high: 'danger',
}

export function mapAlert(raw) {
  if (!raw) return null
  return {
    id:           raw.id,
    greenhouseId: raw.greenhouse_id,
    type:         raw.alert_type,
    label:        ALERT_LABEL[raw.alert_type] ?? raw.alert_type,
    severity:     ALERT_SEVERITY[raw.alert_type] ?? 'warn',
    message:      raw.message,
    ts:           raw.ts ?? raw.created_at,
  }
}

// GET /api/alerts?greenhouseId=xxx&limit=20
export async function getAlerts(greenhouseId, limit = 20) {
  const data = await apiFetch(`/api/alerts${buildQuery({ greenhouseId, limit })}`)
  return Array.isArray(data) ? data.map(mapAlert) : []
}
