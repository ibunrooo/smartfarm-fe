import { useNavigate } from 'react-router-dom'

function Onboarding() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <button
        onClick={() => navigate('/home')}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 12, color: '#666', fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        ← 홈으로
      </button>

      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
          식물 추가
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          몇 가지만 알려주시면 온실을 등록해 드릴게요.
        </div>
      </div>

      <div style={{
        padding: '40px 16px',
        background: '#fafafa',
        border: '0.5px dashed #d0d0d0',
        borderRadius: 14,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#666', marginBottom: 6 }}>
          식물 추가 위저드
        </div>
        <div style={{ fontSize: 11, color: '#aaa', lineHeight: 1.5 }}>
          다음 커밋에서 구현됩니다<br />
          (식물 종류 → 환경 → 위치 3단계 + 추천 분기)
        </div>
      </div>
    </div>
  )
}

export default Onboarding
