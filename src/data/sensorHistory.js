import { hashStr, seededRandom } from '../utils/random'

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
