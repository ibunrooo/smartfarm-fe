import { apiFetch } from './client'

// POST /api/disease/predict  (multipart/form-data, field: image)
// 제약: jpg/jpeg/png/webp, 최대 5MB
export function predictDisease(imageFile) {
  const formData = new FormData()
  formData.append('image', imageFile)
  return apiFetch('/api/disease/predict', {
    method: 'POST',
    body: formData,
  })
}
