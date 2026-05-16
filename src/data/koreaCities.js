// 한국 주요 도시 — OpenWeather 데이터 보유 도시 위주 큐레이션
// 시도(province) → 시군구(cities) 계층 구조

export const koreaRegions = [
  {
    province: '서울특별시',
    cities: [
      { name: '서울', lat: 37.5665, lon: 126.9780 },
    ],
  },
  {
    province: '부산광역시',
    cities: [
      { name: '부산', lat: 35.1796, lon: 129.0756 },
    ],
  },
  {
    province: '인천광역시',
    cities: [
      { name: '인천', lat: 37.4563, lon: 126.7052 },
    ],
  },
  {
    province: '대구광역시',
    cities: [
      { name: '대구', lat: 35.8714, lon: 128.6014 },
    ],
  },
  {
    province: '광주광역시',
    cities: [
      { name: '광주', lat: 35.1595, lon: 126.8526 },
    ],
  },
  {
    province: '대전광역시',
    cities: [
      { name: '대전', lat: 36.3504, lon: 127.3845 },
    ],
  },
  {
    province: '울산광역시',
    cities: [
      { name: '울산', lat: 35.5384, lon: 129.3114 },
    ],
  },
  {
    province: '세종특별자치시',
    cities: [
      { name: '세종', lat: 36.4801, lon: 127.2891 },
    ],
  },
  {
    province: '경기도',
    cities: [
      { name: '수원시',   lat: 37.2636, lon: 127.0286 },
      { name: '성남시',   lat: 37.4386, lon: 127.1378 },
      { name: '용인시',   lat: 37.2410, lon: 127.1776 },
      { name: '안양시',   lat: 37.3943, lon: 126.9568 },
      { name: '안산시',   lat: 37.3219, lon: 126.8309 },
      { name: '부천시',   lat: 37.5036, lon: 126.7660 },
      { name: '고양시',   lat: 37.6584, lon: 126.8320 },
      { name: '의정부시', lat: 37.7381, lon: 127.0337 },
      { name: '남양주시', lat: 37.6363, lon: 127.2167 },
      { name: '파주시',   lat: 37.7600, lon: 126.7800 },
      { name: '평택시',   lat: 36.9921, lon: 127.1129 },
      { name: '화성시',   lat: 37.1996, lon: 126.8311 },
      { name: '광명시',   lat: 37.4795, lon: 126.8646 },
      { name: '시흥시',   lat: 37.3800, lon: 126.8030 },
      { name: '김포시',   lat: 37.6151, lon: 126.7158 },
      { name: '하남시',   lat: 37.5394, lon: 127.2148 },
      { name: '이천시',   lat: 37.2723, lon: 127.4350 },
      { name: '오산시',   lat: 37.1499, lon: 127.0772 },
      { name: '안성시',   lat: 37.0080, lon: 127.2797 },
      { name: '구리시',   lat: 37.5944, lon: 127.1296 },
    ],
  },
  {
    province: '강원특별자치도',
    cities: [
      { name: '춘천시', lat: 37.8813, lon: 127.7298 },
      { name: '원주시', lat: 37.3422, lon: 127.9202 },
      { name: '강릉시', lat: 37.7519, lon: 128.8761 },
      { name: '동해시', lat: 37.5246, lon: 129.1142 },
      { name: '속초시', lat: 38.2070, lon: 128.5918 },
      { name: '삼척시', lat: 37.4500, lon: 129.1650 },
    ],
  },
  {
    province: '충청북도',
    cities: [
      { name: '청주시', lat: 36.6424, lon: 127.4890 },
      { name: '충주시', lat: 36.9910, lon: 127.9259 },
      { name: '제천시', lat: 37.1326, lon: 128.1910 },
    ],
  },
  {
    province: '충청남도',
    cities: [
      { name: '천안시', lat: 36.8151, lon: 127.1139 },
      { name: '공주시', lat: 36.4467, lon: 127.1190 },
      { name: '아산시', lat: 36.7898, lon: 127.0019 },
      { name: '서산시', lat: 36.7848, lon: 126.4500 },
      { name: '논산시', lat: 36.1872, lon: 127.0987 },
      { name: '당진시', lat: 36.8898, lon: 126.6452 },
    ],
  },
  {
    province: '전북특별자치도',
    cities: [
      { name: '전주시', lat: 35.8242, lon: 127.1480 },
      { name: '군산시', lat: 35.9676, lon: 126.7368 },
      { name: '익산시', lat: 35.9483, lon: 126.9577 },
      { name: '정읍시', lat: 35.5697, lon: 126.8559 },
      { name: '남원시', lat: 35.4163, lon: 127.3905 },
    ],
  },
  {
    province: '전라남도',
    cities: [
      { name: '목포시', lat: 34.8118, lon: 126.3922 },
      { name: '여수시', lat: 34.7604, lon: 127.6622 },
      { name: '순천시', lat: 34.9506, lon: 127.4872 },
      { name: '나주시', lat: 35.0157, lon: 126.7108 },
      { name: '광양시', lat: 34.9407, lon: 127.6957 },
    ],
  },
  {
    province: '경상북도',
    cities: [
      { name: '포항시', lat: 36.0190, lon: 129.3435 },
      { name: '경주시', lat: 35.8562, lon: 129.2247 },
      { name: '안동시', lat: 36.5684, lon: 128.7294 },
      { name: '구미시', lat: 36.1196, lon: 128.3447 },
      { name: '영주시', lat: 36.8056, lon: 128.6240 },
      { name: '경산시', lat: 35.8251, lon: 128.7411 },
    ],
  },
  {
    province: '경상남도',
    cities: [
      { name: '창원시', lat: 35.2280, lon: 128.6817 },
      { name: '진주시', lat: 35.1800, lon: 128.1076 },
      { name: '통영시', lat: 34.8544, lon: 128.4334 },
      { name: '김해시', lat: 35.2285, lon: 128.8894 },
      { name: '거제시', lat: 34.8800, lon: 128.6210 },
      { name: '양산시', lat: 35.3380, lon: 129.0345 },
    ],
  },
  {
    province: '제주특별자치도',
    cities: [
      { name: '제주시',   lat: 33.4996, lon: 126.5312 },
      { name: '서귀포시', lat: 33.2541, lon: 126.5601 },
    ],
  },
]

// city name으로 lat/lon 역조회 (저장된 도시명으로 다시 찾을 때)
export function findCityCoords(cityName) {
  if (!cityName) return null
  for (const region of koreaRegions) {
    const found = region.cities.find(c => c.name === cityName)
    if (found) return { province: region.province, ...found }
  }
  return null
}

// lat/lon에서 가장 가까운 city를 역조회
export function findCityByCoords(lat, lon) {
  if (lat == null || lon == null) return null
  const targetLat = Number(lat)
  const targetLon = Number(lon)
  if (Number.isNaN(targetLat) || Number.isNaN(targetLon)) return null
  for (const region of koreaRegions) {
    const c = region.cities.find(x =>
      Math.abs(x.lat - targetLat) < 0.01 && Math.abs(x.lon - targetLon) < 0.01
    )
    if (c) return { province: region.province, ...c }
  }
  return null
}
