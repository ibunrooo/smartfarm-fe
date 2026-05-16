import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { plants as fallbackPlants, difficultyLabel, difficultyColor, recommendPlants as fallbackRecommend, getSimInitial, sortPlants } from '../data/plants'
import { koreaRegions, findCityCoords, findCityByCoords } from '../data/koreaCities'
import { upsertGreenhouse, getGreenhouse } from '../api/greenhouse'
import { recommendPlant, registerPlant } from '../api/plant'
import { startSimulation, stopSimulation } from '../api/simulate'
import { addGreenhouseId, setActiveGreenhouseId, setGreenhouseMode, getGreenhouseMode } from '../utils/storage'

const DEFAULT_THEME = { main: '#2ea84e', accent: '#4db866' }
const DEFAULT_COORDS = { lat: 37.5665, lon: 126.9780 } // 서울 fallback

function mergeWithFallback(bePlant) {
  const fb = fallbackPlants.find(p => p.id === bePlant.id)
  return {
    ...(fb ?? {}),
    ...bePlant,
    theme:           bePlant.theme ?? fb?.theme ?? DEFAULT_THEME,
    difficulty:      bePlant.difficulty ?? fb?.difficulty ?? 'easy',
    recommendReason: bePlant.recommendReason || fb?.recommendReason || '',
    sunPref:         bePlant.sunPref ?? fb?.sunPref ?? 'low',
  }
}

const stepDesc = {
  1: '어떤 식물을 키우고 싶으세요?',
  2: '어디서 키우시나요?',
  3: '어느 지역인가요?',
  4: '센서는 어떻게 구성되어 있나요?',
}

function Onboarding() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') || null
  const isEdit = !!editId

  const [mode, setMode] = useState('main')
  const minStep = isEdit ? 2 : 1   // 수정 모드: 식물 선택(step 1) 스킵
  const [step, setStep] = useState(minStep)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [prefillLoading, setPrefillLoading] = useState(isEdit)
  // 식물 목록은 FE static 데이터만 사용 — BE 호출에서 오는 props 변동(flicker) 방지
  const plantList = useMemo(() => sortPlants(fallbackPlants), [])
  const [data, setData] = useState({
    plantId:    null,
    location:   null,
    city:       '',
    sensorMode: null, // 'virtual' | 'real'
  })

  // 수정 모드: 기존 온실 정보 prefill
  useEffect(() => {
    if (!isEdit) return
    let cancelled = false
    getGreenhouse(editId)
      .then((gh) => {
        if (cancelled || !gh) return
        const cityFromCoords = findCityByCoords(gh.lat, gh.lon)
        setData({
          plantId:    gh.plantType ?? null,
          location:   gh.locationType ?? null,
          city:       cityFromCoords?.name ?? '',
          sensorMode: getGreenhouseMode(editId),
        })
        setPrefillLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('수정 모드 prefill 실패:', err)
        setSubmitError('기존 정보를 불러오지 못했어요.')
        setPrefillLoading(false)
      })
    return () => { cancelled = true }
  }, [isEdit, editId])

  if (mode === 'recommend') {
    return (
      <Recommend
        onCancel={() => setMode('main')}
        onSelect={(plantId) => {
          setData(d => ({ ...d, plantId }))
          setMode('main')
          setStep(2)
        }}
      />
    )
  }

  const canNext = (
    (step === 1 && data.plantId) ||
    (step === 2 && data.location) ||
    (step === 3 && data.city.trim().length > 0) ||
    (step === 4 && data.sensorMode)
  )

  const goNext = () => {
    if (step < 4) setStep(step + 1)
    else handleSubmit()
  }
  const goPrev = () => {
    if (step > minStep) setStep(step - 1)
    else navigate('/home')
  }
  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)

    const coords = findCityCoords(data.city) ?? DEFAULT_COORDS
    const targetId = editId ?? `gh-${Date.now()}`

    try {
      await upsertGreenhouse({
        greenhouseId: targetId,
        plantType:    data.plantId,
        locationType: data.location,
        useSensor:    true,
        lat:          coords.lat,
        lon:          coords.lon,
      })
      // plantType이 바뀐 경우(또는 신규)에 user_plants 갱신
      await registerPlant(targetId, data.plantId).catch((err) => {
        console.warn('plant 등록 호출 실패 (무시):', err)
      })

      // 시뮬레이션을 mode에 맞게 정렬 (idempotent)
      // - virtual: startSimulation은 BE에서 기존 세션을 교체함 (식물 변경도 자연스럽게 반영)
      // - real:   기존 세션이 있을 수 있으니 정지
      if (data.sensorMode === 'virtual') {
        await startSimulation(targetId, {
          plantType: data.plantId,
          ...getSimInitial(data.plantId),
        }).catch((err) => {
          console.warn('simulate 시작 실패 (무시):', err)
        })
      } else if (isEdit) {
        await stopSimulation(targetId).catch((err) => {
          console.warn('simulate 중지 실패 (무시):', err)
        })
      }
      setGreenhouseMode(targetId, data.sensorMode)

      if (!isEdit) {
        addGreenhouseId(targetId)
        setActiveGreenhouseId(targetId)
      }
      navigate('/home')
    } catch (err) {
      console.error(isEdit ? '수정 실패:' : '온실 등록 실패:', err)
      setSubmitError(err.message || (isEdit ? '수정 중 오류가 발생했어요.' : '등록 중 오류가 발생했어요.'))
      setSubmitting(false)
    }
  }

  // 수정 모드 데이터 로딩 중
  if (prefillLoading) {
    return (
      <div style={{
        minHeight: 360,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--tx-3)', fontSize: 13.5,
      }}>
        기존 정보를 불러오는 중…
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <button
        onClick={goPrev}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 13.5, color: 'var(--tx-2)', fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        ← {step === minStep ? '홈으로' : '이전'}
      </button>

      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)' }}>
          {isEdit ? '식물 정보 수정' : '식물 추가'}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--tx-3)', marginTop: 4 }}>
          {stepDesc[step]}
        </div>
      </div>

      {isEdit
        ? <Stepper current={step - 1} total={3} labels={['환경', '위치', '센서']} />
        : <Stepper current={step}     total={4} labels={['식물', '환경', '위치', '센서']} />
      }

      <div style={{ minHeight: 200 }}>
        {step === 1 && (
          <PlantStep
            plants={plantList}
            value={data.plantId}
            onChange={(id) => setData(d => ({ ...d, plantId: id }))}
            onUnsure={() => setMode('recommend')}
          />
        )}
        {step === 2 && (
          <LocationStep
            value={data.location}
            onChange={(loc) => setData(d => ({ ...d, location: loc }))}
          />
        )}
        {step === 3 && (
          <CityStep
            plants={plantList}
            value={data.city}
            onChange={(city) => setData(d => ({ ...d, city }))}
            summary={data}
          />
        )}
        {step === 4 && (
          <SensorModeStep
            value={data.sensorMode}
            onChange={(mode) => setData(d => ({ ...d, sensorMode: mode }))}
          />
        )}
      </div>

      {submitError && (
        <div style={{
          padding: '10px 12px',
          background: 'var(--danger-bg)',
          border: '0.5px solid var(--danger-bd)',
          borderRadius: 10,
          fontSize: 13, color: 'var(--danger-tx)', lineHeight: 1.5,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontWeight: 700 }}>등록 실패</span>
          <span style={{ opacity: .4 }}>·</span>
          <span>{submitError}</span>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {step > minStep && (
          <button
            onClick={goPrev}
            disabled={submitting}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--surface)',
              border: '0.5px solid var(--bd)',
              borderRadius: 10,
              fontSize: 14, fontWeight: 600,
              color: 'var(--tx-2)',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--ff)',
              opacity: submitting ? 0.5 : 1,
            }}
          >
            이전
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canNext || submitting}
          style={{
            flex: 2,
            padding: '12px',
            background: (canNext && !submitting) ? 'var(--brand)' : 'var(--brand-tint)',
            border: 'none',
            borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            cursor: (canNext && !submitting) ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ff)',
            boxShadow: (canNext && !submitting) ? 'var(--shadow-xs)' : 'none',
          }}
        >
          {step === 4
            ? (submitting ? (isEdit ? '수정 중…' : '등록 중…') : (isEdit ? '수정 완료' : '등록하기'))
            : '다음 →'}
        </button>
      </div>
    </div>
  )
}

function Stepper({ current, total, labels }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {Array.from({ length: total }).map((_, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current
        const filled = done || active
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start',
            flex: idx === total ? 0 : 1,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: filled ? 'var(--brand-soft)' : 'var(--surface-2)',
                border: `0.5px solid ${filled ? 'var(--brand-line)' : 'var(--bd-soft)'}`,
                color: filled ? 'var(--brand-strong)' : 'var(--tx-4)',
                fontSize: 13, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff)',
              }}>
                {idx}
              </div>
              <div style={{
                fontSize: 11.5, fontWeight: active ? 700 : 500,
                color: active ? 'var(--brand-strong)' : 'var(--tx-3)',
              }}>
                {labels[i]}
              </div>
            </div>
            {idx < total && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? 'var(--brand-line)' : 'var(--bd-soft)',
                margin: '12px 6px 0',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlantStep({ plants, value, onChange, onUnsure }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 8,
      }}>
        {plants.map(p => {
          const selected = value === p.id
          const diff = difficultyColor[p.difficulty]
          return (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              style={{
                padding: 12,
                background: selected ? 'var(--brand-soft)' : 'var(--surface)',
                border: `0.5px solid ${selected ? 'var(--brand-line)' : 'var(--bd)'}`,
                borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
                fontFamily: 'var(--ff)',
                textAlign: 'left',
                position: 'relative',
              }}
            >
              <div style={{
                width: 38, height: 38,
                background: p.theme.main,
                borderRadius: 10,
                color: p.theme.textColor ?? '#fff',
                fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                  {p.name}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontSize: 11, fontWeight: 600,
                  marginTop: 4,
                  padding: '1px 6px',
                  borderRadius: 6,
                  background: diff.bg, color: diff.fg,
                }}>
                  {difficultyLabel[p.difficulty]}
                </div>
              </div>
              {selected && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#2ea84e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="9" height="9" viewBox="0 0 8 8">
                    <path d="M1.5 4l1.5 1.5L6.5 2"
                      stroke="#fff" strokeWidth="1.4" fill="none"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={onUnsure}
        style={{
          padding: '12px 14px',
          background: '#fafafa',
          border: '0.5px dashed #c8c8c8',
          borderRadius: 12,
          fontSize: 14,
          color: '#666',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        식물 추천받기
      </button>
    </div>
  )
}

function LocationStep({ value, onChange }) {
  const options = [
    { id: 'indoor',  label: '실내', desc: '집 안 / 베란다 / 사무실', icon: <IndoorIcon /> },
    { id: 'outdoor', label: '실외', desc: '마당 / 옥상 / 텃밭',     icon: <OutdoorIcon /> },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {options.map(opt => {
        const selected = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: '24px 14px',
              background: selected ? '#f2faf3' : '#fff',
              border: `1px solid ${selected ? '#2ea84e' : '#e8e8e8'}`,
              borderRadius: 14,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: selected ? '#ddf2e2' : '#f5f5f5',
              color: selected ? '#2ea84e' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {opt.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 1.4 }}>
              {opt.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function SensorModeStep({ value, onChange }) {
  const options = [
    {
      id: 'virtual',
      label: '가상 시뮬레이션',
      desc: '센서 없이 시뮬레이션 데이터로 동작',
      icon: <VirtualIcon />,
    },
    {
      id: 'real',
      label: '실제 센서 연결',
      desc: 'MQTT 서버에 연결된 디바이스에서 측정값 수신',
      icon: <RealIcon />,
    },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {options.map(opt => {
        const selected = value === opt.id
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: '24px 14px',
              background: selected ? '#f2faf3' : '#fff',
              border: `1px solid ${selected ? '#2ea84e' : '#e8e8e8'}`,
              borderRadius: 14,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: 8,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: selected ? '#ddf2e2' : '#f5f5f5',
              color: selected ? '#2ea84e' : '#888',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {opt.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 12, color: '#888', textAlign: 'center', lineHeight: 1.4 }}>
              {opt.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function VirtualIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="12" rx="2"
        stroke="currentColor" strokeWidth="1.6" fill="none"/>
      <path d="M8 20h8M12 17v3"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M8 11l-2 1.5L8 14M16 11l2 1.5L16 14M13 9l-2 6"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function RealIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="7" y="7" width="10" height="10" rx="1.5"
        stroke="currentColor" strokeWidth="1.6" fill="none"/>
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function CityStep({ plants, value, onChange, summary }) {
  const plant = plants.find(p => p.id === summary.plantId)
  const [province, setProvince] = useState(() => findCityCoords(value)?.province ?? '')

  const cityOptions = useMemo(() => {
    const region = koreaRegions.find(r => r.province === province)
    return region?.cities ?? []
  }, [province])

  const handleProvinceChange = (next) => {
    setProvince(next)
    onChange('')   // 시/도 바꾸면 시/군/구 초기화
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <SelectField
          label="시 / 도"
          value={province}
          onChange={handleProvinceChange}
          options={koreaRegions.map(r => ({ value: r.province, label: r.province }))}
          placeholder="선택"
        />
        <SelectField
          label="시 / 군 / 구"
          value={value}
          onChange={onChange}
          options={cityOptions.map(c => ({ value: c.name, label: c.name }))}
          placeholder={province ? '선택' : '시/도 먼저 선택'}
          disabled={!province}
        />
      </div>

      <div style={{
        padding: 14,
        background: 'var(--brand-soft)',
        border: '0.5px solid var(--brand-line)',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-strong)', marginBottom: 8 }}>
          이렇게 등록할게요
        </div>
        <SummaryRow label="식물" value={plant?.name ?? '-'} />
        <SummaryRow label="환경" value={summary.location === 'indoor' ? '실내' : '실외'} />
        <SummaryRow
          label="위치"
          value={value ? `${province} ${value}` : '선택 필요'}
          dim={!value}
        />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options, placeholder, disabled }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx-2)' }}>
        {label}
      </span>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '11px 12px',
          background: disabled ? 'var(--surface-2)' : 'var(--surface)',
          border: '0.5px solid var(--bd)',
          borderRadius: 10,
          fontSize: 14,
          fontFamily: 'var(--ff)',
          outline: 'none',
          color: value ? 'var(--tx-1)' : 'var(--tx-4)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'><path fill=\'none\' stroke=\'%23999\' stroke-width=\'1.4\' stroke-linecap=\'round\' stroke-linejoin=\'round\' d=\'M3 4.5l3 3 3-3\'/></svg>")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: 30,
        }}
      >
        <option value="" disabled hidden>{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}

function SummaryRow({ label, value, dim }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: 13.5,
    }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color: dim ? '#aaa' : '#1a1a1a', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function IndoorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 10L11 4l8 6v8a1 1 0 01-1 1H4a1 1 0 01-1-1v-8z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <path d="M9 19v-5h4v5"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  )
}

function OutdoorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.6 4.6l1.8 1.8M15.6 15.6l1.8 1.8M4.6 17.4l1.8-1.8M15.6 6.4l1.8-1.8"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────
   추천 흐름: Survey → Loading → Result
   ───────────────────────────────────────────────────────── */

function Recommend({ onCancel, onSelect }) {
  const [phase, setPhase] = useState('survey')
  const [answers, setAnswers] = useState({ experience: null, sunlight: null })
  const [results, setResults] = useState([])
  const [picked, setPicked] = useState(null)

  const handleStart = async () => {
    setPhase('loading')
    // BE 추천 시도 → 실패/빈 결과면 frontend 더미 알고리즘으로 fallback
    try {
      const { plants: beResults } = await recommendPlant({
        locationType: 'indoor',           // 추천 흐름엔 환경 입력이 없어 기본값
        lightLevel:   answers.sunlight,
      })
      if (beResults && beResults.length > 0) {
        const merged = beResults.map(mergeWithFallback)
        setResults(merged)
        setPicked(merged[0]?.id ?? null)
        setPhase('result')
        return
      }
    } catch (err) {
      console.warn('BE 추천 실패, 더미로 fallback:', err)
    }
    // fallback (약간의 로딩 느낌 유지)
    setTimeout(() => {
      const recs = fallbackRecommend(answers)
      setResults(recs)
      setPicked(recs[0]?.id ?? null)
      setPhase('result')
    }, 600)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <button
        onClick={onCancel}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 13.5, color: '#666', fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        ← 직접 선택으로
      </button>

      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
          식물 추천
        </div>
        <div style={{ fontSize: 13.5, color: '#888', marginTop: 4 }}>
          {phase === 'survey'  && '몇 가지만 알려주세요. 맞춤 식물을 추천해드릴게요.'}
          {phase === 'loading' && '취향에 맞는 식물을 찾고 있어요…'}
          {phase === 'result'  && '이 식물들을 추천해요.'}
        </div>
      </div>

      {phase === 'survey'  && <Survey  answers={answers} onChange={setAnswers} onSubmit={handleStart} />}
      {phase === 'loading' && <RecommendSkeleton />}
      {phase === 'result'  && (
        <RecommendResult
          results={results}
          picked={picked}
          onPick={setPicked}
          onConfirm={() => picked && onSelect(picked)}
          onRetry={() => setPhase('survey')}
        />
      )}
    </div>
  )
}

const surveyOptions = {
  experience: [
    { id: 'beginner',     label: '처음이에요',  desc: '식물 키우기 입문' },
    { id: 'intermediate', label: '조금 해봤어요', desc: '몇 번 키워봤음' },
    { id: 'advanced',     label: '능숙해요',     desc: '여러 작물 경험' },
  ],
  sunlight: [
    { id: 'high', label: '햇빛이 잘 들어요', desc: '하루 4시간 이상' },
    { id: 'low',  label: '햇빛이 부족해요',  desc: '실내 / 음지' },
  ],
}

function Survey({ answers, onChange, onSubmit }) {
  const canSubmit = answers.experience && answers.sunlight

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <SurveyQuestion
        title="식물 키우기 경험은?"
        options={surveyOptions.experience}
        value={answers.experience}
        onChange={(id) => onChange(a => ({ ...a, experience: id }))}
      />
      <SurveyQuestion
        title="햇빛은 어떤가요?"
        options={surveyOptions.sunlight}
        value={answers.sunlight}
        onChange={(id) => onChange(a => ({ ...a, sunlight: id }))}
      />

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        style={{
          padding: '12px',
          background: canSubmit ? '#2ea84e' : '#cfe7d4',
          border: 'none',
          borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          color: '#fff',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--ff)',
        }}
      >
        추천 받기 →
      </button>
    </div>
  )
}

function SurveyQuestion({ title, options, value, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
        {options.map(opt => {
          const selected = value === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                padding: '12px 14px',
                background: selected ? 'var(--brand-soft)' : 'var(--surface)',
                border: `0.5px solid ${selected ? 'var(--brand-line)' : 'var(--bd)'}`,
                borderRadius: 12,
                cursor: 'pointer',
                fontFamily: 'var(--ff)',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {opt.desc}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RecommendSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[0, 1, 2].map(i => (
        <div key={i} className="skeleton" style={{
          padding: 14,
          background: '#f5f5f5',
          border: '0.5px solid #ececec',
          borderRadius: 12,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e8e8e8' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 12, background: '#e8e8e8', borderRadius: 4, width: '40%' }} />
            <div style={{ height: 10, background: '#ececec', borderRadius: 4, width: '80%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RecommendResult({ results, picked, onPick, onConfirm, onRetry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {results.map((p, i) => {
        const selected = picked === p.id
        const diff = difficultyColor[p.difficulty]
        return (
          <button
            key={p.id}
            onClick={() => onPick(p.id)}
            style={{
              padding: 14,
              background: selected ? '#f2faf3' : '#fff',
              border: `1px solid ${selected ? '#2ea84e' : '#e8e8e8'}`,
              borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
              textAlign: 'left',
              position: 'relative',
            }}
          >
            <div style={{
              width: 48, height: 48,
              background: p.theme.main,
              borderRadius: 12,
              color: p.theme.textColor ?? '#fff',
              fontSize: 19, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {p.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i === 0 && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 5,
                    background: '#2ea84e', color: '#fff',
                  }}>
                    BEST
                  </span>
                )}
                <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a1a' }}>
                  {p.name}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '1px 6px', borderRadius: 6,
                  background: diff.bg, color: diff.fg,
                }}>
                  {difficultyLabel[p.difficulty]}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#666', marginTop: 4, lineHeight: 1.45 }}>
                {p.recommendReason}
              </div>
            </div>
            {selected && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                width: 18, height: 18, borderRadius: '50%',
                background: '#2ea84e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="10" height="10" viewBox="0 0 8 8">
                  <path d="M1.5 4l1.5 1.5L6.5 2"
                    stroke="#fff" strokeWidth="1.5" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </button>
        )
      })}

      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button
          onClick={onRetry}
          style={{
            flex: 1,
            padding: '12px',
            background: '#fff',
            border: '0.5px solid #ddd',
            borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            color: '#666',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          다시 답하기
        </button>
        <button
          onClick={onConfirm}
          disabled={!picked}
          style={{
            flex: 2,
            padding: '12px',
            background: picked ? '#2ea84e' : '#cfe7d4',
            border: 'none',
            borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            cursor: picked ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ff)',
          }}
        >
          이 식물로 등록 →
        </button>
      </div>
    </div>
  )
}

export default Onboarding
