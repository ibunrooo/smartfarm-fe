import AlertBanner from '../components/AlertBanner'

const dummyData = {
  plant: {
    name: '상추 (Lactuca)',
    sub: '실내 · 서울 · 등록 18일째',
    status: '정상 운영 중',
  },
  metrics: [
    { label: '온도',     value: 24, unit: '°C', status: 'ok',   statusText: '적정' },
    { label: '습도',     value: 55, unit: '%',  status: 'warn', statusText: '다소 높음' },
    { label: '토양수분', value: 32, unit: '%',  status: 'bad',  statusText: '주의' },
  ],
  logs: [
    { type: 'green', text: '자동 급수 완료',               time: '14:32' },
    { type: 'amber', text: '토양 수분 임계치 도달',         time: '14:15' },
    { type: 'blue',  text: '외부 기상 업데이트 (비 예보)',  time: '12:05' },
  ],
  alert: '토양 수분이 임계치(30%)에 근접하고 있어요',
}

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

function Home() {
  const { plant, metrics, logs, alert } = dummyData

  return (
    <div>
      {/* 알림 배너 */}
      <div style={{ margin: '-20px -40px 16px' }}>
        <AlertBanner message={alert} type="warn" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

        {/* 식물 카드 */}
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

        {/* 수치 카드 3개 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {metrics.map((m) => (
            <div key={m.label} style={{
              background: '#f8fdf9',
              border: '0.5px solid #ddf2e2',
              borderRadius: 12, padding: '10px 10px 9px',
            }}>
              <div style={{ fontSize: 10, fontWeight: 500, color: '#999', marginBottom: 4 }}>
                {m.label}
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
            </div>
          ))}
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