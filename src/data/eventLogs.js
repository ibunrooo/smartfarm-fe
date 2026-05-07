import { hashStr, seededRandom } from '../utils/random'

export const LOG_CATEGORIES = ['water', 'fan', 'led', 'alert', 'sensor', 'system']

export const categoryLabels = {
  water:  '관수',
  fan:    '환기',
  led:    'LED',
  alert:  '알림',
  sensor: '센서',
  system: '시스템',
}

export const categoryDotColor = {
  water:  '#4db866',
  fan:    '#3b82c4',
  led:    '#f0a500',
  alert:  '#e84040',
  sensor: '#9b59b6',
  system: '#888888',
}

const templates = {
  water:  ['자동 급수 완료', '관수 5분 실행', '토양 수분 임계 진입 → 관수 시작'],
  fan:    ['환기팬 자동 가동', '환기팬 정지', '습도 임계 → 환기 시작'],
  led:    ['LED 자동 점등', 'LED 소등', '조도 부족 감지 → 보광 시작'],
  alert:  ['토양 수분 임계치 도달', '온도 이상 감지 (35°C↑)', '습도 이상 감지', '조도 부족 경보'],
  sensor: ['센서 데이터 수신', '센서 캘리브레이션 완료', '센서 통신 복구'],
  system: ['외부 기상 업데이트 (비 예보)', '시스템 재시작', '룰엔진 업데이트'],
}

export function generateLogs(greenhouseId, count = 30) {
  const rand = seededRandom(hashStr(`logs-${greenhouseId}`))
  const items = []

  for (let i = 0; i < count; i++) {
    const category = LOG_CATEGORIES[Math.floor(rand() * LOG_CATEGORIES.length)]
    const tpl = templates[category]
    const text = tpl[Math.floor(rand() * tpl.length)]
    const totalMinutes = Math.floor(rand() * 24 * 60)
    const hh = Math.floor(totalMinutes / 60)
    const mm = totalMinutes % 60
    const time = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
    items.push({ sortKey: totalMinutes, log: { id: i, category, text, time } })
  }

  items.sort((a, b) => b.sortKey - a.sortKey)
  return items.map(item => item.log)
}
