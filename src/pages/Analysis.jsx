import { useEffect, useRef, useState } from 'react'
import { diseases, severityStyle } from '../data/diseases'

function Analysis() {
  const [phase, setPhase] = useState('upload')
  const [imageUrl, setImageUrl] = useState(null)
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }, [imageUrl])

  const triggerSelect = () => fileInputRef.current?.click()

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
    setResult(null)
    setPhase('preview')
  }

  const handleAnalyze = () => {
    setPhase('loading')
    setTimeout(() => {
      const disease = diseases[Math.floor(Math.random() * diseases.length)]
      const confidence = 75 + Math.floor(Math.random() * 21)
      setResult({ disease, confidence })
      setPhase('result')
    }, 1800)
  }

  const handleReset = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(null)
    setResult(null)
    setPhase('upload')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ padding: '0 2px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
          이미지 분석
        </div>
        <div style={{ fontSize: 13.5, color: '#888', marginTop: 4 }}>
          잎 사진을 업로드하면 AI가 식물 질병을 진단해 드려요.
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

function UploadCard({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        minHeight: 220,
        background: '#fafafa',
        border: '1px dashed #c8c8c8',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: 20,
        cursor: 'pointer',
        fontFamily: 'var(--ff)',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: '#ddf2e2',
        color: '#2ea84e',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <CameraIcon />
      </div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a1a' }}>
        사진 업로드
      </div>
      <div style={{ fontSize: 12.5, color: '#888', textAlign: 'center', lineHeight: 1.5 }}>
        잎이 잘 보이는 사진일수록 정확도가 높아요.<br />
        클릭해서 갤러리/카메라에서 선택하세요.
      </div>
    </button>
  )
}

function Preview({ imageUrl, onReselect, onAnalyze }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ImageBox src={imageUrl} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onReselect}
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
          다시 선택
        </button>
        <button
          onClick={onAnalyze}
          style={{
            flex: 2,
            padding: '12px',
            background: '#2ea84e',
            border: 'none',
            borderRadius: 10,
            fontSize: 14, fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          분석하기 →
        </button>
      </div>
    </div>
  )
}

function LoadingView({ imageUrl }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ImageBox src={imageUrl} dim />
      <div style={{
        padding: 16,
        background: '#f8fdf9',
        border: '0.5px solid #ddf2e2',
        borderRadius: 12,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Spinner />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1e8a3c' }}>
            AI가 이미지를 분석 중이에요
          </div>
          <div style={{ fontSize: 12.5, color: '#666', marginTop: 2 }}>
            잠시만 기다려 주세요…
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultView({ result, imageUrl, onRetry }) {
  const { disease, confidence } = result
  const sev = severityStyle[disease.severity]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ImageBox src={imageUrl} />

      {/* 진단 카드 */}
      <div style={{
        padding: 14,
        background: '#fff',
        border: '0.5px solid #e8e8e8',
        borderRadius: 14,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>
            {disease.name}
          </span>
          <span style={{
            fontSize: 11.5, fontWeight: 700,
            padding: '3px 8px', borderRadius: 6,
            background: sev.bg, color: sev.fg,
          }}>
            {sev.label}
          </span>
        </div>

        {/* 신뢰도 바 */}
        <div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 5,
          }}>
            <span style={{ fontSize: 12.5, color: '#888', fontWeight: 500 }}>
              신뢰도
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: sev.bar }}>
              {confidence}%
            </span>
          </div>
          <div style={{
            height: 6, borderRadius: 8,
            background: '#f0f0f0',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${confidence}%`,
              background: sev.bar,
              transition: 'width .4s',
            }} />
          </div>
        </div>

        <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.55 }}>
          {disease.description}
        </div>
      </div>

      {/* 권장 조치 */}
      <div style={{
        padding: 14,
        background: '#fff',
        border: '0.5px solid #e8e8e8',
        borderRadius: 14,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 9 }}>
          권장 조치
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {disease.actions.map((action, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: '#ddf2e2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2, flexShrink: 0,
              }}>
                <svg width="8" height="8" viewBox="0 0 8 8">
                  <path d="M1.5 4l1.5 1.5L6.5 2"
                    stroke="#2ea84e" strokeWidth="1.5" fill="none"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 13.5, color: '#444', lineHeight: 1.5 }}>
                {action}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 안내 */}
      <div style={{
        padding: '10px 12px',
        background: '#fafafa',
        border: '0.5px solid #eee',
        borderRadius: 10,
        fontSize: 12, color: '#888', lineHeight: 1.5,
      }}>
        본 결과는 AI의 추정치입니다. 증상이 심각하거나 확신이 어려운 경우 전문가 상담을 권장해요.
      </div>

      <button
        onClick={onRetry}
        style={{
          padding: '12px',
          background: '#2ea84e',
          border: 'none',
          borderRadius: 10,
          fontSize: 14, fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        다른 사진 분석하기
      </button>
    </div>
  )
}

function ImageBox({ src, dim }) {
  return (
    <div style={{
      width: '100%',
      aspectRatio: '4 / 3',
      background: '#f5f5f5',
      borderRadius: 14,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <img
        src={src}
        alt="업로드된 식물 사진"
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: dim ? 0.6 : 1,
        }}
      />
    </div>
  )
}

function CameraIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M4 9.5A2 2 0 016 7.5h1.2L9 5h8l1.8 2.5H20a2 2 0 012 2v9A2 2 0 0120 20.5H6a2 2 0 01-2-2v-9z"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
      <circle cx="13" cy="14" r="3.6" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  )
}

function Spinner() {
  return (
    <div style={{
      width: 28, height: 28,
      border: '2.5px solid #ddf2e2',
      borderTopColor: '#2ea84e',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export default Analysis
