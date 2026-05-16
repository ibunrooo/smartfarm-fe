import { useState } from 'react'

// 식물 아바타 — 이미지 있으면 사진, 없거나 로드 실패 시 색 박스 + 첫 글자로 fallback
function PlantAvatar({ plant, size = 48, radius }) {
  const [errored, setErrored] = useState(false)
  const r = radius ?? Math.round(size * 0.25)
  const hasImage = plant?.image && !errored

  if (hasImage) {
    return (
      <div style={{
        width: size, height: size,
        borderRadius: r,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'var(--surface-2)',
      }}>
        <img
          src={plant.image}
          alt={plant.name ?? ''}
          onError={() => setErrored(true)}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', display: 'block',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      width: size, height: size,
      background: plant?.theme?.main ?? 'var(--brand)',
      borderRadius: r,
      color: '#fff',
      fontSize: Math.round(size * 0.4), fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {plant?.name?.[0] ?? '?'}
    </div>
  )
}

export default PlantAvatar
