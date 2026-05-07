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

export const dailyReports = [
  {
    id: 'r1',
    date: '2026-05-08',
    greenhouseId: 'gh1',
    summary: '오늘 상추 온실은 전반적으로 안정적이에요. 토양 수분이 한 번 임계에 진입했으나 자동 관수로 회복되었어요.',
    riskLevel: 'low',
    riskScore: 18,
    actions: [
      '현재 관수·환기 패턴 유지',
      '내일 비 예보 — 외부 알림이 자동 강화될 예정',
    ],
  },
]
