import { useMemo, useState } from 'react'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import SensorMetricCard from '../components/SensorMetricCard'
import { DeviceIcon } from '../components/Device'
import { DEVICE_KEYS, deviceLabels } from '../data/devices'
import { greenhouses, metricLabels, sensorOrder } from '../data/greenhouses'
import { generateHistory } from '../data/sensorHistory'

const modeOptions = [
  { id: 'virtual', label: '가상' },
  { id: 'real',    label: '실제' },
]

function Sensor() {
  const [activeId, setActiveId] = useState('gh1')
  const [sensorMode, setSensorMode] = useState('virtual')

  const active = greenhouses.find(g => g.id === activeId)

  const histories = useMemo(() => (
    Object.fromEntries(
      sensorOrder.map(key => [
        key,
        generateHistory(activeId, key, active.sensors[key].value),
      ])
    )
  ), [activeId, active])

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

      {/* 실시간 센서 4종 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 10,
      }}>
        {sensorOrder.map(key => {
          const m = active.sensors[key]
          return (
            <SensorMetricCard
              key={key}
              id={`${activeId}-${key}`}
              label={metricLabels[key]}
              value={m.value}
              unit={m.unit}
              status={m.status}
              statusText={m.statusText}
              history={histories[key]}
            />
          )
        })}
      </div>

      {/* 디바이스 제어 — key={activeId}로 온실 변경 시 자연 리셋 */}
      <DeviceControlPanel
        key={activeId}
        initialDevices={active.devices}
        initialAutoControl={active.autoControl}
      />

      {/* 다음 단계에서 채울 영역 */}
      <SectionPlaceholder title="이벤트 로그 (전체)" hint="필터 + 페이지네이션" />

    </div>
  )
}

function DeviceControlPanel({ initialDevices, initialAutoControl }) {
  const [autoControl, setAutoControl] = useState(initialAutoControl)
  const [devices, setDevices] = useState(initialDevices)

  const toggleDevice = (key) => (next) => {
    setDevices(prev => ({ ...prev, [key]: next }))
  }

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e8e8e8',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 자동제어 헤더 */}
      <div style={{
        padding: '12px 14px',
        background: '#f8fdf9',
        borderBottom: '0.5px solid #ddf2e2',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
            자동제어
          </div>
          <div style={{ fontSize: 10.5, color: '#666', marginTop: 2, lineHeight: 1.4 }}>
            {autoControl
              ? '룰엔진이 임계값에 따라 디바이스를 자동으로 제어해요.'
              : '디바이스를 수동으로 제어할 수 있어요.'}
          </div>
        </div>
        <ToggleSwitch
          checked={autoControl}
          onChange={setAutoControl}
          size="lg"
        />
      </div>

      {/* 디바이스 3개 */}
      <div>
        {DEVICE_KEYS.map((key, i) => (
          <DeviceRow
            key={key}
            deviceKey={key}
            on={devices[key]}
            disabled={autoControl}
            onToggle={toggleDevice(key)}
            isLast={i === DEVICE_KEYS.length - 1}
          />
        ))}
      </div>
    </div>
  )
}

function DeviceRow({ deviceKey, on, disabled, onToggle, isLast }) {
  return (
    <div style={{
      padding: '11px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: isLast ? 'none' : '0.5px solid #f0f0f0',
      opacity: disabled ? 0.55 : 1,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: on ? '#ddf2e2' : '#f5f5f5',
        color: on ? '#2ea84e' : '#aaa',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <DeviceIcon name={deviceKey} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>
          {deviceLabels[deviceKey]}
        </div>
        <div style={{
          fontSize: 10.5, fontWeight: 600, marginTop: 1,
          color: on ? '#2ea84e' : '#aaa',
        }}>
          {on ? 'ON' : 'OFF'}
        </div>
      </div>
      <ToggleSwitch checked={on} disabled={disabled} onChange={onToggle} />
    </div>
  )
}

function ToggleSwitch({ checked, disabled, onChange, size = 'md' }) {
  const w = size === 'lg' ? 42 : 32
  const h = size === 'lg' ? 24 : 18
  const pad = 2
  const knob = h - pad * 2

  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: w, height: h,
        borderRadius: h / 2,
        background: disabled ? '#e0e0e0' : (checked ? '#2ea84e' : '#cfcfcf'),
        border: 'none',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'background .2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: pad,
        left: checked ? w - knob - pad : pad,
        width: knob, height: knob,
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
        transition: 'left .2s',
        display: 'block',
      }} />
    </button>
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
