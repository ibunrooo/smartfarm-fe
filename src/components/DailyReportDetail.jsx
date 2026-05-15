import { useEffect } from 'react'
import { riskLabel, riskColor, alertTypeLabel } from '../data/dailyReports'

function DailyReportDetail({ report, onClose }) {
  useEffect(() => {
    if (!report) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [report, onClose])

  if (!report) return null

  const color = riskColor[report.riskLevel] ?? 'var(--tx-3)'
  const score = typeof report.riskScore === 'number'
    ? report.riskScore
    : (report.riskLevel === 'high' ? 85 : report.riskLevel === 'medium' ? 55 : 20)
  const recs = report.recommendations ?? report.actions ?? []
  const formattedDate = formatFullDate(report.date)
  const createdTime   = formatCreatedTime(report.createdAt)

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
        style={{
          background: 'var(--surface)',
          borderRadius: 16,
          boxShadow: 'var(--shadow-lg)',
          width: '100%', maxWidth: 480,
          maxHeight: '90dvh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '0.5px solid var(--brand-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          background: 'var(--brand-soft)',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--brand-strong)' }}>
              일일 리포트
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx-2)', marginTop: 2 }}>
              {formattedDate}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0,0,0,.04)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--tx-2)',
              fontSize: 18, lineHeight: 1,
              fontFamily: 'var(--ff)',
            }}
          >
            ×
          </button>
        </div>

        {/* 본문 (스크롤) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {/* 요약 */}
          <div style={{
            padding: 14,
            background: 'var(--brand-soft)',
            border: '0.5px solid var(--brand-line)',
            borderRadius: 12,
            fontSize: 13, color: 'var(--tx-2)', lineHeight: 1.55,
            marginBottom: 14,
          }}>
            {report.summary}
          </div>

          {/* 위험도 */}
          <Section title="병해충 위험도">
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{ fontSize: 11.5, color: 'var(--tx-3)' }}>현재 위험도</span>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>
                {riskLabel[report.riskLevel] ?? '-'} · {score}%
              </span>
            </div>
            <div style={{
              height: 7, borderRadius: 8, background: 'var(--surface-2)', overflow: 'hidden',
            }}>
              <div style={{ width: `${score}%`, height: '100%', background: color }} />
            </div>
          </Section>

          {/* 오늘의 평균 4종 */}
          <Section title="오늘의 평균">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}>
              <StatCard label="온도"     value={fmtNum(report.avgTemp)}     unit="°C" />
              <StatCard label="습도"     value={fmtNum(report.avgHumidity)} unit="%" />
              <StatCard label="토양수분" value={fmtNum(report.avgSoil)}     unit="%" />
              <StatCard label="조도"     value={fmtNum(report.avgLux)}      unit="lux" />
            </div>
          </Section>

          {/* 알림 breakdown */}
          {report.alertCount > 0 && (
            <Section title={`알림 (${report.alertCount}건)`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(report.alertTypeCounts).map(([type, count]) => (
                  <div key={type} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px',
                    background: 'var(--warn-bg)',
                    border: '0.5px solid var(--warn-bd)',
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 12.5, color: 'var(--warn-tx)', fontWeight: 600 }}>
                      {alertTypeLabel[type] ?? type}
                    </span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--warn-tx)' }}>
                      {count}건
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* 추천 행동 */}
          <Section title="추천 행동" last>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {recs.map((action, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  padding: '8px 10px',
                  background: 'var(--surface-2)',
                  borderRadius: 10,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--brand-tint)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: 1, flexShrink: 0,
                  }}>
                    <svg width="9" height="9" viewBox="0 0 8 8">
                      <path d="M1.5 4l1.5 1.5L6.5 2"
                        stroke="var(--brand)" strokeWidth="1.5" fill="none"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--tx-2)', lineHeight: 1.5, flex: 1 }}>
                    {action}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* 메타 */}
          <div style={{
            marginTop: 14, paddingTop: 12,
            borderTop: '0.5px solid var(--bd-soft)',
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'var(--tx-4)',
          }}>
            <span>데이터 {report.dataCount?.toLocaleString() ?? '-'}건 수집</span>
            <span>{createdTime} 생성</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 16 }}>
      <div style={{
        fontSize: 11.5, fontWeight: 700, color: 'var(--tx-2)',
        marginBottom: 8,
        letterSpacing: '.02em',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function StatCard({ label, value, unit }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'var(--surface-2)',
      border: '0.5px solid var(--bd-soft)',
      borderRadius: 10,
    }}>
      <div style={{ fontSize: 11, color: 'var(--tx-3)', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--tx-4)', marginLeft: 2 }}>
          {unit}
        </span>
      </div>
    </div>
  )
}

function fmtNum(n) {
  if (n === undefined || n === null) return '-'
  if (Number.isInteger(n)) return n.toLocaleString()
  return n.toFixed(1)
}

function formatFullDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function formatCreatedTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export default DailyReportDetail
