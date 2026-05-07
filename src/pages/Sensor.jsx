import { useState } from 'react'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import { greenhouses } from '../data/greenhouses'

const modeOptions = [
  { id: 'virtual', label: '가상' },
  { id: 'real',    label: '실제' },
]

function Sensor() {
  const [activeId, setActiveId] = useState('gh1')
  const [sensorMode, setSensorMode] = useState('virtual')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

      {/* 헤더: 온실 스위처 + 센서 모드 토글 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <GreenhouseSwitcher
          greenhouses={greenhouses}
          activeId={activeId}
          onChange={setActiveId}
          onAdd={() => window.alert('온실 추가 — 추후 구현')}
        />
        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex',
          background: '#f5f5f5',
          borderRadius: 10,
          padding: 3,
          gap: 2,
        }}>
          {modeOptions.map(opt => {
            const isActive = sensorMode === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setSensorMode(opt.id)}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: 8,
                  background: isActive ? '#fff' : 'transparent',
                  color: isActive ? '#1a1a1a' : '#999',
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'var(--ff)',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,.06)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 모드 안내 */}
      <div style={{
        padding: '8px 12px',
        background: sensorMode === 'virtual' ? '#fff8ec' : '#f2faf3',
        border: `0.5px solid ${sensorMode === 'virtual' ? '#fde8b0' : '#b4e3be'}`,
        borderRadius: 10,
        fontSize: 11.5,
        color: sensorMode === 'virtual' ? '#8a5c00' : '#1e8a3c',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700 }}>
          {sensorMode === 'virtual' ? '가상 모드' : '실제 모드'}
        </span>
        <span style={{ opacity: .5 }}>·</span>
        <span>
          {sensorMode === 'virtual'
            ? '시뮬레이션 데이터로 동작 중이에요. 디바이스 제어도 시뮬레이션입니다.'
            : '실제 센서/디바이스에 연결되어 있어요.'}
        </span>
      </div>

      {/* 다음 단계에서 채울 영역들 */}
      <SectionPlaceholder title="실시간 센서 (4종)" hint="온도 / 습도 / 토양수분 / 조도 + 시계열 차트" />
      <SectionPlaceholder title="디바이스 제어"     hint="펌프 / 환기팬 / LED 토글 + 자동제어 스위치" />
      <SectionPlaceholder title="이벤트 로그 (전체)" hint="필터 + 페이지네이션" />

    </div>
  )
}

function SectionPlaceholder({ title, hint }) {
  return (
    <div style={{
      background: '#fafafa',
      border: '0.5px dashed #d0d0d0',
      borderRadius: 14,
      padding: '24px 16px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#666', marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 10.5, color: '#aaa' }}>
        {hint}
      </div>
    </div>
  )
}

export default Sensor
