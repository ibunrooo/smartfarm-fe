import { useNavigate } from 'react-router-dom'
import GreenhouseCard from '../components/GreenhouseCard'
import { greenhouses } from '../data/greenhouses'

function Home() {
  const navigate = useNavigate()
  const myGreenhouses = greenhouses

  const goAdd = () => navigate('/onboarding')

  if (myGreenhouses.length === 0) {
    return <EmptyState onAdd={goAdd} />
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>

      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        padding: '0 2px',
      }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
          내 온실
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#2ea84e' }}>
          {myGreenhouses.length}
        </span>
      </div>

      {/* 카드 그리드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {myGreenhouses.map(gh => (
          <GreenhouseCard
            key={gh.id}
            greenhouse={gh}
            onClick={() => navigate(`/sensor?gh=${gh.id}`)}
          />
        ))}
        <AddCard onClick={goAdd} />
      </div>
    </div>
  )
}

function AddCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        minHeight: 92,
        background: '#fafafa',
        border: '1px dashed #c8c8c8',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 8, cursor: 'pointer',
        color: '#888',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: '#fff',
        border: '0.5px solid #ddd',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: '#2ea84e', fontWeight: 500,
        lineHeight: 1,
      }}>
        +
      </div>
      <div style={{ fontSize: 12, fontWeight: 600 }}>식물 추가하기</div>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div style={{
      minHeight: 360,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, padding: 20, textAlign: 'center',
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: '#f2faf3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="36" height="36" viewBox="0 0 26 26" fill="none">
          <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
            fill="#2ea84e" opacity=".85"/>
          <line x1="13" y1="9" x2="13" y2="19"
            stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
            stroke="#fff" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>
        아직 등록된 식물이 없어요
      </div>
      <div style={{ fontSize: 12, color: '#888', maxWidth: 240, lineHeight: 1.5 }}>
        첫 식물을 등록하고<br />
        스마트팜 관리를 시작해보세요.
      </div>
      <button
        onClick={onAdd}
        style={{
          marginTop: 8,
          padding: '10px 20px',
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

export default Home
