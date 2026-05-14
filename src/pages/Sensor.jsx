import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import SensorMetricCard from '../components/SensorMetricCard'
import SensorEventLog from '../components/SensorEventLog'
import { DeviceIcon } from '../components/Device'
import { DEVICE_KEYS, deviceLabels } from '../data/devices'
import { plants } from '../data/plants'
import { metricLabels, sensorOrder } from '../data/greenhouses'
import { getGreenhouse } from '../api/greenhouse'
import { getLatestSensor, getSensorHistory } from '../api/sensor'
import { getWeather } from '../api/weather'
import { getAlerts } from '../api/alerts'
import { getActuatorLogs, controlActuator } from '../api/actuator'
import { getMyGreenhouseIds } from '../utils/storage'

const modeOptions = [
  { id: 'virtual', label: '가상' },
  { id: 'real',    label: '실제' },
]

function deriveDeviceState(actuators) {
  const state = { pump: false, led: false, window: false }
  if (!Array.isArray(actuators)) return state
  // actuators가 최신순으로 정렬되어 있다고 가정
  for (const key of ['pump', 'led', 'window']) {
    const last = actuators.find(a => a?.actuator === key)
    if (last) state[key] = last.action === 'ON' || last.action === 'OPEN'
  }
  return state
}

function actionFor(actuator, on) {
  if (actuator === 'window') return on ? 'OPEN' : 'CLOSE'
  return on ? 'ON' : 'OFF'
}

function Sensor() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sensorMode, setSensorMode] = useState('virtual')

  const ids = useMemo(() => getMyGreenhouseIds(), [])
  const requestedId = searchParams.get('gh')
  const activeId = ids.includes(requestedId) ? requestedId : ids[0]

  const [metas, setMetas]       = useState([])
  const [latest, setLatest]     = useState(null)
  const [history, setHistory]   = useState([])
  const [weather, setWeather]   = useState(null)
  const [alerts, setAlerts]     = useState([])
  const [actuators, setActuators] = useState([])
  const [loading, setLoading]   = useState(() => !!activeId)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!activeId) return
    let cancelled = false

    Promise.all([
      Promise.all(ids.map(id => getGreenhouse(id).catch(() => null))),
      getLatestSensor(activeId).catch(() => null),
      getSensorHistory(activeId, 60).catch(() => []),
      getWeather(activeId).catch(() => null),
      getAlerts(activeId, 20).catch(() => []),
      getActuatorLogs(activeId).catch(() => []),
    ])
      .then(([metaList, latestData, historyData, weatherData, alertList, actuatorList]) => {
        if (cancelled) return
        setMetas(metaList.filter(Boolean))
        setLatest(latestData)
        setHistory(historyData)
        setWeather(weatherData)
        setAlerts(alertList)
        setActuators(actuatorList)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Sensor 데이터 조회 실패:', err)
        setError(err.message || '데이터를 불러오지 못했어요.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [activeId, ids])

  const setActiveId = (id) => setSearchParams({ gh: id })

  // 데이터 합성
  const switcherList = buildSwitcherList(metas, ids)
  const sensors      = buildSensors(latest, weather)
  const histories    = buildHistories(history)
  const eventLogs    = mergeEventLogs(alerts, actuators)
  const topAlert     = buildTopAlert(alerts)
  const noSensorData = !latest && (!Array.isArray(history) || history.length === 0)

  /* 빈 상태: 등록된 온실 없음 */
  if (!activeId) {
    return (
      <div style={{
        minHeight: 360,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, textAlign: 'center', color: '#666',
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a1a' }}>
          등록된 온실이 없어요
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          홈에서 식물을 먼저 추가해주세요.
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            marginTop: 6,
            padding: '10px 18px',
            background: '#2ea84e', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          + 식물 추가하기
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: 360,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#888', fontSize: 13.5,
      }}>
        센서 데이터를 불러오는 중…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

      {/* 헤더: 온실 스위처 + 센서 모드 토글 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <GreenhouseSwitcher
          greenhouses={switcherList}
          activeId={activeId}
          onChange={setActiveId}
        />
        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex',
          background: '#f5f5f5',
          borderRadius: 10,
          padding: 3,
          gap: 2,
          marginRight: 44,  // UserMenu 회피
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
                  fontSize: 13.5, fontWeight: isActive ? 700 : 500,
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

      {/* 긴급/주의 알림 */}
      {topAlert && (
        <AlertBanner
          message={topAlert.message}
          type={topAlert.type}
          variant="card"
        />
      )}

      {error && (
        <div style={{
          padding: '8px 12px',
          background: '#fff1f1',
          border: '0.5px solid #fcc',
          borderRadius: 10,
          fontSize: 12.5, color: '#991f1f',
        }}>
          <span style={{ fontWeight: 700 }}>오류</span>
          <span style={{ opacity: .4, margin: '0 6px' }}>·</span>
          <span>{error}</span>
        </div>
      )}

      {noSensorData && !error && (
        <div style={{
          padding: '10px 12px',
          background: '#f8fdf9',
          border: '0.5px solid #ddf2e2',
          borderRadius: 10,
          fontSize: 13, color: '#1e8a3c',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 700 }}>센서 데이터를 기다리는 중</span>
          <span style={{ opacity: .5 }}>·</span>
          <span style={{ color: '#444' }}>
            아직 수집된 측정값이 없어요. 잠시 후 자동으로 표시됩니다.
          </span>
        </div>
      )}

      {/* 모드 안내 */}
      <div style={{
        padding: '8px 12px',
        background: sensorMode === 'virtual' ? '#fff8ec' : '#f2faf3',
        border: `0.5px solid ${sensorMode === 'virtual' ? '#fde8b0' : '#b4e3be'}`,
        borderRadius: 10,
        fontSize: 13,
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
          const m = sensors[key]
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

      {/* 디바이스 제어 — BE control API 연동 */}
      <DeviceControlPanel
        key={activeId}
        greenhouseId={activeId}
        initialDevices={deriveDeviceState(actuators)}
        initialAutoControl={true}
      />

      {/* 이벤트 로그 (전체) */}
      <SensorEventLog logs={eventLogs} />

    </div>
  )
}

/* ────────────────────────────────────────
   BE 데이터 → 화면 형식 합성
   ──────────────────────────────────────── */

function buildSwitcherList(metas, ids) {
  return ids.map(id => {
    const meta = metas.find(m => m?.greenhouseId === id)
    if (!meta) return { id, name: id, plant: null }
    const plant = plants.find(p => p.id === meta.plantType)
    return {
      id,
      name: plant?.name ?? meta.plantType ?? id,
      plant: plant
        ? { name: plant.name, theme: plant.theme }
        : { name: meta.plantType ?? id },
    }
  })
}

function buildSensors(latest, weather) {
  return {
    temp: {
      value: latest?.temp ?? '-',
      unit: '°C',
      ...statusFor('temp', latest?.temp),
    },
    humidity: {
      value: latest?.humidity ?? '-',
      unit: '%',
      ...statusFor('humidity', latest?.humidity),
    },
    soil: {
      value: latest?.soil ?? '-',
      unit: '%',
      ...statusFor('soil', latest?.soil),
    },
    lux: {
      value: weather?.lux ?? '-',
      unit: 'lux',
      status: 'ok',
      statusText: '데이터 없음',
    },
  }
}

function statusFor(key, value) {
  if (value == null) return { status: 'ok', statusText: '데이터 없음' }
  if (key === 'temp') {
    if (value >= 35 || value <= 5)  return { status: 'bad',  statusText: '위험' }
    if (value >= 30 || value <= 10) return { status: 'warn', statusText: '주의' }
    return { status: 'ok', statusText: '적정' }
  }
  if (key === 'humidity') {
    if (value >= 80 || value <= 25) return { status: 'bad',  statusText: '위험' }
    if (value >= 70 || value <= 35) return { status: 'warn', statusText: '주의' }
    return { status: 'ok', statusText: '적정' }
  }
  if (key === 'soil') {
    if (value <= 20)                return { status: 'bad',  statusText: '주의' }
    if (value <= 30 || value >= 75) return { status: 'warn', statusText: '주의' }
    return { status: 'ok', statusText: '적정' }
  }
  return { status: 'ok', statusText: '적정' }
}

function buildHistories(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { temp: [], humidity: [], soil: [], lux: [] }
  }
  return {
    temp:     history.map((r, i) => ({ t: i, v: roundOr(r.temp) })),
    humidity: history.map((r, i) => ({ t: i, v: roundOr(r.humidity) })),
    soil:     history.map((r, i) => ({ t: i, v: roundOr(r.soil) })),
    lux:      [],
  }
}

function roundOr(v) {
  if (v == null) return 0
  return Math.round(v * 10) / 10
}

function buildTopAlert(alerts) {
  if (!Array.isArray(alerts) || alerts.length === 0) return null
  const a = alerts[0]
  return {
    message: a.message ?? a.label,
    type: a.severity === 'danger' ? 'danger' : 'warn',
  }
}

function mergeEventLogs(alerts, actuators) {
  const a = (alerts ?? []).map((x, i) => ({
    id: `alert-${x.id ?? i}`,
    category: 'alert',
    text: x.message ?? x.label ?? x.type,
    time: formatTime(x.ts),
    _ts: x.ts,
  }))
  const b = (actuators ?? []).map((x, i) => ({
    id: `act-${x.actuator}-${i}`,
    category: actuatorCategory(x.actuator),
    text: actuatorText(x.actuator, x.action),
    time: formatTime(x.ts),
    _ts: x.ts,
  }))
  return [...a, ...b]
    .sort((x, y) => (new Date(y._ts ?? 0)) - (new Date(x._ts ?? 0)))
    .map(({ id, category, text, time }) => ({ id, category, text, time }))
}

function actuatorCategory(actuator) {
  if (actuator === 'pump') return 'water'
  if (actuator === 'led')  return 'led'
  if (actuator === 'window') return 'window'
  return 'system'
}

function actuatorText(actuator, action) {
  const name = actuator === 'pump' ? '펌프'
            : actuator === 'led'  ? 'LED'
            : actuator === 'window' ? '창문' : actuator
  const act  = action === 'ON'   ? '시작'
            : action === 'OFF'  ? '정지'
            : action === 'OPEN' ? '개방'
            : action === 'CLOSE'? '폐쇄' : action
  return `${name} ${act}`
}

function formatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/* ────────────────────────────────────────
   디바이스 제어 패널 (더미 — control API는 별도 단계)
   ──────────────────────────────────────── */

function DeviceControlPanel({ greenhouseId, initialDevices, initialAutoControl }) {
  const [autoControl, setAutoControl] = useState(initialAutoControl)
  const [devices, setDevices] = useState(initialDevices)
  const [pending, setPending] = useState({})  // { [key]: true } 동안 비활성
  const [controlError, setControlError] = useState(null)

  const toggleDevice = (key) => async (next) => {
    if (!greenhouseId) return
    const prev = devices[key]
    setDevices(d => ({ ...d, [key]: next }))    // optimistic
    setPending(p => ({ ...p, [key]: true }))
    setControlError(null)
    try {
      await controlActuator(greenhouseId, key, actionFor(key, next))
    } catch (err) {
      console.error('디바이스 제어 실패:', err)
      setDevices(d => ({ ...d, [key]: prev }))  // rollback
      setControlError(`${deviceLabels[key]} 제어 실패: ${err.message ?? '오류'}`)
    } finally {
      setPending(p => ({ ...p, [key]: false }))
    }
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
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            자동제어
          </div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 2, lineHeight: 1.4 }}>
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
            disabled={autoControl || !!pending[key]}
            onToggle={toggleDevice(key)}
            isLast={i === DEVICE_KEYS.length - 1}
          />
        ))}
      </div>

      {controlError && (
        <div style={{
          padding: '8px 14px',
          borderTop: '0.5px solid #fcc',
          background: '#fff1f1',
          fontSize: 12, color: '#991f1f',
        }}>
          {controlError}
        </div>
      )}
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
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
          {deviceLabels[deviceKey]}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, marginTop: 1,
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

export default Sensor
