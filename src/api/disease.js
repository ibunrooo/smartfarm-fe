import { apiFetch } from './client'

export function mapDiseaseResult(raw) {
  if (!raw?.prediction) return null
  const { result, label, confidence, message } = raw.prediction
  return { result, label, confidence, message }
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
