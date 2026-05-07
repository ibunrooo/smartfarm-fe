import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import MetricCard from '../components/MetricCard'
import EventLog from '../components/EventLog'
import { DeviceIcon } from '../components/Device'
import { deviceLabels } from '../data/devices'
import { greenhouses, metricLabels, sensorOrder, LUX_INFO } from '../data/greenhouses'

function Home() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState('gh1')
  const [showLuxInfo, setShowLuxInfo] = useState(false)

  const active = greenhouses.find(g => g.id === activeId)
  const { plant, sensors, devices, autoControl, weather, logs, alert: alertData } = active

  const goSensor = () => navigate('/sensor')

  return (
    <div>
      {alertData && (
        <div style={{ margin: '-20px -40px 16px' }}>
          <AlertBanner message={alertData.message} type={alertData.type} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

        <GreenhouseSwitcher
          greenhouses={greenhouses}
          activeId={activeId}
          onChange={setActiveId}
          onAdd={() => window.alert('온실 추가 — 추후 구현')}
        />

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

        {/* 디바이스 뱃지 + 자동제어 — 클릭 시 Sensor로 */}
        <div
          onClick={goSensor}
          title="센서 페이지로 이동"
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            flexWrap: 'wrap',
            cursor: 'pointer',
          }}
        >
          {Object.entries(devices).map(([key, on]) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 9px',
              background: on ? '#ddf2e2' : '#f5f5f5',
              border: `0.5px solid ${on ? '#b4e3be' : '#e8e8e8'}`,
              borderRadius: 18,
              fontSize: 10.5, fontWeight: 600,
              color: on ? '#156b2e' : '#999',
            }}>
              <DeviceIcon name={key} size={11} />
              {deviceLabels[key]}
              <span style={{
                fontSize: 9, fontWeight: 700,
                marginLeft: 1,
                color: on ? '#2ea84e' : '#bbb',
              }}>
                {on ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}
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

        {/* 수치 카드 4개 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: 8,
        }}>
          {sensorOrder.map((key) => {
            const m = sensors[key]
            const isLux = key === 'lux'
            return (
              <MetricCard
                key={key}
                label={metricLabels[key]}
                value={m.value}
                unit={m.unit}
                status={m.status}
                statusText={m.statusText}
                info={isLux ? LUX_INFO : null}
                infoOpen={isLux && showLuxInfo}
                onInfoToggle={isLux ? () => setShowLuxInfo(v => !v) : undefined}
                onClick={goSensor}
              />
            )
          })}
        </div>

        {/* 차트 — 클릭 시 Sensor로 */}
        <div
          onClick={goSensor}
          title="센서 페이지로 이동"
          style={{
            background: '#f8fdf9', border: '0.5px solid #ddf2e2',
            borderRadius: 14, padding: '12px 13px',
            cursor: 'pointer',
          }}
        >
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

        <EventLog logs={logs} onShowAll={goSensor} />

      </div>
    </div>
  )
}

export default Home
