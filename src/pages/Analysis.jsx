import { useEffect, useRef, useState } from 'react'
import { severityStyle } from '../data/diseases'
import { predictDisease } from '../api/disease'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function Analysis() {
  const [phase, setPhase] = useState('upload')
  const [imageUrl, setImageUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const triggerSelect = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setErrorMsg('이미지는 5MB 이하로 업로드해주세요.')
      setPhase('preview')
      return
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setSelectedFile(file)
    setResult(null)
    setErrorMsg(null)
    setPhase('preview')
  }

  const handleAnalyze = async () => {
    if (!selectedFile) return
    setErrorMsg(null)
    setPhase('loading')
    try {
      const data = await predictDisease(selectedFile)
      if (!data) throw new Error('분석 결과를 받지 못했어요.')
      setResult(data)
      setPhase('result')
    } catch (err) {
      console.error('이미지 분석 실패:', err)
      setErrorMsg(err.message || '분석 중 오류가 발생했어요.')
      setPhase('preview')
    }
  }

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setSelectedFile(null)
    setResult(null)
    setErrorMsg(null)
    setPhase('upload')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 2px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          color: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LeafScanIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)', letterSpacing: '-.01em' }}>
            이미지 분석
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 2 }}>
            잎 사진을 업로드하면 AI가 식물 질병을 진단해 드려요.
          </div>
        </div>
      </div>

      {/* 숨겨진 file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {phase === 'upload'  && <UploadCard onClick={triggerSelect} />}
      {phase === 'preview' && (
        <Preview
          imageUrl={imageUrl}
          onReselect={triggerSelect}
          onAnalyze={handleAnalyze}
          errorMsg={errorMsg}
        />
      )}
      {phase === 'loading' && <LoadingView imageUrl={imageUrl} />}
      {phase === 'result'  && (
        <ResultView
          result={result}
          imageUrl={imageUrl}
          onRetry={handleReset}
        />
      )}
    </div>
  )
}

/* ────────────────────────────────────────
   업로드 카드
   ──────────────────────────────────────── */

function UploadCard({ onClick }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%',
        minHeight: 280,
        background: 'linear-gradient(180deg, var(--brand-soft) 0%, var(--surface) 75%)',
        border: `1px dashed ${hover ? 'var(--brand)' : 'var(--brand-line)'}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: '36px 24px',
        cursor: 'pointer',
        fontFamily: 'var(--ff)',
        transition: 'border-color .15s, transform .15s',
        transform: hover ? 'translateY(-1px)' : 'none',
      }}
    >
      {/* 아이콘 박스 + 플러스 뱃지 */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'var(--surface)',
          border: '0.5px solid var(--brand-line)',
          color: 'var(--brand)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <CameraIcon />
        </div>
        <div style={{
          position: 'absolute', bottom: -3, right: -3,
          width: 22, height: 22, borderRadius: '50%',
          background: 'var(--brand)',
          color: '#fff',
          fontSize: 15, fontWeight: 500, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--surface)',
          boxShadow: 'var(--shadow-xs)',
        }}>+</div>
      </div>

      {/* 타이틀 + 부제 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--tx-1)', letterSpacing: '-.01em' }}>
          사진을 올려주세요
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--tx-3)', textAlign: 'center', lineHeight: 1.6, maxWidth: 280 }}>
          잎이 또렷이 보이는 사진일수록 더 정확해요.<br />
          탭하여 갤러리 또는 카메라에서 선택하세요.
        </div>
      </div>

      {/* 메타 칩 */}
      <div style={{
        display: 'flex', gap: 6,
        marginTop: 2,
      }}>
        <MetaChip>JPG · PNG</MetaChip>
        <MetaChip>최대 5MB</MetaChip>
      </div>
    </button>
  )
}

function MetaChip({ children }) {
  return (
    <span style={{
      padding: '3px 9px',
      background: 'var(--surface)',
      border: '0.5px solid var(--bd-soft)',
      borderRadius: 12,
      fontSize: 11, fontWeight: 500,
      color: 'var(--tx-3)',
      fontFamily: 'var(--ff)',
    }}>
      {children}
    </span>
  )
}

/* ────────────────────────────────────────
   프리뷰
   ──────────────────────────────────────── */

function Preview({ imageUrl, onReselect, onAnalyze, errorMsg }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ImageBox src={imageUrl} label="분석할 사진" />
      {errorMsg && (
        <div style={{
          padding: '10px 12px',
          background: 'var(--danger-bg)',
          border: '0.5px solid var(--danger-bd)',
          borderRadius: 10,
          fontSize: 13, color: 'var(--danger-tx)', lineHeight: 1.5,
          display: 'flex', alignItems: 'center', gap: 7,
        }}>
          <span style={{ fontWeight: 700 }}>분석 실패</span>
          <span style={{ opacity: .4 }}>·</span>
          <span>{errorMsg}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onReselect}
          style={{
            flex: 1,
            padding: '13px',
            background: 'var(--surface)',
            border: '0.5px solid var(--bd)',
            borderRadius: 11,
            fontSize: 14, fontWeight: 600,
            color: 'var(--tx-2)',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          다시 선택
        </button>
        <button
          onClick={onAnalyze}
          style={{
            flex: 2,
            padding: '13px',
            background: 'var(--brand)',
            border: 'none',
            borderRadius: 11,
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
        >
          분석하기
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────
   분석 중
   ──────────────────────────────────────── */

function LoadingView({ imageUrl }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      borderRadius: 14,
      overflow: 'hidden',
      background: 'var(--surface-2)',
      border: '0.5px solid var(--bd-soft)',
    }}>
      <img
        src={imageUrl}
        alt="분석 중인 사진"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: 0.55,
          filter: 'blur(1px)',
        }}
      />
      {/* 스캔 라인 효과 */}
      <div className="scan-line" style={{
        position: 'absolute',
        left: 0, right: 0,
        height: 80,
        background: 'linear-gradient(180deg, transparent, var(--brand-soft) 50%, transparent)',
        opacity: 0.85,
        pointerEvents: 'none',
      }} />
      {/* 글래스 알림 */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 18px',
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--brand-line)',
          borderRadius: 14,
          boxShadow: 'var(--shadow-md)',
        }}>
          <Spinner />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand-strong)' }}>
              분석 중
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--tx-2)', marginTop: 1 }}>
              잠시만 기다려 주세요…
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────
   결과
   ──────────────────────────────────────── */

function ResultView({ result, imageUrl, onRetry }) {
  const { disease, confidence } = result
  const sev = severityStyle[disease.severity]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ImageBox src={imageUrl} label="분석 결과" />

      {/* 진단 카드 */}
      <div style={{
        padding: 16,
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column', gap: 14,
        boxShadow: 'var(--shadow-xs)',
      }}>
        {/* eyebrow 라벨 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 3, height: 11, borderRadius: 2, background: sev.bar }} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--tx-3)',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}>
            진단 결과
          </span>
        </div>

        {/* 이름 + 심각도 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ fontSize: 19, fontWeight: 700, color: 'var(--tx-1)', lineHeight: 1.3, letterSpacing: '-.01em' }}>
            {disease.name}
          </span>
          <span style={{
            fontSize: 11.5, fontWeight: 700,
            padding: '4px 10px', borderRadius: 8,
            background: sev.bg, color: sev.fg,
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}>
            {sev.label}
          </span>
        </div>

        {/* 신뢰도 */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>
              신뢰도
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: sev.bar, fontVariantNumeric: 'tabular-nums' }}>
              {confidence}%
            </span>
          </div>
          <div style={{
            height: 6, borderRadius: 8,
            background: 'var(--surface-2)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${confidence}%`,
              background: sev.bar,
              borderRadius: 8,
              transition: 'width .5s ease-out',
            }} />
          </div>
        </div>

        <div style={{
          fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.6,
          paddingTop: 12,
          borderTop: '0.5px solid var(--bd-soft)',
        }}>
          {disease.description}
        </div>
      </div>

      {/* 권장 조치 */}
      <div style={{
        padding: 16,
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
        borderRadius: 14,
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <div style={{ width: 3, height: 11, borderRadius: 2, background: 'var(--brand)' }} />
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: 'var(--tx-3)',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}>
            권장 조치
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {disease.actions.map((action, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--brand-soft)',
                border: '0.5px solid var(--brand-line)',
                color: 'var(--brand-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11.5, fontWeight: 700,
                flexShrink: 0,
                fontFamily: 'var(--ff)',
              }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--tx-2)', lineHeight: 1.55, flex: 1, paddingTop: 1 }}>
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div style={{
        padding: '11px 13px',
        background: 'var(--surface-2)',
        border: '0.5px solid var(--bd-soft)',
        borderRadius: 11,
        fontSize: 11.5, color: 'var(--tx-3)', lineHeight: 1.55,
        display: 'flex', alignItems: 'flex-start', gap: 8,
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" fill="none" opacity=".7"/>
          <line x1="7" y1="6" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7" cy="4.2" r=".7" fill="currentColor"/>
        </svg>
        <span>
          본 결과는 AI의 추정치입니다. 증상이 심각하거나 확신이 어려운 경우 전문가 상담을 권장해요.
        </span>
      </div>

      <button
        onClick={onRetry}
        style={{
          padding: '13px',
          background: 'var(--brand)',
          border: 'none',
          borderRadius: 11,
          fontSize: 14, fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        다른 사진 분석하기
      </button>
    </div>
  )
}

/* ────────────────────────────────────────
   공통
   ──────────────────────────────────────── */

function ImageBox({ src, label }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '4 / 3',
      background: 'var(--surface-2)',
      border: '0.5px solid var(--bd-soft)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <img
        src={src}
        alt="업로드된 식물 사진"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {label && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          padding: '4px 9px',
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid var(--bd-soft)',
          borderRadius: 8,
          fontSize: 10.5, fontWeight: 600,
          color: 'var(--tx-2)',
          letterSpacing: '.02em',
          fontFamily: 'var(--ff)',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none">
      <path d="M4 9.5A2 2 0 016 7.5h1.2L9 5h8l1.8 2.5H20a2 2 0 012 2v9A2 2 0 0120 20.5H6a2 2 0 01-2-2v-9z"
        stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      <circle cx="13" cy="14" r="3.6" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function LeafScanIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
      <path d="M11 4C7.7 4 5 6.7 5 10c0 2 1 3.8 2.5 4.9L7 19h8l-.5-4.1C16 13.8 17 12 17 10c0-3.3-2.7-6-6-6z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
      <line x1="11" y1="8" x2="11" y2="17" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".7"/>
      <circle cx="11" cy="11" r="1.4" stroke="currentColor" strokeWidth="1.1" fill="none"/>
    </svg>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 22, height: 22,
      border: '2.2px solid var(--brand-line)',
      borderTopColor: 'var(--brand)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export default Analysis
