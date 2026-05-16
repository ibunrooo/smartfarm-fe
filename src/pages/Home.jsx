import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GreenhouseCard from '../components/GreenhouseCard'
import { plants } from '../data/plants'
import { getMyGreenhouses, deleteGreenhouse } from '../api/greenhouse'
import { getWeather } from '../api/weather'
import { stopSimulation } from '../api/simulate'
import { setMyGreenhouseIds, removeGreenhouseId, setActiveGreenhouseId, getGreenhouseMode, removeGreenhouseMode } from '../utils/storage'

function Home() {
  const navigate = useNavigate()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    let cancelled = false

    // BE에서 내 온실 목록 → localStorage 동기화 → 각 온실 카드 정보 합성
    getMyGreenhouses()
      .then((myList) => {
        if (cancelled) return Promise.reject(new Error('cancelled'))
        const ids = myList.map(g => g.greenhouseId)
        setMyGreenhouseIds(ids)
        if (myList.length === 0) {
          setCards([])
          setLoading(false)
          return null
        }
        return Promise.all(
          myList.map(gh =>
            getWeather(gh.greenhouseId).catch(() => null)
              .then(weather => buildCard(gh, weather))
          )
        )
      })
      .then((results) => {
        if (cancelled || !results) return
        setCards(results.filter(Boolean))
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled || err.message === 'cancelled') return
        console.error('온실 조회 실패:', err)
        setError(err.message || '온실 정보를 불러오지 못했어요.')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const handleDelete = async (greenhouseId) => {
    if (deletingId) return
    if (!window.confirm('이 식물을 삭제하시겠어요?\n관련 센서/알림/리포트 데이터가 모두 사라져요.')) return

    setDeletingId(greenhouseId)
    try {
      // 가상 모드만 시뮬레이션 stop 호출 (실제 모드는 BE 세션 없음)
      if (getGreenhouseMode(greenhouseId) === 'virtual') {
        await stopSimulation(greenhouseId).catch(err => {
          console.warn('시뮬레이션 중지 실패 (무시):', err)
        })
      }
      await deleteGreenhouse(greenhouseId)
      removeGreenhouseId(greenhouseId)
      removeGreenhouseMode(greenhouseId)
      setCards(prev => {
        const next = prev.filter(c => c.id !== greenhouseId)
        // 첫 번째 남은 온실을 active로 (없으면 비움)
        setActiveGreenhouseId(next[0]?.id ?? '')
        return next
      })
    } catch (err) {
      console.error('식물 삭제 실패:', err)
      alert(`삭제 실패: ${err.message ?? '알 수 없는 오류'}`)
    } finally {
      setDeletingId(null)
    }
  }

  const goAdd = () => navigate('/onboarding')

  if (loading) {
    return <LoadingState />
  }

  if (cards.length === 0) {
    return <EmptyState onAdd={goAdd} error={error} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>

      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        padding: '0 2px',
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)' }}>
          내 온실
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--brand)' }}>
          {cards.length}
        </span>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* 카드 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {cards.map(card => (
          <GreenhouseCard
            key={card.id}
            greenhouse={card}
            onClick={() => navigate(`/sensor?gh=${card.id}`)}
            onDelete={() => handleDelete(card.id)}
          />
        ))}
        <AddCard onClick={goAdd} />
      </div>
    </div>
  )
}

/* ────────────────────────────────────────
   BE 데이터 → GreenhouseCard 형식 합성
   ──────────────────────────────────────── */

function buildCard(greenhouse, weather) {
  const plant = plants.find(p => p.id === greenhouse.plantType)
  const days = computeDaysSince(greenhouse.createdAt)
  const locationLabel = greenhouse.locationType === 'outdoor' ? '실외' : '실내'
  return {
    id: greenhouse.greenhouseId,
    plant: {
      name: plant?.name ?? greenhouse.plantType ?? '식물',
      sub: `${locationLabel} · 등록 ${days}일째`,
      status: '정상 운영 중',
      theme: plant?.theme ?? { main: '#2ea84e', accent: '#4db866' },
    },
    weather: weather
      ? { temp: Math.round(weather.temp ?? 0), summary: weather.summary ?? '-' }
      : { temp: '-', summary: '-' },
  }
}

function computeDaysSince(iso) {
  if (!iso) return 1
  const created = new Date(iso)
  if (isNaN(created.getTime())) return 1
  const diff = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff + 1)
}

/* ────────────────────────────────────────
   하위 컴포넌트
   ──────────────────────────────────────── */

function LoadingState() {
  return (
    <div style={{
      minHeight: 360,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--tx-3)', fontSize: 13.5,
    }}>
      온실 정보를 불러오는 중…
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--danger-bg)',
      border: '0.5px solid var(--danger-bd)',
      borderRadius: 10,
      fontSize: 13, color: 'var(--danger-tx)', lineHeight: 1.5,
    }}>
      <span style={{ fontWeight: 700 }}>오류</span>
      <span style={{ opacity: .4, margin: '0 6px' }}>·</span>
      <span>{message}</span>
    </div>
  )
}

function AddCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 92,
        background: 'var(--surface)',
        border: '0.5px dashed var(--bd-strong)',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, cursor: 'pointer',
        color: 'var(--tx-3)',
        transition: 'border-color .15s, background .15s',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--brand-soft)',
        border: '0.5px solid var(--brand-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: 'var(--brand)', fontWeight: 500,
        lineHeight: 1,
      }}>
        +
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>식물 추가하기</div>
    </div>
  )
}

function EmptyState({ onAdd, error }) {
  return (
    <div style={{
      minHeight: 360,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 20, textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--brand-soft)',
        border: '0.5px solid var(--brand-line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--brand)',
      }}>
        <svg width="34" height="34" viewBox="0 0 26 26" fill="none">
          <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
            stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
          <line x1="13" y1="9" x2="13" y2="19"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".7"/>
          <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
            stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity=".7"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx-1)' }}>
        아직 등록된 식물이 없어요
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--tx-3)', maxWidth: 240, lineHeight: 1.5 }}>
        첫 식물을 등록하고<br />
        스마트팜 관리를 시작해보세요.
      </div>
      {error && (
        <div style={{ fontSize: 11.5, color: 'var(--danger-tx)', marginTop: 4 }}>
          ({error})
        </div>
      )}
      <button
        onClick={onAdd}
        style={{
          marginTop: 8,
          padding: '10px 20px',
          background: 'var(--brand)', color: '#fff',
          border: 'none', borderRadius: 10,
          fontSize: 14, fontWeight: 700,
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

export default Home
