export const plants = [
  {
    id: 'lettuce',
    name: '상추',
    scientificName: 'Lactuca sativa',
    difficulty: 'easy',
    color: '#7dcc8f',
    description: '잎채소의 대표주자. 빠르게 자라고 수확이 쉬워요.',
  },
  {
    id: 'tomato',
    name: '방울토마토',
    scientificName: 'Solanum lycopersicum',
    difficulty: 'medium',
    color: '#e84040',
    description: '꾸준한 햇빛과 관수가 필요해요. 수확 보람이 커요.',
  },
  {
    id: 'basil',
    name: '바질',
    scientificName: 'Ocimum basilicum',
    difficulty: 'easy',
    color: '#4db866',
    description: '향이 좋은 허브. 실내 창가에서도 잘 자라요.',
  },
  {
    id: 'pepper',
    name: '청양고추',
    scientificName: 'Capsicum annuum',
    difficulty: 'medium',
    color: '#f0a500',
    description: '햇빛을 좋아해요. 매운맛은 햇빛량에 비례.',
  },
  {
    id: 'strawberry',
    name: '딸기',
    scientificName: 'Fragaria',
    difficulty: 'hard',
    color: '#e84090',
    description: '도전 과제. 통풍과 일조량 관리가 핵심이에요.',
  },
]

export const difficultyLabel = {
  easy:   '쉬움',
  medium: '중간',
  hard:   '어려움',
}

export const difficultyColor = {
  easy:   { bg: '#ddf2e2', fg: '#156b2e' },
  medium: { bg: '#fff8ec', fg: '#8a5c00' },
  hard:   { bg: '#fff1f1', fg: '#991f1f' },
}
