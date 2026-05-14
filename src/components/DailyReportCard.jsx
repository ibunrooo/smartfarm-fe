import { riskLabel, riskColor } from '../data/dailyReports'

function deriveRiskScore(report) {
  if (typeof report?.riskScore === 'number') return report.riskScore
  if (report?.riskLevel === 'high')   return 85
  if (report?.riskLevel === 'medium') return 55
  return 20
}

function DailyReportCard({ report, onShowDetail }) {
  const color = riskColor[report.riskLevel] ?? '#888'
  const score = deriveRiskScore(report)
  const recs  = report.recommendations ?? report.actions ?? []

  return (
    <div style={{
      width: '100%',
      maxWidth: 320,
      background: '#fff',
      border: '0.5px solid #e8e8e8',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '10px 14px',
        background: '#f8fdf9',
        borderBottom: '0.5px solid #ddf2e2',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChartIcon />
          <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1e8a3c' }}>
            일일 리포트
          </span>
        </div>
        <span style={{ fontSize: 11.5, color: '#888' }}>
          {formatDate(report.date)}
        </span>
      </div>

      {/* 본문 */}
      <div style={{ padding: 14 }}>
        {/* 요약 */}
        <div style={{
          fontSize: 13, color: '#444', lineHeight: 1.55, marginBottom: 12,
        }}>
          {report.summary}
        </div>

        {/* 위험도 */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 5,
          }}>
            <span style={{ fontSize: 11.5, color: '#888', fontWeight: 500 }}>
              병해충 위험도
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color }}>
              {riskLabel[report.riskLevel] ?? '-'} · {score}%
            </span>
          </div>
          <div style={{
            height: 5, background: '#f0f0f0', borderRadius: 8, overflow: 'hidden',
          }}>
            <div style={{
              width: `${score}%`,
              height: '100%',
              background: color,
            }} />
          </div>
        </div>

        {/* 행동 추천 */}
        <div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, color: '#888',
            marginBottom: 5,
          }}>
            추천 행동
          </div>
          {recs.map((action, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 6,
              fontSize: 12.5, color: '#444', lineHeight: 1.5,
              padding: '3px 0',
            }}>
              <div style={{
                width: 4, height: 4, borderRadius: '50%',
                background: '#2ea84e',
                marginTop: 6, flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>{action}</div>
            </div>
          ))}
        </div>

        {/* 상세 보기 */}
        <button
          onClick={onShowDetail}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '8px 0',
            background: '#f8fdf9',
            border: '0.5px solid #ddf2e2',
            borderRadius: 8,
            fontSize: 12.5, fontWeight: 600,
            color: '#1e8a3c',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          상세 리포트 보기 →
        </button>
      </div>
    </div>
  )
}

function formatDate(isoDate) {
  const [, m, d] = isoDate.split('-')
  return `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function ChartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="9"  width="2.5" height="3.5" rx=".4" fill="currentColor" stroke="currentColor" strokeWidth=".4"/>
      <rect x="6" y="6"  width="2.5" height="6.5" rx=".4" fill="currentColor" stroke="currentColor" strokeWidth=".4"/>
      <rect x="10" y="3" width="2.5" height="9.5" rx=".4" fill="currentColor" stroke="currentColor" strokeWidth=".4"/>
    </svg>
  )
}

export default DailyReportCard
