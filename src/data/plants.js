export const plants = [
  {
    id: 'sansevieria',
    name: '산세베리아',
    difficulty: 'easy',
    theme: { main: '#6ba259', accent: '#8bbf75' },
    description: '공기정화에 탁월한 식물. 물을 자주 안 줘도 잘 자라요.',
    recommendReason: '가장 잘 죽지 않는 식물. 입문자에게 가장 추천돼요.',
    sunPref: 'low',
  },
  {
    id: 'monstera',
    name: '몬스테라',
    difficulty: 'easy',
    theme: { main: '#c2a05a', accent: '#d8b96e' },
    description: '큼직한 잎이 매력적인 인기 관엽식물이에요.',
    recommendReason: '실내 인테리어 식물로 인기. 관리도 쉬워요.',
    sunPref: 'low',
  },
  {
    id: 'tomato',
    name: '방울토마토',
    difficulty: 'medium',
    theme: { main: '#d44545', accent: '#e8666c' },
    description: '꾸준한 햇빛과 관수가 필요해요. 수확 보람이 커요.',
    recommendReason: '꾸준한 관리에 보람이 따르는 인기 식물이에요.',
    sunPref: 'high',
  },
  {
    id: 'lettuce',
    name: '상추',
    difficulty: 'easy',
    theme: { main: '#8b5a9b', accent: '#a672ba' },
    description: '잎채소의 대표주자. 빠르게 자라고 수확이 쉬워요.',
    recommendReason: '초보에게 가장 잘 맞는 잎채소예요.',
    sunPref: 'low',
  },
  {
    id: 'greenOnion',
    name: '대파',
    difficulty: 'easy',
    theme: { main: '#9eaa55', accent: '#b3c06d' },
    description: '뿌리만 있어도 다시 자라는 강한 식물이에요.',
    recommendReason: '한 번 사면 계속 수확 가능. 식비 절약에 좋아요.',
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
