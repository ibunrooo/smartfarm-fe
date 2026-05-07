export const plants = [
  {
    id: 'lettuce',
    name: '상추',
    scientificName: 'Lactuca sativa',
    difficulty: 'easy',
    color: '#7dcc8f',
    description: '잎채소의 대표주자. 빠르게 자라고 수확이 쉬워요.',
    recommendReason: '초보에게 가장 잘 맞는 잎채소예요. 햇빛이 적어도 자라요.',
    sunPref: 'low',
  },
  {
    id: 'tomato',
    name: '방울토마토',
    scientificName: 'Solanum lycopersicum',
    difficulty: 'medium',
    color: '#e84040',
    description: '꾸준한 햇빛과 관수가 필요해요. 수확 보람이 커요.',
    recommendReason: '꾸준한 관리에 보람이 따르는 인기 식물이에요.',
    sunPref: 'high',
  },
  {
    id: 'basil',
    name: '바질',
    scientificName: 'Ocimum basilicum',
    difficulty: 'easy',
    color: '#4db866',
    description: '향이 좋은 허브. 실내 창가에서도 잘 자라요.',
    recommendReason: '실내 창가에서도 잘 자라고 향이 좋은 허브예요.',
    sunPref: 'low',
  },
  {
    id: 'pepper',
    name: '청양고추',
    scientificName: 'Capsicum annuum',
    difficulty: 'medium',
    color: '#f0a500',
    description: '햇빛을 좋아해요. 매운맛은 햇빛량에 비례.',
    recommendReason: '햇빛이 풍부한 환경에서 잘 자라요.',
    sunPref: 'high',
  },
  {
    id: 'strawberry',
    name: '딸기',
    scientificName: 'Fragaria',
    difficulty: 'hard',
    color: '#e84090',
    description: '도전 과제. 통풍과 일조량 관리가 핵심이에요.',
    recommendReason: '관리가 까다롭지만 수확의 즐거움이 가장 커요.',
    sunPref: 'high',
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

export function recommendPlants({ experience, sunlight }) {
  const ranked = plants.map(plant => {
    let score = 0

    if (experience === 'beginner') {
      if (plant.difficulty === 'easy')        score += 3
      else if (plant.difficulty === 'medium') score += 1
    } else if (experience === 'intermediate') {
      if (plant.difficulty === 'medium')      score += 3
      else if (plant.difficulty === 'easy')   score += 1
      else if (plant.difficulty === 'hard')   score += 1
    } else if (experience === 'advanced') {
      if (plant.difficulty === 'hard')        score += 3
      else if (plant.difficulty === 'medium') score += 1
    }

    if (sunlight === plant.sunPref) score += 2

    return { plant, score }
  })

  ranked.sort((a, b) => b.score - a.score)
  return ranked.slice(0, 3).map(r => r.plant)
}
