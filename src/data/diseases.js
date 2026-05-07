export const diseases = [
  {
    id: 'healthy',
    name: '정상',
    severity: 'ok',
    description: '식물 상태가 양호해요. 현재 관리 패턴을 유지하세요.',
    actions: [
      '현재 관수·환기 패턴 유지',
      '주 1회 정기 점검',
    ],
  },
  {
    id: 'leaf_mold',
    name: '잎곰팡이병',
    severity: 'warn',
    description: '잎 표면에 흰색·회색 곰팡이가 발생한 상태예요.',
    actions: [
      '감염된 잎 즉시 제거',
      '환기 강화 (습도 60% 이하 유지)',
      '베이킹소다 희석액 살포',
    ],
  },
  {
    id: 'leaf_spot',
    name: '잎점무늬병',
    severity: 'warn',
    description: '잎에 갈색 또는 어두운 점무늬가 나타난 상태예요.',
    actions: [
      '감염 잎 제거 후 폐기',
      '관수 시 잎 직접 접촉 피하기',
      '통풍 개선',
    ],
  },
  {
    id: 'downy_mildew',
    name: '노균병',
    severity: 'bad',
    description: '잎 뒷면에 노란 반점과 회색 곰팡이가 보이는 진균 질병이에요.',
    actions: [
      '감염 부위 신속 제거',
      '습도를 낮추고 통풍 강화',
      '구리계 살균제 적용 검토',
    ],
  },
  {
    id: 'anthracnose',
    name: '탄저병',
    severity: 'bad',
    description: '잎과 과실에 갈색 반점이 나타나는 진균 질병이에요.',
    actions: [
      '감염 부위 신속 제거 및 폐기',
      '관수 시 잎에 물 닿지 않게',
      '구리계 살균제 적용',
    ],
  },
]

export const severityStyle = {
  ok:   { bg: '#ddf2e2', fg: '#156b2e', bar: '#2ea84e', label: '정상' },
  warn: { bg: '#fff8ec', fg: '#8a5c00', bar: '#f0a500', label: '주의' },
  bad:  { bg: '#fff1f1', fg: '#991f1f', bar: '#e84040', label: '위험' },
}
