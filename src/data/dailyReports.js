export const riskLabel = {
  low:    '안전',
  medium: '주의',
  high:   '위험',
}

export const riskColor = {
  low:    '#2ea84e',
  medium: '#f0a500',
  high:   '#e84040',
}

export const alertTypeLabel = {
  humidity_high:  '습도 높음',
  humidity_low:   '습도 낮음',
  temp_high:      '온도 높음',
  temp_low:       '온도 낮음',
  pest_risk_high: '병해충 위험 높음',
}

export const dailyReports = [
  {
    id: 'r1',
    date: '2026-05-08',
    greenhouseId: 'gh1',
    summary: '오늘 상추 온실은 전반적으로 안정적이에요. 토양 수분이 한 번 임계에 진입했으나 자동 관수로 회복되었어요.',
    riskLevel: 'low',
    riskScore: 18,
    avgTemp: 24.3,
    avgHumidity: 55.2,
    avgSoil: 35.4,
    avgLux: 8500,
    dataCount: 1440,
    alertCount: 2,
    alertTypeCounts: {
      humidity_high: 1,
      pest_risk_high: 1,
    },
    actions: [
      '현재 관수·환기 패턴 유지',
      '내일 비 예보 — 외부 알림이 자동 강화될 예정',
    ],
    createdAt: '2026-05-08T20:00:01Z',
  },
]
