function hashStr(s) {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i)
  }
  return (h | 0) || 1
}

function seededRandom(seed) {
  let s = seed | 0
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 4294967295
  }
}

const walkRange = {
  temp:     1.2,
  humidity: 5,
  soil:     3,
  lux:      1500,
}

export function generateHistory(greenhouseId, sensorKey, currentValue, points = 24) {
  const rand = seededRandom(hashStr(`${greenhouseId}-${sensorKey}`))
  const range = walkRange[sensorKey] ?? 1
  const data = new Array(points)

  let v = currentValue
  for (let i = points - 1; i >= 0; i--) {
    data[i] = { t: i, v: Math.round(v * 10) / 10 }
    v = v + (rand() - 0.5) * range
    v = v * 0.82 + currentValue * 0.18
  }
  return data
}
