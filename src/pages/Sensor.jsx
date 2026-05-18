import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AlertBanner from '../components/AlertBanner'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import SensorMetricCard from '../components/SensorMetricCard'
import SensorEventLog from '../components/SensorEventLog'
import ManualPublishPanel from '../components/ManualPublishPanel'
import { DeviceIcon } from '../components/Device'
import { DEVICE_KEYS, deviceLabels } from '../data/devices'
import { plants, getSimInitial } from '../data/plants'
import { metricLabels, sensorOrder } from '../data/greenhouses'
import { getGreenhouse } from '../api/greenhouse'
import { getLatestSensor, getSensorHistory } from '../api/sensor'
import { getWeather } from '../api/weather'
import { getAlerts } from '../api/alerts'
import { getActuatorLogs, controlActuator } from '../api/actuator'
import { startSimulation, publishOnce } from '../api/simulate'
import {
  getDevices, getDeviceStatus, registerDevice, provisionDevice, revokeDevice,
  DEVICE_TYPE_LABEL,
} from '../api/devices'
import { getMyGreenhouseIds, getGreenhouseMode } from '../utils/storage'

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

// 기기 목록과 상태를 함께 가져와 합쳐서 반환 — BE 응답에 status가 포함되지 않을 수 있어
// 디바이스별 /status를 병렬 호출. 각 status 실패는 무시(unknown 표시).
async function loadDevicesWithStatus(greenhouseId) {
  const list = await getDevices(greenhouseId)
  if (!Array.isArray(list) || list.length === 0) return []
  const statuses = await Promise.all(
    list.map(d => getDeviceStatus(d.deviceId).catch(() => null))
  )
  return list.map((d, i) => ({
    ...d,
    status:        statuses[i]?.status        ?? 'unknown',
    deviceStatus:  statuses[i]?.deviceStatus  ?? d.deviceStatus ?? null,
    lastSeenAt:    statuses[i]?.lastSeenAt    ?? d.lastSeenAt   ?? null,
  }))
}

function Sensor() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const ids = useMemo(() => getMyGreenhouseIds(), [])
  const requestedId = searchParams.get('gh')
  const activeId = ids.includes(requestedId) ? requestedId : ids[0]
  const sensorMode = getGreenhouseMode(activeId)

  const [metas, setMetas]       = useState([])
  const [latest, setLatest]     = useState(null)
  const [history, setHistory]   = useState([])
  const [alerts, setAlerts]     = useState([])
  const [actuators, setActuators] = useState([])
  const [weather, setWeather]   = useState(null)
  // IoT 기기 — 실제 모드 온실에서만 의미가 있음
  const [devices, setDevices]   = useState([])
  const [registerOpen, setRegisterOpen]   = useState(false)
  const [provisionResult, setProvisionResult] = useState(null)
  const [loading, setLoading]   = useState(() => !!activeId)
  const [publishOpen, setPublishOpen] = useState(false)
  const [error, setError]       = useState(null)

  useEffect(() => {
    if (!activeId) return
    let cancelled = false

    // 초기 로드 — 전체 데이터 (로딩 표시 ON)
    Promise.all([
      Promise.all(ids.map(id => getGreenhouse(id).catch(() => null))),
      getLatestSensor(activeId).catch(() => null),
      getSensorHistory(activeId, 60).catch(() => []),
      getAlerts(activeId, 20).catch(() => []),
      getActuatorLogs(activeId).catch(() => []),
      getWeather(activeId).catch(() => null),
      loadDevicesWithStatus(activeId).catch(() => []),
    ])
      .then(([metaList, latestData, historyData, alertList, actuatorList, weatherData, deviceList]) => {
        if (cancelled) return
        setMetas(metaList.filter(Boolean))
        setLatest(latestData)
        setHistory(historyData)
        setAlerts(alertList)
        setActuators(actuatorList)
        setWeather(weatherData)
        setDevices(deviceList)
        setLoading(false)

        // 자동 복구: 가상 모드인데 시계열이 비어있으면 simulate 세션이 죽은 상태
        // (BE 재배포 시 sessions Map이 wipe됨). 신규 그린하우스(생성 30초 이내) 제외.
        if (getGreenhouseMode(activeId) === 'virtual'
            && Array.isArray(historyData) && historyData.length === 0) {
          const meta = metaList.find(m => m?.greenhouseId === activeId)
          const ageMs = meta?.createdAt
            ? Date.now() - new Date(meta.createdAt).getTime()
            : Number.POSITIVE_INFINITY
          if (meta?.plantType && ageMs > 30_000) {
            startSimulation(activeId, {
              plantType: meta.plantType,
              ...getSimInitial(meta.plantType),
            }).catch((err) => console.warn('simulate 자동 재시작 실패:', err))
          }
        }
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Sensor 데이터 조회 실패:', err)
        setError(err.message || '데이터를 불러오지 못했어요.')
        setLoading(false)
      })

    // 폴링 — 센서/알림/액추에이터/기기 상태 조용히 재조회
    const POLL_INTERVAL_MS = 15_000
    const intervalId = setInterval(async () => {
      if (cancelled) return
      try {
        const [latestData, historyData, alertList, actuatorList, deviceList] = await Promise.all([
          getLatestSensor(activeId).catch(() => null),
          getSensorHistory(activeId, 60).catch(() => []),
          getAlerts(activeId, 20).catch(() => []),
          getActuatorLogs(activeId).catch(() => []),
          loadDevicesWithStatus(activeId).catch(() => null),
        ])
        if (cancelled) return
        setLatest(latestData)
        setHistory(historyData)
        setAlerts(alertList)
        setActuators(actuatorList)
        if (deviceList) setDevices(deviceList)
      } catch (err) {
        console.warn('센서 폴링 실패 (무시):', err)
      }
    }, POLL_INTERVAL_MS)

    // 외부 날씨는 분 단위로 자주 바뀌지 않으므로 30분 폴링
    const WEATHER_POLL_MS = 30 * 60 * 1000
    const weatherIntervalId = setInterval(async () => {
      if (cancelled) return
      const w = await getWeather(activeId).catch(() => null)
      if (!cancelled && w) setWeather(w)
    }, WEATHER_POLL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
      clearInterval(weatherIntervalId)
    }
  }, [activeId, ids])

  const setActiveId = (id) => setSearchParams({ gh: id })

  // 사용자 수동 발행 — 입력 값을 BE → MQTT로 1회 publish 후 즉시 한 번 새로고침
  const handleManualPublish = async (payload) => {
    await publishOnce(activeId, payload)
    const fresh = await getLatestSensor(activeId).catch(() => null)
    if (fresh) setLatest(fresh)
  }

  // 기기 등록 → 즉시 provision → 결과 모달로 자격증명 1회 노출
  const handleRegisterDevice = async ({ deviceId, deviceType }) => {
    await registerDevice({ greenhouseId: activeId, deviceId, deviceType })
    const result = await provisionDevice(deviceId, activeId)
    const refreshed = await loadDevicesWithStatus(activeId).catch(() => null)
    if (refreshed) setDevices(refreshed)
    setRegisterOpen(false)
    setProvisionResult({
      deviceId,
      deviceType,
      provisioning: result?.provisioning ?? result,
    })
  }

  // 기기 해지 — 인증서 revoke, BE가 기기 상태를 'revoked'로 변경
  const handleRevokeDevice = async (deviceId) => {
    if (!window.confirm('이 기기 인증서를 해지하시겠어요?\n기기는 더 이상 MQTT에 연결할 수 없게 돼요.')) return
    try {
      await revokeDevice(deviceId)
      const refreshed = await loadDevicesWithStatus(activeId).catch(() => null)
      if (refreshed) setDevices(refreshed)
    } catch (err) {
      console.error('기기 해지 실패:', err)
      alert(`해지 실패: ${err.message ?? '알 수 없는 오류'}`)
    }
  }

  // 데이터 합성
  const switcherList = buildSwitcherList(metas, ids)
  const sensors      = buildSensors(latest)
  const histories    = buildHistories(history)
  const eventLogs    = mergeEventLogs(alerts, actuators)
  const topAlert     = buildTopAlert(alerts)
  const noSensorData = !latest && (!Array.isArray(history) || history.length === 0)
  const activeMeta   = metas.find(m => m?.greenhouseId === activeId)
  const locationType = activeMeta?.locationType ?? 'indoor'
  const plantType    = activeMeta?.plantType
  const isWeatherFallback = latest?.dataSource === 'weather_fallback' || latest?.isWeatherFallback === true

  /* 빈 상태: 등록된 온실 없음 */
  if (!activeId) {
    return (
      <div style={{
        minHeight: 360,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, textAlign: 'center', color: 'var(--tx-2)',
      }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--tx-1)' }}>
          등록된 온실이 없어요
        </div>
        <div style={{ fontSize: 13, color: 'var(--tx-3)' }}>
          홈에서 식물을 먼저 추가해주세요.
        </div>
        <button
          onClick={() => navigate('/onboarding')}
          style={{
            marginTop: 6,
            padding: '10px 18px',
            background: 'var(--brand)', color: '#fff',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            boxShadow: 'var(--shadow-xs)',
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
        color: 'var(--tx-3)', fontSize: 13.5,
      }}>
        센서 데이터를 불러오는 중…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>

      {/* 헤더: 온실 스위처 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <GreenhouseSwitcher
          greenhouses={switcherList}
          activeId={activeId}
          onChange={setActiveId}
        />
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
          background: 'var(--danger-bg)',
          border: '0.5px solid var(--danger-bd)',
          borderRadius: 10,
          fontSize: 12.5, color: 'var(--danger-tx)',
        }}>
          <span style={{ fontWeight: 700 }}>오류</span>
          <span style={{ opacity: .4, margin: '0 6px' }}>·</span>
          <span>{error}</span>
        </div>
      )}

      {noSensorData && !error && (
        <div style={{
          padding: '10px 12px',
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          borderRadius: 10,
          fontSize: 13, color: 'var(--brand-strong)',
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
        }}>
          {sensorMode === 'real' && locationType === 'indoor' ? (
            <>
              <span style={{ fontWeight: 700 }}>실제 센서 연결 시 확인 가능합니다</span>
              <span style={{ opacity: .5 }}>·</span>
              <span style={{ color: 'var(--tx-2)' }}>
                실내 환경은 외부 날씨로 대체할 수 없어요. MQTT에 디바이스를 연결해주세요.
              </span>
            </>
          ) : (
            <>
              <span style={{ fontWeight: 700 }}>센서 데이터를 기다리는 중</span>
              <span style={{ opacity: .5 }}>·</span>
              <span style={{ color: 'var(--tx-2)' }}>
                아직 수집된 측정값이 없어요. 잠시 후 자동으로 표시됩니다.
              </span>
            </>
          )}
        </div>
      )}

      {/* 모드 안내 */}
      <div style={{
        padding: '8px 12px',
        background: sensorMode === 'virtual' ? 'var(--warn-bg)' : 'var(--brand-soft)',
        border: `0.5px solid ${sensorMode === 'virtual' ? 'var(--warn-bd)' : 'var(--brand-line)'}`,
        borderRadius: 10,
        fontSize: 13,
        color: sensorMode === 'virtual' ? 'var(--warn-tx)' : 'var(--brand-strong)',
        display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
      }}>
        <span style={{ fontWeight: 700 }}>
          {sensorMode === 'virtual' ? '가상 모드' : '실제 모드'}
        </span>
        <span style={{ opacity: .5 }}>·</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          {sensorMode === 'virtual'
            ? '시뮬레이션 데이터로 동작 중이에요.'
            : (isWeatherFallback
                ? '외부 날씨 데이터를 연동했어요. 기기를 등록해주세요.'
                : '실제 센서/디바이스에 연결되어 있어요.')}
        </span>
        {sensorMode === 'virtual' && (
          <button
            onClick={() => setPublishOpen(true)}
            style={{
              padding: '4px 10px',
              background: 'var(--surface)',
              border: '0.5px solid var(--warn-bd)',
              borderRadius: 8,
              fontSize: 12, fontWeight: 700,
              color: 'var(--warn-tx)',
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
              flexShrink: 0,
            }}
          >
            직접 시뮬레이션
          </button>
        )}
      </div>

      {/* 외부 날씨 — 실외 모드에서만 노출 */}
      {locationType === 'outdoor' && weather && (
        <WeatherCard weather={weather} />
      )}

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
              emptyText={sensorMode === 'real'
                ? '실제 센서/디바이스를 연결해주세요'
                : '아직 시계열 데이터가 없어요'}
            />
          )
        })}
      </div>

      {/* IoT 기기 — 실제 모드 온실에서만 노출 */}
      {sensorMode === 'real' && (
        <DeviceRegistrySection
          devices={devices}
          onAdd={() => setRegisterOpen(true)}
          onRevoke={handleRevokeDevice}
        />
      )}

      {/* 디바이스 제어 — BE control API 연동 */}
      <DeviceControlPanel
        key={activeId}
        greenhouseId={activeId}
        initialDevices={deriveDeviceState(actuators)}
        initialAutoControl={true}
      />

      {/* 이벤트 로그 (전체) */}
      <SensorEventLog logs={eventLogs} />

      {/* 수동 발행 모달 — 가상 모드의 [값 직접 발행] 버튼으로 오픈 */}
      {publishOpen && (
        <div
          onClick={() => setPublishOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.35)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 420,
              maxHeight: '90dvh',
              overflow: 'auto',
            }}
          >
            <ManualPublishPanel
              initialValues={latest}
              plantType={plantType}
              onPublish={handleManualPublish}
              onClose={() => setPublishOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 기기 등록 모달 */}
      {registerOpen && (
        <DeviceRegisterModal
          onClose={() => setRegisterOpen(false)}
          onSubmit={handleRegisterDevice}
        />
      )}

      {/* 프로비저닝 결과 모달 — 자격증명 1회 노출 */}
      {provisionResult && (
        <ProvisioningResultModal
          result={provisionResult}
          onClose={() => setProvisionResult(null)}
        />
      )}

    </div>
  )
}

/* ────────────────────────────────────────
   IoT 기기 등록/목록 — 실제 모드 온실 전용
   ──────────────────────────────────────── */

const DEVICE_TYPE_OPTIONS = ['sensor', 'light', 'pump', 'window']
const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/

function DeviceRegistrySection({ devices, onAdd, onRevoke }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 12,
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
          등록된 기기 <span style={{ color: 'var(--brand)', fontSize: 13.5 }}>{devices.length}</span>
        </div>
        <button
          onClick={onAdd}
          style={{
            padding: '6px 12px',
            background: 'var(--brand)',
            border: 'none',
            borderRadius: 8,
            fontSize: 12.5, fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          + 기기 추가
        </button>
      </div>

      {devices.length === 0 ? (
        <div style={{
          padding: '14px 12px',
          background: 'var(--surface-2)',
          border: '0.5px dashed var(--bd-soft)',
          borderRadius: 10,
          fontSize: 12.5, color: 'var(--tx-3)', lineHeight: 1.5,
          textAlign: 'center',
        }}>
          아직 등록된 IoT 기기가 없어요. 센서나 액추에이터를 등록해주세요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {devices.map(d => (
            <DeviceRegistryRow key={d.deviceId} device={d} onRevoke={() => onRevoke(d.deviceId)} />
          ))}
        </div>
      )}
    </div>
  )
}

function DeviceRegistryRow({ device, onRevoke }) {
  const isOnline = device.status === 'online'
  const isRevoked = device.deviceStatus === 'revoked'
  const dotColor = isRevoked ? 'var(--tx-4)' : (isOnline ? 'var(--brand)' : 'var(--warn-tx)')
  // 디바이스가 한 번도 MQTT 접속 못한 초기 상태(deviceType 없고 status도 unknown)는
  // 디바이스 종류·상태 두 칸을 합쳐 "등록 대기 중" 한 줄로 노출
  const typeLabel = DEVICE_TYPE_LABEL[device.deviceType] ?? device.deviceType ?? null
  const knownStatus = isRevoked || isOnline || device.status === 'offline'
  const metaText = (!typeLabel && !knownStatus)
    ? '등록 대기 중'
    : [
        typeLabel,
        isRevoked
          ? '해지됨'
          : (isOnline ? '온라인' : (device.status === 'offline' ? '오프라인' : '등록 대기 중')),
        device.lastSeenAt ? formatLastSeen(device.lastSeenAt) : null,
      ].filter(Boolean).join(' · ')
  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--surface-2)',
      border: '0.5px solid var(--bd-soft)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: dotColor,
        flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: 'var(--tx-1)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {device.deviceId}
        </div>
        <div style={{ fontSize: 11, color: 'var(--tx-3)', marginTop: 1 }}>
          {metaText}
        </div>
      </div>
      {!isRevoked && (
        <button
          onClick={onRevoke}
          style={{
            padding: '4px 10px',
            background: 'var(--surface)',
            border: '0.5px solid var(--danger-bd)',
            borderRadius: 8,
            fontSize: 11.5, fontWeight: 600,
            color: 'var(--danger-tx)',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            flexShrink: 0,
          }}
        >
          해지
        </button>
      )}
    </div>
  )
}

function formatLastSeen(iso) {
  try {
    const d = new Date(iso)
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000)
    if (diffSec < 60)      return '방금 전'
    if (diffSec < 3600)    return `${Math.floor(diffSec / 60)}분 전`
    if (diffSec < 86400)   return `${Math.floor(diffSec / 3600)}시간 전`
    return `${Math.floor(diffSec / 86400)}일 전`
  } catch { return '' }
}

function DeviceRegisterModal({ onClose, onSubmit }) {
  const [deviceId, setDeviceId] = useState('')
  const [deviceType, setDeviceType] = useState('sensor')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isValid = DEVICE_ID_PATTERN.test(deviceId)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ deviceId: deviceId.trim(), deviceType })
    } catch (err) {
      console.error('기기 등록 실패:', err)
      setError(err.message ?? '기기 등록에 실패했어요.')
      setSubmitting(false)
    }
  }

  return (
    <ModalShell onClose={submitting ? undefined : onClose}>
      <form onSubmit={handleSubmit} style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 14,
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx-1)' }}>
          IoT 기기 등록
        </div>
        <div style={{ fontSize: 12, color: 'var(--tx-3)', lineHeight: 1.5 }}>
          등록 후 MQTT 자격증명이 한 번만 표시돼요. 기기에 바로 입력할 수 있도록 준비해주세요.
        </div>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx-2)' }}>기기 ID</span>
          <input
            type="text"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
            placeholder="예: DVC001"
            maxLength={128}
            autoFocus
            style={modalFieldStyle}
          />
          <span style={{ fontSize: 11, color: 'var(--tx-4)' }}>
            영문/숫자/._- 만 사용, 최대 128자
          </span>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx-2)' }}>기기 종류</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {DEVICE_TYPE_OPTIONS.map(t => {
              const selected = deviceType === t
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDeviceType(t)}
                  style={{
                    padding: '8px 4px',
                    background: selected ? 'var(--brand-soft)' : 'var(--surface)',
                    border: `0.5px solid ${selected ? 'var(--brand-line)' : 'var(--bd)'}`,
                    borderRadius: 8,
                    fontSize: 12, fontWeight: 600,
                    color: selected ? 'var(--brand-strong)' : 'var(--tx-2)',
                    cursor: 'pointer',
                    fontFamily: 'var(--ff)',
                  }}
                >
                  {DEVICE_TYPE_LABEL[t]}
                </button>
              )
            })}
          </div>
        </label>

        {error && (
          <div style={{
            padding: '8px 10px',
            background: 'var(--danger-bg)',
            border: '0.5px solid var(--danger-bd)',
            borderRadius: 8,
            fontSize: 12, color: 'var(--danger-tx)', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '10px',
              background: 'var(--surface)',
              border: '0.5px solid var(--bd)',
              borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              color: 'var(--tx-2)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!isValid || submitting}
            style={{
              flex: 2,
              padding: '10px',
              background: (isValid && !submitting) ? 'var(--brand)' : 'var(--brand-tint)',
              border: 'none',
              borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              color: '#fff',
              cursor: (isValid && !submitting) ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--ff)',
            }}
          >
            {submitting ? '등록 중…' : '등록 + 자격증명 발급'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}

function ProvisioningResultModal({ result, onClose }) {
  const p = result?.provisioning ?? {}
  const topicsPub = Array.isArray(p?.topics?.pub) ? p.topics.pub.join('\n') : ''
  const topicsSub = Array.isArray(p?.topics?.sub) ? p.topics.sub.join('\n') : ''

  return (
    <ModalShell onClose={onClose}>
      <div style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 14,
        padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx-1)' }}>
          기기 자격증명 발급 완료
        </div>
        <div style={{
          padding: '10px 12px',
          background: 'var(--warn-bg)',
          border: '0.5px solid var(--warn-bd)',
          borderRadius: 10,
          fontSize: 12, color: 'var(--warn-tx)', lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 700 }}>비밀번호는 이 화면에서만 한 번 표시</span>
          돼요. 창을 닫기 전에 기기에 입력하거나 안전한 곳에 복사해두세요.
        </div>

        <CredField label="기기 ID"        value={result.deviceId} />
        <CredField label="MQTT URL"      value={p.mqttUrl} />
        <CredField label="사용자명"       value={p.username} />
        <CredField label="비밀번호"       value={p.password} highlight mono />
        {p.expiresAt && (
          <CredField label="만료 시각"     value={new Date(p.expiresAt).toLocaleString('ko-KR')} />
        )}
        {topicsPub && <CredField label="발행 토픽 (pub)" value={topicsPub} multiline />}
        {topicsSub && <CredField label="구독 토픽 (sub)" value={topicsSub} multiline />}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 4,
            padding: '11px',
            background: 'var(--brand)',
            border: 'none',
            borderRadius: 10,
            fontSize: 13.5, fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          기기에 입력했어요
        </button>
      </div>
    </ModalShell>
  )
}

function CredField({ label, value, highlight, mono, multiline }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(String(value))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* 클립보드 권한 없음 — 무시 */ }
  }
  return (
    <div style={{
      padding: '8px 10px',
      background: highlight ? 'var(--brand-soft)' : 'var(--surface-2)',
      border: `0.5px solid ${highlight ? 'var(--brand-line)' : 'var(--bd-soft)'}`,
      borderRadius: 8,
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: 'var(--tx-3)' }}>{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!value}
          style={{
            padding: '2px 8px',
            background: 'var(--surface)',
            border: '0.5px solid var(--bd)',
            borderRadius: 6,
            fontSize: 11, fontWeight: 600,
            color: 'var(--tx-2)',
            cursor: value ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ff)',
          }}
        >
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <div style={{
        fontSize: mono ? 13 : 12.5,
        fontFamily: mono ? 'ui-monospace, SFMono-Regular, monospace' : 'var(--ff)',
        color: 'var(--tx-1)',
        wordBreak: 'break-all',
        whiteSpace: multiline ? 'pre-wrap' : 'normal',
        fontWeight: highlight ? 700 : 500,
      }}>
        {value || '-'}
      </div>
    </div>
  )
}

function ModalShell({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.35)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 440, maxHeight: '90dvh', overflow: 'auto' }}
      >
        {children}
      </div>
    </div>
  )
}

const modalFieldStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'var(--surface)',
  border: '0.5px solid var(--bd)',
  borderRadius: 8,
  fontSize: 13.5,
  fontFamily: 'var(--ff)',
  outline: 'none',
  color: 'var(--tx-1)',
  boxSizing: 'border-box',
}

/* ────────────────────────────────────────
   외부 날씨 카드 (실외 모드용)
   ──────────────────────────────────────── */

function WeatherCard({ weather }) {
  const temp     = weather.temp     != null ? `${Math.round(weather.temp * 10) / 10}°C` : '-'
  const humidity = weather.humidity != null ? `${Math.round(weather.humidity)}%`        : '-'
  const rainProb = weather.rainProb != null ? `${Math.round(weather.rainProb)}%`        : '-'
  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 10,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: 'var(--brand-soft)',
        border: '0.5px solid var(--brand-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand-strong)',
        flexShrink: 0,
      }}>
        <WeatherIcon summary={weather.summary} />
      </div>
      <div style={{ minWidth: 0, flex: '0 1 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx-3)', letterSpacing: '-.01em' }}>
          외부 날씨
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)', marginTop: 1 }}>
          {weather.summary ?? '-'}
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 14, flexWrap: 'wrap' }}>
        <MiniMetric label="기온"   value={temp} />
        <MiniMetric label="습도"   value={humidity} />
        <MiniMetric label="강수확률" value={rainProb} />
      </div>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div style={{ textAlign: 'right', minWidth: 48 }}>
      <div style={{ fontSize: 10.5, color: 'var(--tx-3)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)', marginTop: 1 }}>{value}</div>
    </div>
  )
}

function WeatherIcon({ summary }) {
  // 한글 요약(맑음/흐림/비/눈/천둥)에 맞춘 단순 SVG
  if (summary?.includes('비')) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 12a4 4 0 014-4 4.5 4.5 0 018.7 1.2A3 3 0 0117 15H7a3 3 0 01-2-3z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        <path d="M8 17l-1 2M12 17l-1 2M16 17l-1 2"
          stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    )
  }
  if (summary?.includes('눈')) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 12a4 4 0 014-4 4.5 4.5 0 018.7 1.2A3 3 0 0117 15H7a3 3 0 01-2-3z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
        <circle cx="8" cy="18" r="0.8" fill="currentColor"/>
        <circle cx="12" cy="18" r="0.8" fill="currentColor"/>
        <circle cx="16" cy="18" r="0.8" fill="currentColor"/>
      </svg>
    )
  }
  if (summary?.includes('흐림') || summary?.includes('천둥')) {
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M5 13a4 4 0 014-4 4.5 4.5 0 018.7 1.2A3 3 0 0117 16H7a3 3 0 01-2-3z"
          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  }
  // 기본: 맑음
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.6 4.6l1.8 1.8M15.6 15.6l1.8 1.8M4.6 17.4l1.8-1.8M15.6 6.4l1.8-1.8"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
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

function buildSensors(latest) {
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
      value: latest?.lux ?? '-',
      unit: 'lux',
      ...statusFor('lux', latest?.lux),
    },
  }
}

function statusFor(key, value) {
  if (value == null) return { status: 'idle', statusText: '데이터 없음' }
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
  if (key === 'lux') {
    if (value <= 100)               return { status: 'bad',  statusText: '부족' }
    if (value <= 500)               return { status: 'warn', statusText: '주의' }
    return { status: 'ok', statusText: '적정' }
  }
  return { status: 'ok', statusText: '적정' }
}

function buildHistories(history) {
  if (!Array.isArray(history) || history.length === 0) {
    return { temp: [], humidity: [], soil: [], lux: [] }
  }
  // 시리즈별 null 값 제외 — 전부 null이면 빈 배열 반환 → 카드가 "데이터 없음" 표시
  const pick = (key) => history
    .map((r, i) => ({ t: i, v: r[key] }))
    .filter(p => p.v != null)
    .map(p => ({ t: p.t, v: Math.round(p.v * 10) / 10 }))
  return {
    temp:     pick('temp'),
    humidity: pick('humidity'),
    soil:     pick('soil'),
    lux:      pick('lux'),
  }
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
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 자동제어 헤더 */}
      <div style={{
        padding: '12px 14px',
        background: 'var(--surface)',
        borderBottom: '0.5px solid var(--bd-soft)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
            자동제어
          </div>
          <div style={{ fontSize: 12, color: 'var(--tx-2)', marginTop: 2, lineHeight: 1.4 }}>
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
          borderTop: '0.5px solid var(--danger-bd)',
          background: 'var(--danger-bg)',
          fontSize: 12, color: 'var(--danger-tx)',
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
      borderBottom: isLast ? 'none' : '0.5px solid var(--bd-soft)',
      opacity: disabled ? 0.55 : 1,
    }}>
      <div style={{
        width: 36, height: 36,
        borderRadius: 10,
        background: on ? 'var(--brand-soft)' : 'var(--surface-2)',
        border: `0.5px solid ${on ? 'var(--brand-line)' : 'transparent'}`,
        color: on ? 'var(--brand)' : 'var(--tx-4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <DeviceIcon name={deviceKey} size={18} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx-1)' }}>
          {deviceLabels[deviceKey]}
        </div>
        <div style={{
          fontSize: 12, fontWeight: 600, marginTop: 1,
          color: on ? 'var(--brand)' : 'var(--tx-4)',
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
        background: disabled ? '#e0e0e0' : (checked ? 'var(--brand)' : '#cfcfcf'),
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
        boxShadow: '0 1px 2px rgba(0,0,0,.15)',
        transition: 'left .2s',
        display: 'block',
      }} />
    </button>
  )
}

export default Sensor
