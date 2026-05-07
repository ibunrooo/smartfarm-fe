import { useState } from 'react'
import AlertBanner from '../components/AlertBanner'

const greenhouses = [
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

const tagStyle = {
  ok:   { background: '#ddf2e2', color: '#156b2e' },
  warn: { background: '#fff8ec', color: '#8a5c00' },
  bad:  { background: '#fff1f1', color: '#991f1f' },
}

const dotColor = {
  green: '#4db866',
  amber: '#f0a500',
  blue:  '#3b82c4',
}

const metricLabels = {
  temp:     '온도',
  humidity: '습도',
  soil:     '토양수분',
  lux:      '조도',
}

const LUX_INFO = '조도(lux)는 빛의 세기 단위예요. 잎채소는 5,000~15,000 lux, 열매채소는 20,000 lux 이상이 적정합니다.'

const deviceMeta = {
  pump: { label: '펌프', icon: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5C6 1.5 3 5 3 7.5a3 3 0 006 0C9 5 6 1.5 6 1.5z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
    </svg>
  )},
  fan:  { label: '환기팬', icon: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="1" fill="currentColor"/>
      <path d="M6 5V2M6 7v3M5 6H2M7 6h3"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )},
  led:  { label: 'LED', icon: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5a3.5 3.5 0 00-2 6.4V9.5h4V7.9A3.5 3.5 0 006 1.5zM4.5 10.5h3"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
  )},
}

function Home() {
  const [activeId, setActiveId] = useState('gh1')
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [showLuxInfo, setShowLuxInfo] = useState(false)

  const active = greenhouses.find(g => g.id === activeId)
  const { plant, sensors, devices, autoControl, weather, logs, alert: alertData } = active

  const sensorOrder = ['temp', 'humidity', 'soil', 'lux']

  return (
    <div>
      {/* 알림 배너 */}
      {alertData && (
        <div style={{ margin: '-20px -40px 16px' }}>
          <AlertBanner message={alertData.message} type={alertData.type} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

        {/* 온실 스위처 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
          <button
            onClick={() => setSwitcherOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px',
              background: '#fff',
              border: '0.5px solid #e8e8e8',
              borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              color: '#1a1a1a', cursor: 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#2ea84e',
            }} />
            {active.name}
            <span style={{ fontSize: 9, color: '#aaa', marginLeft: 2 }}>▼</span>
          </button>
          <button
            onClick={() => window.alert('온실 추가 — 추후 구현')}
            title="온실 추가"
            style={{
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#f8fdf9',
              border: '0.5px solid #ddf2e2',
              borderRadius: 9,
              color: '#2ea84e', fontSize: 16, fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            +
          </button>

          {switcherOpen && (
            <div style={{
              position: 'absolute', top: 38, left: 0, zIndex: 10,
              minWidth: 160,
              background: '#fff',
              border: '0.5px solid #e8e8e8',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,.06)',
              padding: 4,
              display: 'flex', flexDirection: 'column',
            }}>
              {greenhouses.map(g => {
                const isActive = g.id === activeId
                return (
                  <button
                    key={g.id}
                    onClick={() => { setActiveId(g.id); setSwitcherOpen(false) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      padding: '8px 10px',
                      background: isActive ? '#f2faf3' : 'none',
                      border: 'none', borderRadius: 7,
                      fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1e8a3c' : '#555',
                      cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--ff)',
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: isActive ? '#2ea84e' : '#ccc',
                    }} />
                    {g.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 식물 카드 (+ 날씨 미니) */}
        <div style={{
          background: '#2ea84e', borderRadius: 14,
          padding: 14, display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -18, top: -18,
            width: 90, height: 90,
            background: '#4db866', borderRadius: '50%', opacity: .35,
          }} />

          {/* 날씨 미니 (자리만) */}
          <div style={{
            position: 'absolute', right: 12, top: 10,
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,.18)',
            border: '0.5px solid rgba(255,255,255,.22)',
            borderRadius: 18, padding: '3px 8px',
            fontSize: 10.5, color: '#fff', zIndex: 1,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M3 6.5a2 2 0 011.7-2 2.5 2.5 0 014.7.6A1.8 1.8 0 019 8.5H4a1.5 1.5 0 01-1-2zM4.5 10l-.5 1M6 10l-.5 1M7.5 10l-.5 1"
                stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity=".9"/>
            </svg>
            {weather.temp}° · {weather.summary}
          </div>

          <div style={{
            width: 48, height: 48,
            background: 'rgba(255,255,255,.18)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, zIndex: 1,
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
                fill="white" opacity=".85"/>
              <line x1="13" y1="9" x2="13" y2="19"
                stroke="rgba(46,168,78,.8)" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
                stroke="rgba(46,168,78,.8)" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div style={{ zIndex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{plant.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', marginTop: 2 }}>{plant.sub}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 7,
              background: 'rgba(255,255,255,.15)',
              border: '0.5px solid rgba(255,255,255,.25)',
              borderRadius: 20, padding: '3px 9px',
              fontSize: 10.5, color: '#fff',
            }}>
              <div style={{ width: 5, height: 5, background: '#a8f0b2', borderRadius: '50%' }} />
              {plant.status}
            </div>
          </div>
        </div>

        {/* 디바이스 뱃지 + 자동제어 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          flexWrap: 'wrap',
        }}>
          {Object.entries(devices).map(([key, on]) => {
            const meta = deviceMeta[key]
            return (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 9px',
                background: on ? '#ddf2e2' : '#f5f5f5',
                border: `0.5px solid ${on ? '#b4e3be' : '#e8e8e8'}`,
                borderRadius: 18,
                fontSize: 10.5, fontWeight: 600,
                color: on ? '#156b2e' : '#999',
              }}>
                {meta.icon}
                {meta.label}
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  marginLeft: 1,
                  color: on ? '#2ea84e' : '#bbb',
                }}>
                  {on ? 'ON' : 'OFF'}
                </span>
              </div>
            )
          })}
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 9px',
            background: autoControl ? '#f2faf3' : '#fafafa',
            border: `0.5px solid ${autoControl ? '#b4e3be' : '#e8e8e8'}`,
            borderRadius: 18,
            fontSize: 10.5, fontWeight: 600,
            color: autoControl ? '#1e8a3c' : '#999',
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
              <path d="M6 1.5v1.2M6 9.3v1.2M1.5 6h1.2M9.3 6h1.2"
                stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
            </svg>
            자동제어 {autoControl ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* 수치 카드 4개 (반응형 grid) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 8,
        }}>
          {sensorOrder.map((key) => {
            const m = sensors[key]
            const isLux = key === 'lux'
            return (
              <div key={key} style={{
                background: '#f8fdf9',
                border: '0.5px solid #ddf2e2',
                borderRadius: 12, padding: '10px 10px 9px',
                position: 'relative',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 10, fontWeight: 500, color: '#999', marginBottom: 4,
                }}>
                  {metricLabels[key]}
                  {isLux && (
                    <button
                      onClick={() => setShowLuxInfo(v => !v)}
                      title="조도 단위 설명"
                      style={{
                        width: 12, height: 12,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '0.5px solid #b4e3be',
                        background: showLuxInfo ? '#2ea84e' : '#f8fdf9',
                        color: showLuxInfo ? '#fff' : '#2ea84e',
                        borderRadius: '50%',
                        fontSize: 8, fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'var(--ff)',
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      i
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#1a1a1a', lineHeight: 1 }}>
                  {m.value}
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#aaa' }}>{m.unit}</span>
                </div>
                <div style={{
                  display: 'inline-block', marginTop: 5,
                  fontSize: 9.5, fontWeight: 600,
                  padding: '2px 6px', borderRadius: 6,
                  ...tagStyle[m.status],
                }}>
                  {m.statusText}
                </div>

                {/* 조도 인포 툴팁 */}
                {isLux && showLuxInfo && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: 6, zIndex: 5,
                    background: '#1a1a1a', color: '#fff',
                    fontSize: 10.5, lineHeight: 1.5,
                    padding: '8px 10px', borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                  }}>
                    {LUX_INFO}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 차트 */}
        <div style={{
          background: '#f8fdf9', border: '0.5px solid #ddf2e2',
          borderRadius: 14, padding: '12px 13px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a1a' }}>토양 수분 (24h)</span>
            <span style={{
              fontSize: 9.5, fontWeight: 600,
              background: '#ddf2e2', color: '#156b2e',
              padding: '2px 7px', borderRadius: 7,
            }}>실시간</span>
          </div>
          <div style={{ position: 'relative' }}>
            <svg width="100%" height="56" viewBox="0 0 270 56" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4db866" stopOpacity="0.22"/>
                  <stop offset="100%" stopColor="#4db866" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0 32 C25 28,45 16,68 19 S105 40,130 36 S165 13,190 16 S225 42,250 38 S262 30,270 30"
                fill="none" stroke="#4db866" strokeWidth="1.6"/>
              <path d="M0 32 C25 28,45 16,68 19 S105 40,130 36 S165 13,190 16 S225 42,250 38 S262 30,270 30 L270 56 L0 56Z"
                fill="url(#chartGrad)"/>
              <line x1="0" y1="46" x2="270" y2="46"
                stroke="#e84040" strokeWidth=".8" strokeDasharray="4 3" opacity=".55"/>
            </svg>
            <div style={{
              position: 'absolute',
              bottom: -2, left: 4,
              fontSize: 10, color: '#e84040', opacity: .7,
              fontFamily: 'var(--ff)',
              pointerEvents: 'none',
            }}>
              임계 30%
            </div>
          </div>
        </div>

        {/* 이벤트 로그 */}
        <div style={{
          background: '#fff', border: '0.5px solid #e8e8e8',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <div style={{
            padding: '9px 13px 8px',
            borderBottom: '0.5px solid #e8e8e8',
            fontSize: 12.5, fontWeight: 600, color: '#1a1a1a',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            이벤트 로그
            <span style={{ fontSize: 11, color: '#2ea84e', fontWeight: 500 }}>전체 보기 →</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} style={{
              padding: '7px 13px',
              borderBottom: i < logs.length - 1 ? '0.5px solid #f0f0f0' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: 8,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: dotColor[log.type],
                marginTop: 4, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.4 }}>{log.text}</div>
                <div style={{ fontSize: 10, color: '#aaa' }}>{log.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default Home
