import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { plants, difficultyLabel, difficultyColor } from '../data/plants'

const stepDesc = {
  1: '어떤 식물을 키우고 싶으세요?',
  2: '어디서 키우시나요?',
  3: '어느 지역인가요?',
}

function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    plantId:  null,
    location: null,
    city:     '',
  })

  const canNext = (
    (step === 1 && data.plantId) ||
    (step === 2 && data.location) ||
    (step === 3 && data.city.trim().length > 0)
  )

  const goNext = () => {
    if (step < 3) setStep(step + 1)
    else handleSubmit()
  }
  const goPrev = () => {
    if (step > 1) setStep(step - 1)
    else navigate('/home')
  }
  const handleSubmit = () => {
    const plant = plants.find(p => p.id === data.plantId)
    window.alert(`등록 완료\n식물: ${plant?.name}\n환경: ${data.location === 'indoor' ? '실내' : '실외'}\n위치: ${data.city}\n\n(추후 백엔드 연동)`)
    navigate('/home')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <button
        onClick={goPrev}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 12, color: '#666', fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        ← {step === 1 ? '홈으로' : '이전'}
      </button>

      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
          식물 추가
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {stepDesc[step]}
        </div>
      </div>

      <Stepper current={step} total={3} labels={['식물', '환경', '위치']} />

      <div style={{ minHeight: 200 }}>
        {step === 1 && (
          <PlantStep
            value={data.plantId}
            onChange={(id) => setData(d => ({ ...d, plantId: id }))}
            onUnsure={() => window.alert('식물 추천 — 다음 커밋에서 구현')}
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
            value={data.city}
            onChange={(city) => setData(d => ({ ...d, city }))}
            summary={data}
          />
        )}
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        {step > 1 && (
          <button
            onClick={goPrev}
            style={{
              flex: 1,
              padding: '12px',
              background: '#fff',
              border: '0.5px solid #ddd',
              borderRadius: 10,
              fontSize: 13, fontWeight: 600,
              color: '#666',
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
            }}
          >
            이전
          </button>
        )}
        <button
          onClick={goNext}
          disabled={!canNext}
          style={{
            flex: 2,
            padding: '12px',
            background: canNext ? '#2ea84e' : '#cfe7d4',
            border: 'none',
            borderRadius: 10,
            fontSize: 13, fontWeight: 700,
            color: '#fff',
            cursor: canNext ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--ff)',
          }}
        >
          {step === 3 ? '등록하기' : '다음 →'}
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
                background: filled ? '#2ea84e' : '#e8e8e8',
                color: filled ? '#fff' : '#aaa',
                fontSize: 11.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--ff)',
              }}>
                {idx}
              </div>
              <div style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: active ? '#1e8a3c' : '#999',
              }}>
                {labels[i]}
              </div>
            </div>
            {idx < total && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? '#2ea84e' : '#e8e8e8',
                margin: '12px 6px 0',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function PlantStep({ value, onChange, onUnsure }) {
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
                background: selected ? '#f2faf3' : '#fff',
                border: `1px solid ${selected ? '#2ea84e' : '#e8e8e8'}`,
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
                background: p.color,
                borderRadius: 10,
                color: '#fff',
                fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {p.name[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
                  {p.name}
                </div>
                <div style={{
                  display: 'inline-block',
                  fontSize: 9.5, fontWeight: 600,
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
          fontSize: 12.5,
          color: '#666',
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        뭐 키울지 잘 모르겠어요 → 추천 받기
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
              {opt.label}
            </div>
            <div style={{ fontSize: 10.5, color: '#888', textAlign: 'center', lineHeight: 1.4 }}>
              {opt.desc}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function CityStep({ value, onChange, summary }) {
  const plant = plants.find(p => p.id === summary.plantId)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#666', marginBottom: 6 }}>
          도시
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예: 서울"
          style={{
            width: '100%',
            padding: '12px 14px',
            background: '#fff',
            border: '0.5px solid #ddd',
            borderRadius: 10,
            fontSize: 13,
            fontFamily: 'var(--ff)',
            outline: 'none',
            color: '#1a1a1a',
          }}
        />
        <div style={{ fontSize: 10.5, color: '#aaa', marginTop: 6 }}>
          OpenWeather 연동 시 위치 기반 외부 기상이 반영돼요.
        </div>
      </div>

      <div style={{
        padding: 14,
        background: '#f8fdf9',
        border: '0.5px solid #ddf2e2',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#1e8a3c', marginBottom: 8 }}>
          이렇게 등록할게요
        </div>
        <SummaryRow label="식물" value={plant?.name ?? '-'} />
        <SummaryRow label="환경" value={summary.location === 'indoor' ? '실내' : '실외'} />
        <SummaryRow label="위치" value={value.trim() || '입력 필요'} dim={!value.trim()} />
      </div>
    </div>
  )
}

function SummaryRow({ label, value, dim }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: 12,
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

export default Onboarding
