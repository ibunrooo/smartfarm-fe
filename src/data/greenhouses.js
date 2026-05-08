export const metricLabels = {
  temp:     '온도',
  humidity: '습도',
  soil:     '토양수분',
  lux:      '조도',
}

export const sensorOrder = ['temp', 'humidity', 'soil', 'lux']

export const LUX_INFO = '조도(lux)는 빛의 세기 단위예요. 잎채소는 5,000~15,000 lux, 열매채소는 20,000 lux 이상이 적정합니다.'

export const greenhouses = [
  {
    id: 'gh1',
    name: '산세베리아 온실',
    plant: {
      name: '산세베리아',
      sub: '실내 · 서울 · 등록 24일째',
      status: '정상 운영 중',
      theme: { main: '#6ba259', accent: '#8bbf75' },
    },
    sensors: {
      temp:     { value: 23,    unit: '°C',  status: 'ok', statusText: '적정' },
      humidity: { value: 50,    unit: '%',   status: 'ok', statusText: '적정' },
      soil:     { value: 48,    unit: '%',   status: 'ok', statusText: '적정' },
      lux:      { value: 6500,  unit: 'lux', status: 'ok', statusText: '적정' },
    },
    devices: { pump: false, fan: false, led: false },
    autoControl: true,
    weather: { temp: 22, sky: 'cloudy', summary: '흐림' },
    logs: [
      { category: 'water',  text: '주간 점검 완료',     time: '09:30' },
      { category: 'system', text: '센서 데이터 정상',   time: '08:00' },
    ],
    alert: null,
  },
  {
    id: 'gh2',
    name: '몬스테라 온실',
    plant: {
      name: '몬스테라',
      sub: '실내 · 서울 · 등록 14일째',
      status: '정상 운영 중',
      theme: { main: '#c2a05a', accent: '#d8b96e' },
    },
    sensors: {
      temp:     { value: 25,    unit: '°C',  status: 'ok', statusText: '적정' },
      humidity: { value: 65,    unit: '%',   status: 'ok', statusText: '적정' },
      soil:     { value: 55,    unit: '%',   status: 'ok', statusText: '적정' },
      lux:      { value: 4200,  unit: 'lux', status: 'ok', statusText: '적정' },
    },
    devices: { pump: false, fan: false, led: false },
    autoControl: true,
    weather: { temp: 22, sky: 'cloudy', summary: '흐림' },
    logs: [
      { category: 'water', text: '자동 급수 완료', time: '07:00' },
    ],
    alert: null,
  },
  {
    id: 'gh3',
    name: '방울토마토 온실',
    plant: {
      name: '방울토마토',
      sub: '실외 · 서울 · 등록 32일째',
      status: '정상 운영 중',
      theme: { main: '#d44545', accent: '#e8666c' },
    },
    sensors: {
      temp:     { value: 27,    unit: '°C',  status: 'ok', statusText: '적정' },
      humidity: { value: 48,    unit: '%',   status: 'ok', statusText: '적정' },
      soil:     { value: 58,    unit: '%',   status: 'ok', statusText: '적정' },
      lux:      { value: 24000, unit: 'lux', status: 'ok', statusText: '적정' },
    },
    devices: { pump: false, fan: false, led: false },
    autoControl: true,
    weather: { temp: 22, sky: 'rain', summary: '비 예보' },
    logs: [
      { category: 'water',  text: '자동 급수 완료',               time: '08:00' },
      { category: 'system', text: '외부 기상 업데이트 (비 예보)', time: '12:05' },
    ],
    alert: null,
  },
  {
    id: 'gh4',
    name: '상추 온실',
    plant: {
      name: '상추',
      sub: '실내 · 서울 · 등록 18일째',
      status: '정상 운영 중',
      theme: { main: '#8b5a9b', accent: '#a672ba' },
    },
    sensors: {
      temp:     { value: 24,    unit: '°C',  status: 'ok',   statusText: '적정' },
      humidity: { value: 55,    unit: '%',   status: 'warn', statusText: '다소 높음' },
      soil:     { value: 32,    unit: '%',   status: 'bad',  statusText: '주의' },
      lux:      { value: 8500,  unit: 'lux', status: 'ok',   statusText: '적정' },
    },
    devices: { pump: false, fan: true, led: false },
    autoControl: true,
    weather: { temp: 22, sky: 'rain', summary: '비 예보' },
    logs: [
      { category: 'water',  text: '자동 급수 완료',                time: '14:32' },
      { category: 'alert',  text: '토양 수분 임계치 도달',          time: '14:15' },
      { category: 'system', text: '외부 기상 업데이트 (비 예보)',   time: '12:05' },
    ],
    alert: { message: '토양 수분이 임계치(30%)에 근접하고 있어요', type: 'warn' },
  },
  {
    id: 'gh5',
    name: '대파 온실',
    plant: {
      name: '대파',
      sub: '실외 · 서울 · 등록 50일째',
      status: '정상 운영 중',
      theme: { main: '#9eaa55', accent: '#b3c06d' },
    },
    sensors: {
      temp:     { value: 21,    unit: '°C',  status: 'ok', statusText: '적정' },
      humidity: { value: 58,    unit: '%',   status: 'ok', statusText: '적정' },
      soil:     { value: 60,    unit: '%',   status: 'ok', statusText: '적정' },
      lux:      { value: 19000, unit: 'lux', status: 'ok', statusText: '적정' },
    },
    devices: { pump: false, fan: false, led: false },
    autoControl: true,
    weather: { temp: 22, sky: 'cloudy', summary: '흐림' },
    logs: [
      { category: 'water',  text: '자동 급수 완료',     time: '06:30' },
      { category: 'system', text: '센서 데이터 정상',   time: '06:00' },
    ],
    alert: null,
  },
]
