import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DailyReportDetail from '../components/DailyReportDetail'
import GreenhouseSwitcher from '../components/GreenhouseSwitcher'
import { riskLabel, riskColor } from '../data/dailyReports'
import { plants } from '../data/plants'
import { getReportList, generateTodayReport, generateDailyReport } from '../api/report'
import { getMyGreenhouses } from '../api/greenhouse'
import { getActiveGreenhouseId, setActiveGreenhouseId } from '../utils/storage'
import { substituteGreenhouseId } from '../utils/reportText'

function Reports() {
  const navigate = useNavigate()
  const [greenhouses, setGreenhouses] = useState([])
  const [activeId, setActiveIdState] = useState(getActiveGreenhouseId())
  const [reports, setReports]   = useState([])
  // loading은 상태가 아닌 파생값 (마지막으로 fetch 완료된 activeId 기준)
  const [fetchedActiveId, setFetchedActiveId] = useState(null)
  const loading = !!activeId && fetchedActiveId !== activeId
  const [error, setError]       = useState(null)
  const [active, setActive]     = useState(null)  // 상세 모달
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)
  // 캘린더 셀 클릭으로 과거 날짜를 수동 생성하는 중인지 — 'YYYY-MM-DD' 또는 null
  const [creatingDate, setCreatingDate] = useState(null)

  const today = new Date()
  const [viewYear, setViewYear]   = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1)
  // 사용자 로컬(KST 가정) 기준 오늘 ISO — 미래 날짜 클릭 차단용
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // greenhouseId → 식물명 매핑 (요약 텍스트의 'gh-XXX' 치환용)
  const plantNameMap = useMemo(() => {
    const map = {}
    for (const gh of greenhouses) {
      const plant = plants.find(p => p.id === gh.plantType)
      map[gh.greenhouseId] = plant?.name ?? gh.plantType ?? '식물'
    }
    return map
  }, [greenhouses])

  // GreenhouseSwitcher용 데이터 (Sensor.jsx의 buildSwitcherList와 동일한 형식)
  const switcherList = useMemo(() =>
    greenhouses.map(gh => {
      const plant = plants.find(p => p.id === gh.plantType)
      return {
        id: gh.greenhouseId,
        name: plant?.name ?? gh.plantType ?? gh.greenhouseId,
        plant: plant
          ? { name: plant.name, theme: plant.theme }
          : { name: gh.plantType ?? gh.greenhouseId },
      }
    })
  , [greenhouses])

  // summary 안의 greenhouseId를 식물명으로 치환한 리포트
  const displayReports = useMemo(() =>
    reports.map(r => ({
      ...r,
      summary: substituteGreenhouseId(r.summary, r.greenhouseId, plantNameMap[r.greenhouseId]),
    }))
  , [reports, plantNameMap])

  const reportByDate = useMemo(() => {
    const map = {}
    for (const r of displayReports) {
      if (r?.date) map[r.date] = r
    }
    return map
  }, [displayReports])

  const selectActiveId = (id) => {
    setActiveIdState(id)
    setActiveGreenhouseId(id)
  }

  const handleDayClick = async (iso) => {
    const r = reportByDate[iso]
    if (r) {
      setActive(r)
      return
    }
    // 점이 없는 날짜 — 과거(또는 오늘)면 BE에 수동 생성 요청
    if (!activeId) return
    if (iso > todayIso) return            // 미래 날짜는 무시
    if (creatingDate) return              // 다른 날짜 생성 중이면 무시
    if (!window.confirm(`${iso} 리포트를 만들까요?\n해당 날짜의 측정 데이터로 리포트를 생성해요.`)) return
    setCreatingDate(iso)
    setGenerateError(null)
    try {
      await generateDailyReport(activeId, iso)
      await fetchReports(activeId)
    } catch (err) {
      console.error('일자 리포트 생성 실패:', err)
      setGenerateError(err.message ?? '리포트 생성에 실패했어요.')
    } finally {
      setCreatingDate(null)
    }
  }

  const movePrev = () => {
    if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12) }
    else setViewMonth(viewMonth - 1)
  }
  const moveNext = () => {
    if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1) }
    else setViewMonth(viewMonth + 1)
  }

  const fetchReports = async (id) => {
    if (!id) return
    setError(null)
    try {
      const list = await getReportList(id, 30)
      setReports(Array.isArray(list) ? list : [])
    } catch (err) {
      console.error('리포트 목록 조회 실패:', err)
      setError(err.message || '리포트를 불러오지 못했어요.')
    }
  }

  // 마운트 시 내 온실 목록 + 활성 온실 보정
  useEffect(() => {
    let cancelled = false
    getMyGreenhouses()
      .then((list) => {
        if (cancelled) return
        setGreenhouses(list)
        const ids = list.map(g => g.greenhouseId)
        if (!ids.includes(activeId) && ids.length > 0) {
          selectActiveId(ids[0])
        }
      })
      .catch((err) => console.error('온실 목록 조회 실패:', err))
    return () => { cancelled = true }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // 활성 온실 바뀌면 해당 온실 리포트 fetch
  // loading은 fetchedActiveId !== activeId로 파생되므로 effect 본문에서 setState 불필요
  useEffect(() => {
    if (!activeId) return
    let cancelled = false
    getReportList(activeId, 30)
      .then((list) => {
        if (cancelled) return
        setReports(Array.isArray(list) ? list : [])
        setFetchedActiveId(activeId)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('리포트 목록 조회 실패:', err)
        setError(err.message || '리포트를 불러오지 못했어요.')
        setFetchedActiveId(activeId)
      })
    return () => { cancelled = true }
  }, [activeId])

  // 모든 온실에 대해 리포트 생성 (병렬), 완료 후 활성 온실 리포트 새로고침
  const handleGenerate = async () => {
    if (generating || greenhouses.length === 0) return
    setGenerating(true)
    setGenerateError(null)
    const targets = greenhouses.map(g => g.greenhouseId)
    const results = await Promise.allSettled(
      targets.map(id => generateTodayReport(id))
    )
    const failures = results
      .map((r, i) => r.status === 'rejected' ? targets[i] : null)
      .filter(Boolean)
    if (failures.length === targets.length) {
      setGenerateError('모든 온실의 리포트 생성에 실패했어요.')
    } else if (failures.length > 0) {
      const names = failures.map(id => plantNameMap[id] ?? id).join(', ')
      setGenerateError(`일부 실패: ${names}`)
    }
    await fetchReports(activeId)
    setGenerating(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/ai')}
        style={{
          alignSelf: 'flex-start',
          padding: '6px 0',
          background: 'none', border: 'none',
          fontSize: 12.5, color: 'var(--tx-2)', fontWeight: 500,
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
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--tx-1)' }}>
            지난 리포트
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--tx-3)', marginTop: 4 }}>
            매일 자동으로 생성되는 일일 리포트를 모아 보세요.
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating || !activeId}
          style={{
            padding: '8px 12px',
            background: (generating || !activeId) ? 'var(--brand-tint)' : 'var(--brand)',
            border: 'none', borderRadius: 10,
            fontSize: 12.5, fontWeight: 700,
            color: '#fff',
            cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--ff)',
            flexShrink: 0,
            boxShadow: (generating || !activeId) ? 'none' : 'var(--shadow-xs)',
          }}
        >
          {generating ? '생성 중…' : '오늘 새로 생성'}
        </button>
      </div>

      {generateError && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--danger-bg)',
          border: '0.5px solid var(--danger-bd)',
          borderRadius: 10,
          fontSize: 12.5, color: 'var(--danger-tx)',
        }}>
          {generateError}
        </div>
      )}

      {greenhouses.length > 1 && activeId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '0 2px' }}>
          <GreenhouseSwitcher
            greenhouses={switcherList}
            activeId={activeId}
            onChange={selectActiveId}
          />
        </div>
      )}

      {!activeId ? (
        <div style={{
          minHeight: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 8, padding: 20, textAlign: 'center',
          color: 'var(--tx-3)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
            활성 온실이 없어요
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--tx-3)', maxWidth: 280, lineHeight: 1.5 }}>
            먼저 식물을 등록해 주세요.
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            style={{
              marginTop: 6,
              padding: '8px 16px',
              background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--ff)',
              boxShadow: 'var(--shadow-xs)',
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
              todayIso={todayIso}
              creatingDate={creatingDate}
              onPrev={movePrev}
              onNext={moveNext}
              onDayClick={handleDayClick}
            />
          )}

          {loading ? (
            <div style={{
              minHeight: 200,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--tx-3)', fontSize: 13.5,
            }}>
              리포트를 불러오는 중…
            </div>
          ) : error ? (
            <div style={{
              padding: '10px 12px',
              background: 'var(--danger-bg)',
              border: '0.5px solid var(--danger-bd)',
              borderRadius: 10,
              fontSize: 13, color: 'var(--danger-tx)',
            }}>
              {error}
            </div>
          ) : displayReports.length === 0 ? (
            <div style={{
              minHeight: 200,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 20, textAlign: 'center',
              color: 'var(--tx-3)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
                아직 생성된 리포트가 없어요
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--tx-3)', maxWidth: 280, lineHeight: 1.5 }}>
                센서 데이터가 충분히 쌓이면 매일 자동으로 만들어져요.<br />
                지금 만들어보려면 위 "오늘 새로 생성" 버튼을 눌러 주세요.
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {displayReports.map((r) => (
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

function MonthCalendar({ year, month, reportByDate, todayIso, creatingDate, onPrev, onNext, onDayClick }) {
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
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
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
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx-1)' }}>
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
            color: i === 0 ? '#e84040' : i === 6 ? '#3b82c4' : 'var(--tx-3)',
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
          const isFuture = todayIso ? iso > todayIso : false
          const isCreating = creatingDate === iso
          // 점 없는 과거/오늘 날짜도 수동 생성을 위해 클릭 가능
          const canClick = (hasReport || (!isFuture && !creatingDate))
          const dotColor = hasReport ? (riskColor[report.riskLevel] ?? 'var(--brand)') : null
          return (
            <button
              key={i}
              onClick={() => onDayClick(iso)}
              disabled={!canClick}
              title={!hasReport && !isFuture ? '리포트 생성' : undefined}
              style={{
                aspectRatio: '1',
                position: 'relative',
                background: 'transparent',
                border: 'none',
                cursor: canClick ? 'pointer' : 'default',
                fontFamily: 'var(--ff)',
                display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                padding: 0,
                opacity: isCreating ? 0.5 : 1,
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: isToday ? 'var(--brand-soft)' : 'transparent',
                border: isToday ? '0.5px solid var(--brand-line)' : '0.5px solid transparent',
                color: isToday
                  ? 'var(--brand-strong)'
                  : (hasReport ? 'var(--tx-1)' : 'var(--tx-4)'),
                fontWeight: (isToday || hasReport) ? 600 : 400,
                fontSize: 12.5,
                lineHeight: 1,
              }}>
                {d}
              </span>
              {dotColor && (
                <span style={{
                  position: 'absolute',
                  bottom: 6,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 5, height: 5, borderRadius: '50%',
                  background: dotColor,
                }} />
              )}
              {isCreating && (
                <span style={{
                  position: 'absolute',
                  bottom: 5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: 9, fontWeight: 700, color: 'var(--brand-strong)',
                  lineHeight: 1,
                }}>
                  …
                </span>
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
  background: 'var(--surface-2)',
  border: '0.5px solid var(--bd-soft)',
  color: 'var(--tx-2)',
  fontSize: 13, fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--ff)',
}

function ReportCard({ report, onClick }) {
  const color = riskColor[report.riskLevel] ?? 'var(--tx-3)'
  const formattedDate = formatDate(report.date)
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--bd)',
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
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx-1)' }}>
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
        fontSize: 12, color: 'var(--tx-2)', lineHeight: 1.5,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {report.summary ?? '요약 정보가 없습니다.'}
      </div>
      <div style={{
        display: 'flex', gap: 10,
        fontSize: 11, color: 'var(--tx-3)',
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
