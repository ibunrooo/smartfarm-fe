import { apiFetch } from './client'

const HEALTHY_ACTIONS = [
  '현재 관리 패턴 유지',
  '주 1회 정기 점검',
]
const DISEASE_ACTIONS = [
  '감염 부위 신속 확인',
  '습도와 통풍 환경 점검',
  '필요 시 전문가 상담',
]

export function mapDiseaseResult(raw) {
  const p = raw?.prediction
  if (!p) return null
  const isHealthy = p.result === 'healthy'
  return {
    disease: {
      id:          p.label,
      name:        isHealthy ? '정상' : '질병 의심',
      severity:    isHealthy ? 'ok' : 'warn',
      description: p.message,
      actions:     isHealthy ? HEALTHY_ACTIONS : DISEASE_ACTIONS,
    },
    confidence: Math.round((p.confidence ?? 0) * 100),
  }
}

// POST /api/disease/predict  (multipart/form-data, field: image)
// 제약: jpg/jpeg/png/webp, 최대 5MB
export async function predictDisease(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  const data = await apiFetch('/api/disease/predict', {
    method: 'POST',
    body: formData,
  })
  return mapDiseaseResult(data)
}
