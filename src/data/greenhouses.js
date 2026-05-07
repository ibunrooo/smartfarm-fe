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
    name: '상추 온실',
    plant: {
      name: '상추 (Lactuca)',
      sub: '실내 · 서울 · 등록 18일째',
      status: '정상 운영 중',
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
      { type: 'green', text: '자동 급수 완료',               time: '14:32' },
      { type: 'amber', text: '토양 수분 임계치 도달',         time: '14:15' },
      { type: 'blue',  text: '외부 기상 업데이트 (비 예보)',  time: '12:05' },
    ],
    alert: { message: '토양 수분이 임계치(30%)에 근접하고 있어요', type: 'warn' },
  },
  {
    id: 'gh2',
    name: '토마토 온실',
    plant: {
      name: '방울토마토',
      sub: '실외 · 서울 · 등록 32일째',
      status: '정상 운영 중',
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
      { type: 'green', text: '자동 급수 완료',               time: '08:00' },
      { type: 'blue',  text: '외부 기상 업데이트 (비 예보)', time: '12:05' },
    ],
    alert: null,
  },
  {
    id: 'gh3',
    name: '바질 온실',
    plant: {
      name: '스위트 바질',
      sub: '실내 · 서울 · 등록 7일째',
      status: 'LED 보광 중',
    },
    sensors: {
      temp:     { value: 22,    unit: '°C',  status: 'ok',   statusText: '적정' },
      humidity: { value: 62,    unit: '%',   status: 'warn', statusText: '다소 높음' },
      soil:     { value: 45,    unit: '%',   status: 'ok',   statusText: '적정' },
      lux:      { value: 3200,  unit: 'lux', status: 'warn', statusText: '부족' },
    },
    devices: { pump: false, fan: false, led: true },
    autoControl: true,
    weather: { temp: 22, sky: 'rain', summary: '비 예보' },
    logs: [
      { type: 'green', text: 'LED 자동 점등',  time: '17:30' },
      { type: 'amber', text: '조도 부족 감지', time: '17:28' },
    ],
    alert: { message: '오후 조도가 낮아 LED 보광 중입니다', type: 'warn' },
  },
]
