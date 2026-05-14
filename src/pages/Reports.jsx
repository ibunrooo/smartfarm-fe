import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DailyReportDetail from '../components/DailyReportDetail'
import { riskLabel, riskColor } from '../data/dailyReports'
import { getReportList, generateTodayReport } from '../api/report'
import { getActiveGreenhouseId } from '../utils/storage'

function Reports() {
  const navigate = useNavigate()
  const greenhouseId = getActiveGreenhouseId()
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(!!greenhouseId)
  const [error, setError]       = useState(null)
  const [active, setActive]     = useState(null)  // 상세 모달
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)

  const reportByDate = useMemo(() => {
    const map = {}
    for (const r of reports) {
      if (r?.date) map[r.date] = r
    }
    return map
  }, [reports])

  const handleDayClick = (iso) => {
    const r = reportByDate[iso]
    if (r) setActive(r)
  }

  const movePrev = () => {
    if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12) }
    else setViewMonth(viewMonth - 1)
  }
  const moveNext = () => {
    if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1) }
    else setViewMonth(viewMonth + 1)
  }

  const fetchReports = async () => {
    if (!greenhouseId) return
    setError(null)
    try {
      const list = await getReportList(greenhouseId, 30)
      setReports(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('리포트 목록 조회 실패:', err)
      setError(err.message || '리포트를 불러오지 못했어요.')
    }
  }

  useEffect(() => {
    if (!greenhouseId) return
    let cancelled = false
    getReportList(greenhouseId, 30)
      .then((list) => {
        if (cancelled) return
        setReports(Array.isArray(list) ? list : [])
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('리포트 목록 조회 실패:', err)
        setError(err.message || '리포트를 불러오지 못했어요.')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [greenhouseId])

  const handleGenerate = async () => {
    if (generating || !greenhouseId) return
    setGenerating(true)
    setGenerateError(null)
    try {
      await generateTodayReport(greenhouseId)
      await fetchReports()  // 목록 새로고침
    } catch (err) {
      console.error('리포트 생성 실패:', err)
      setGenerateError(err.message || '리포트 생성에 실패했어요.')
    }
    setGenerating(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      <button
        onClick={() => navigate('/ai')}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 12.5, color: '#666', fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        ← AI 채팅으로
      </button>

      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2px',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#1a1a1a' }}>
            지난 리포트
          </div>
          <div style={{ fontSize: 12.5, color: '#888', marginTop: 4 }}>
            매일 자동으로 생성되는 일일 리포트를 모아 보세요.
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !greenhouseId}
          style={{
            padding: '8px 12px',
            background: (generating || !greenhouseId) ? '#cfe7d4' : '#2ea84e',
            border: 'none', borderRadius: 10,
            fontSize: 12.5, fontWeight: 700,
            color: '#fff',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ff)',
            flexShrink: 0,
          }}
        >
          {generating ? '생성 중…' : '오늘 새로 생성'}
        </button>
      </div>

      {generateError && (
        <div style={{
          padding: '8px 12px',
          background: '#fff1f1',
          border: '0.5px solid #fcc',
          borderRadius: 10,
          fontSize: 12.5, color: '#991f1f',
        }}>
          {generateError}
        </div>
      )}

      {!greenhouseId ? (
        <div style={{
          minHeight: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: 20, textAlign: 'center',
          color: '#888',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            활성 온실이 없어요
          </div>
          <div style={{ fontSize: 12.5, color: '#888', maxWidth: 280, lineHeight: 1.5 }}>
            먼저 식물을 등록해 주세요.
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              marginTop: 6,
              padding: '8px 16px',
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
      ) : (
        <>
          {!loading && !error && (
            <MonthCalendar
              year={viewYear}
              month={viewMonth}
              reportByDate={reportByDate}
              onPrev={movePrev}
              onNext={moveNext}
              onDayClick={handleDayClick}
            />
          )}

          {loading ? (
            <div style={{
              minHeight: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#888', fontSize: 13.5,
            }}>
              리포트를 불러오는 중…
            </div>
          ) : error ? (
            <div style={{
              padding: '10px 12px',
              background: '#fff1f1',
              border: '0.5px solid #fcc',
              borderRadius: 10,
              fontSize: 13, color: '#991f1f',
            }}>
              {error}
            </div>
          ) : reports.length === 0 ? (
            <div style={{
              minHeight: 200,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 20, textAlign: 'center',
              color: '#888',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
                아직 생성된 리포트가 없어요
              </div>
              <div style={{ fontSize: 12.5, color: '#888', maxWidth: 280, lineHeight: 1.5 }}>
                센서 데이터가 충분히 쌓이면 매일 자동으로 만들어져요.<br />
                지금 만들어보려면 위 "오늘 새로 생성" 버튼을 눌러 주세요.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {reports.map((r) => (
                <ReportCard key={r.date} report={r} onClick={() => setActive(r)} />
              ))}
            </div>
          )}
        </>
      )}

      <DailyReportDetail report={active} onClose={() => setActive(null)} />
    </div>
  )
}

function MonthCalendar({ year, month, reportByDate, onPrev, onNext, onDayClick }) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay  = new Date(year, month, 0)
  const startWeekday = firstDay.getDay()  // 0=일 ~ 6=토
  const daysInMonth  = lastDay.getDate()

  const today = new Date()
  const isThisMonth = today.getFullYear() === year && (today.getMonth() + 1) === month
  const todayDate = isThisMonth ? today.getDate() : -1

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e8e8e8',
      borderRadius: 14,
      padding: 14,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <button
          onClick={onPrev}
          style={navBtnStyle}
          aria-label="이전 달"
        >←</button>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
          {year}년 {month}월
        </div>
        <button
          onClick={onNext}
          style={navBtnStyle}
          aria-label="다음 달"
        >→</button>
      </div>

      {/* 요일 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {WEEKDAYS.map((w, i) => (
          <div key={w} style={{
            textAlign: 'center',
            fontSize: 11, fontWeight: 600,
            color: i === 0 ? '#e84040' : i === 6 ? '#3b82c4' : '#888',
            padding: '4px 0',
          }}>
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {cells.map((d, i) => {
          if (d == null) return <div key={i} />
          const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const report = reportByDate[iso]
          const hasReport = !!report
          const isToday = d === todayDate
          const dotColor = hasReport ? (riskColor[report.riskLevel] ?? '#2ea84e') : null
          return (
            <button
              key={i}
              onClick={() => onDayClick(iso)}
              disabled={!hasReport}
              style={{
                aspectRatio: '1',
                background: isToday ? '#f2faf3' : 'transparent',
                border: isToday ? '1px solid #2ea84e' : '0.5px solid transparent',
                borderRadius: 8,
                cursor: hasReport ? 'pointer' : 'default',
                color: hasReport ? '#1a1a1a' : '#ccc',
                fontWeight: hasReport ? 600 : 400,
                fontSize: 12.5,
                fontFamily: 'var(--ff)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 2,
                padding: 0,
              }}
            >
              <span>{d}</span>
              {dotColor && (
                <span style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: dotColor,
                }} />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

const navBtnStyle = {
  width: 28, height: 28,
  borderRadius: 8,
  background: '#f5f5f5',
  border: 'none',
  color: '#666',
  fontSize: 13, fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--ff)',
}

function ReportCard({ report, onClick }) {
  const color = riskColor[report.riskLevel] ?? '#888'
  const formattedDate = formatDate(report.date)
  return (
    <button
      onClick={onClick}
      style={{
        background: '#fff',
        border: '0.5px solid #e8e8e8',
        borderRadius: 14,
        padding: 14,
        cursor: 'pointer',
        fontFamily: 'var(--ff)',
        textAlign: 'left',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>
          {formattedDate}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 700,
          padding: '2px 7px', borderRadius: 6,
          background: `${color}22`,
          color,
        }}>
          {riskLabel[report.riskLevel] ?? '-'}
        </span>
      </div>
      <div style={{
        fontSize: 12, color: '#444', lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {report.summary ?? '요약 정보가 없습니다.'}
      </div>
      <div style={{
        display: 'flex', gap: 10,
        fontSize: 11, color: '#888',
      }}>
        <span>알림 {report.alertCount ?? 0}건</span>
        <span style={{ opacity: .4 }}>·</span>
        <span>데이터 {report.dataCount?.toLocaleString?.() ?? '-'}건</span>
      </div>
    </button>
  )
}

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${y}.${m}.${d}`
}

export default Reports
