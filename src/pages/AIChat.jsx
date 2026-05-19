import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DailyReportCard from '../components/DailyReportCard'
import DailyReportDetail from '../components/DailyReportDetail'
import sproutIcon from '../assets/sprout.png'
import { plants } from '../data/plants'
import { getLatestReport, postReportChat, REPORT_CHAT_MAX_MESSAGE_LENGTH } from '../api/report'
import { getMyGreenhouses } from '../api/greenhouse'
import { getActiveGreenhouseId } from '../utils/storage'
import { substituteGreenhouseId } from '../utils/reportText'
import { isPushSupported, enablePushForAllGreenhouses } from '../utils/push'
import { sendPushTest } from '../api/push'

const CHAT_CACHE_KEY = 'farm-me:aiChatMessages'
const TRANSIENT_IDS = new Set(['w-loading', 'w-no-plant', 'w-no-report', 'w-err', 'w-intro', 'ai-typing'])

function nowParts() {
  return partsFromDate(new Date())
}

function partsFromDate(d) {
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  const date = d.toISOString().slice(0, 10)
  return { time, date }
}

// BE의 ISO 타임스탬프 → 메시지 표시용 time/date. 파싱 실패 시 현재 시각으로 폴백.
function partsFromISO(iso) {
  if (!iso) return nowParts()
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return nowParts()
  return partsFromDate(d)
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function loadCachedChat() {
  try {
    const raw = localStorage.getItem(CHAT_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.date || !Array.isArray(parsed.messages)) return null
    if (parsed.date !== todayISO()) return null
    return parsed.messages
  } catch {
    return null
  }
}

function saveCachedChat(messages) {
  try {
    localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify({
      date: todayISO(),
      messages,
    }))
  } catch {
    /* private mode 등에서 무시 */
  }
}

function buildWelcomeMessages() {
  const { time, date } = nowParts()
  return [
    { id: 'w-welcome', sender: 'ai', type: 'text', text: '안녕하세요. 팜-므파탈 AI 재배 도우미예요!', time, date },
    { id: 'w-loading',  sender: 'ai', type: 'text', text: '오늘의 일일 리포트를 가져오는 중이에요…', time, date },
  ]
}

function stripTransient(messages) {
  return messages.filter(m => !TRANSIENT_IDS.has(m.id))
}

function hasReportMessage(messages) {
  return messages.some(m => m.type === 'report')
}

function AIChat() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(() => loadCachedChat() ?? buildWelcomeMessages())
  const [draft, setDraft] = useState('')
  const [activeReport, setActiveReport] = useState(null)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  // 캐시: 로딩 중 상태는 저장하지 않음 (settle된 후만 디스크에 반영)
  useEffect(() => {
    if (messages.some(m => m.id === 'w-loading')) return
    saveCachedChat(messages)
  }, [messages])

  // 리포트 fetch — 이미 캐시에 리포트가 있으면 건너뜀
  useEffect(() => {
    if (hasReportMessage(messages)) return
    let cancelled = false

    getMyGreenhouses()
      .then(async (greenhouses) => {
        if (cancelled) return

        if (!greenhouses.length) {
          const { time, date } = nowParts()
          setMessages(prev => [
            ...stripTransient(prev),
            {
              id: 'w-no-plant', sender: 'ai', type: 'text',
              text: '먼저 식물을 등록해 주세요. 등록하시면 매일의 리포트를 보내드릴게요.',
              time, date,
            },
          ])
          return
        }

        const results = await Promise.all(
          greenhouses.map(gh =>
            getLatestReport(gh.greenhouseId)
              .then(report => ({ greenhouse: gh, report }))
              .catch(() => ({ greenhouse: gh, report: null }))
          )
        )
        if (cancelled) return

        const available = results.filter(r => r.report)
        const { time, date } = nowParts()

        if (available.length === 0) {
          setMessages(prev => [
            ...stripTransient(prev),
            {
              id: 'w-no-report', sender: 'ai', type: 'text',
              text: '아직 일일 리포트가 준비되지 않았어요. 센서 데이터가 충분히 쌓이면 만들어드릴게요.',
              time, date,
            },
          ])
          return
        }

        const intro = '오늘의 일일 리포트를 보내드릴게요.'
        // 인트로는 가장 이른 리포트 생성 시각에 맞춤 — "BE가 8시에 보낸 메시지" 느낌
        const introParts = (() => {
          const isoList = available.map(r => r.report.createdAt).filter(Boolean)
          if (!isoList.length) return { time, date }
          const earliest = isoList.reduce((a, b) => (a < b ? a : b))
          return partsFromISO(earliest)
        })()

        setMessages(prev => {
          const without = stripTransient(prev)
          const reportMessages = available.map(({ greenhouse, report }) => {
            const plant = plants.find(p => p.id === greenhouse.plantType)
            const plantName = plant?.name ?? greenhouse.plantType ?? '식물'
            const { time: rTime, date: rDate } = partsFromISO(report.createdAt)
            return {
              id: `r-${greenhouse.greenhouseId}-${report.date ?? Date.now()}`,
              sender: 'ai',
              type: 'report',
              report: {
                ...report,
                plantName,
                summary: substituteGreenhouseId(report.summary, greenhouse.greenhouseId, plantName),
              },
              time: rTime, date: rDate,
            }
          })
          return [
            ...without,
            { id: 'w-intro', sender: 'ai', type: 'text', text: intro, time: introParts.time, date: introParts.date },
            ...reportMessages,
          ]
        })
      })
      .catch((err) => {
        if (cancelled) return
        console.error('리포트 조회 실패:', err)
        const { time, date } = nowParts()
        setMessages(prev => [
          ...stripTransient(prev),
          {
            id: 'w-err', sender: 'ai', type: 'text',
            text: '리포트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
            time, date,
          },
        ])
      })

    return () => { cancelled = true }
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || sending) return

    const ghId = getActiveGreenhouseId()
    const { time, date } = nowParts()
    const userId = Date.now()

    setDraft('')
    setSending(true)
    setMessages(prev => [
      ...prev,
      { id: userId, sender: 'user', type: 'text', text: trimmed, time, date },
      { id: 'ai-typing', sender: 'ai', type: 'text', text: '답변을 작성하고 있어요…', time, date },
    ])

    if (!ghId) {
      const { time: t, date: d } = nowParts()
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'ai-typing'),
        {
          id: userId + 1, sender: 'ai', type: 'text',
          text: '먼저 식물을 등록해 주세요. 등록하시면 대화도 시작할 수 있어요.',
          time: t, date: d,
        },
      ])
      setSending(false)
      return
    }

    // 직전 텍스트 메시지들로 chatHistory 구성 (안내성 메시지 제외, 최근 10개)
    const chatHistory = messages
      .filter(m => m.type === 'text' && !TRANSIENT_IDS.has(m.id) && m.id !== 'w-welcome')
      .slice(-10)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

    try {
      const res = await postReportChat(ghId, trimmed, chatHistory)
      const { time: t, date: d } = nowParts()
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'ai-typing'),
        {
          id: userId + 1, sender: 'ai', type: 'text',
          text: res?.reply ?? '죄송해요, 응답을 받지 못했어요.',
          time: t, date: d,
        },
      ])
    } catch (err) {
      console.error('AI 채팅 실패:', err)
      const { time: t, date: d } = nowParts()
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'ai-typing'),
        {
          id: userId + 1, sender: 'ai', type: 'text',
          text: '답변을 가져오지 못했어요. 잠시 후 다시 시도해주세요.',
          time: t, date: d,
        },
      ])
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      flex: 1, minHeight: 0, width: '100%',
      maxWidth: 640, margin: '0 auto',
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid var(--bd-soft)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LogoSproutIcon size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--tx-1)' }}>
            AI 재배 도우미
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--tx-4)', marginTop: 1, lineHeight: 1.3 }}>
            대화는 매일 00시에 초기화돼요.
          </div>
        </div>
        <button
          onClick={() => navigate('/reports')}
          style={{
            padding: '6px 10px',
            background: 'var(--brand-soft)',
            border: '0.5px solid var(--brand-line)',
            borderRadius: 8,
            fontSize: 11.5, fontWeight: 600,
            color: 'var(--brand-strong)',
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
            flexShrink: 0,
          }}
        >
          지난 리포트
        </button>
      </div>

      <NotificationBanner />

      {/* 메시지 영역 */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto',
        background: 'var(--surface-2)',
        padding: '12px 14px',
      }}>
        {renderWithDateDividers(messages, setActiveReport)}
      </div>

      {/* 입력바 */}
      <div style={{
        padding: '10px 12px',
        background: 'var(--surface)',
        borderTop: '0.5px solid var(--bd-soft)',
        display: 'flex', alignItems: 'flex-end', gap: 8,
        flexShrink: 0,
      }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="메시지를 입력하세요"
          rows={1}
          maxLength={REPORT_CHAT_MAX_MESSAGE_LENGTH}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: 'var(--surface-2)',
            border: '0.5px solid var(--bd-soft)',
            borderRadius: 18,
            fontSize: 14,
            fontFamily: 'var(--ff)',
            outline: 'none',
            resize: 'none',
            minHeight: 38,
            maxHeight: 120,
            lineHeight: 1.4,
            color: 'var(--tx-1)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim() || sending}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: (draft.trim() && !sending) ? 'var(--brand)' : 'var(--brand-tint)',
            border: 'none',
            color: '#fff',
            cursor: (draft.trim() && !sending) ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: (draft.trim() && !sending) ? 'var(--shadow-xs)' : 'none',
          }}
        >
          <SendIcon />
        </button>
      </div>

      <DailyReportDetail
        report={activeReport}
        onClose={() => setActiveReport(null)}
      />
    </div>
  )
}

function renderWithDateDividers(messages, onShowReport) {
  const out = []
  let lastDate = null
  let lastSender = null

  messages.forEach((m) => {
    if (m.date !== lastDate) {
      out.push(<DateDivider key={`d-${m.date}`} date={m.date} />)
      lastDate = m.date
      lastSender = null
    }
    out.push(
      <ChatMessage
        key={m.id}
        message={m}
        showAvatar={m.sender === 'ai' && lastSender !== 'ai'}
        onShowReport={onShowReport}
      />
    )
    lastSender = m.sender
  })

  return out
}

function DateDivider({ date }) {
  const formatted = formatDate(date)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 8, margin: '14px 0 10px',
    }}>
      <div style={{ flex: 1, height: 0.5, background: 'var(--bd)', maxWidth: 80 }} />
      <span style={{ fontSize: 12, color: 'var(--tx-3)', fontWeight: 500 }}>{formatted}</span>
      <div style={{ flex: 1, height: 0.5, background: 'var(--bd)', maxWidth: 80 }} />
    </div>
  )
}

function ChatMessage({ message, showAvatar, onShowReport }) {
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end',
        gap: 6, marginBottom: 6,
      }}>
        <span style={{ fontSize: 11, color: 'var(--tx-4)', flexShrink: 0 }}>{message.time}</span>
        <div style={{
          maxWidth: '75%',
          padding: '8px 12px',
          background: 'var(--brand)',
          color: '#fff',
          borderRadius: '16px 16px 4px 16px',
          fontSize: 14,
          lineHeight: 1.45,
          wordBreak: 'break-word',
          boxShadow: 'var(--shadow-xs)',
        }}>
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      gap: 7, marginBottom: 6,
      paddingLeft: showAvatar ? 0 : 34,
    }}>
      {showAvatar && (
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: 'var(--brand-soft)',
          border: '0.5px solid var(--brand-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <LogoSproutIcon size={18} />
        </div>
      )}
      {message.type === 'report' ? (
        <div style={{ maxWidth: '85%', minWidth: 0 }}>
          <DailyReportCard
            report={message.report}
            onShowDetail={() => onShowReport?.(message.report)}
          />
        </div>
      ) : (
        <div
          className="md-content"
          style={{
            maxWidth: '75%',
            padding: '8px 12px',
            background: 'var(--surface)',
            border: '0.5px solid var(--bd-soft)',
            color: 'var(--tx-1)',
            borderRadius: '16px 16px 16px 4px',
            fontSize: 14,
            lineHeight: 1.45,
            wordBreak: 'break-word',
            minWidth: 0,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
        </div>
      )}
      <span style={{ fontSize: 11, color: 'var(--tx-4)', flexShrink: 0 }}>{message.time}</span>
    </div>
  )
}

const PUSH_TEST_ACK_KEY = 'farm-me:pushTestAck'

function readPushTestAck() {
  try { return localStorage.getItem(PUSH_TEST_ACK_KEY) === '1' } catch { return false }
}

function writePushTestAck() {
  try { localStorage.setItem(PUSH_TEST_ACK_KEY, '1') } catch { /* private mode 등 무시 */ }
}

function NotificationBanner() {
  const supported = isPushSupported()
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)
  const [testStatus, setTestStatus] = useState(null) // null | 'sent'
  const [testAck, setTestAck] = useState(readPushTestAck)

  // 권한이 이미 granted면 백엔드 구독을 한 번 더 동기화 (디바이스 변경/세션 초기화 대비)
  useEffect(() => {
    if (!supported || Notification.permission !== 'granted') return
    enablePushForAllGreenhouses().catch(err => {
      console.warn('푸시 자동 재구독 실패:', err)
    })
  }, [supported])

  if (!supported || permission === 'denied') return null

  // 권한 granted + 이미 한 번 테스트 완료 → 배너 숨김
  if (permission === 'granted' && testAck) return null

  const isGranted = permission === 'granted'

  const handleEnable = async () => {
    if (pending) return
    setPending(true)
    setError(null)
    try {
      const { subscribed, total } = await enablePushForAllGreenhouses()
      setPermission(Notification.permission)
      if (total === 0) {
        setError('식물을 등록한 뒤에 자동으로 구독돼요.')
      } else if (subscribed === 0) {
        setError('알림은 켜졌지만 서버 등록에 실패했어요. 잠시 후 다시 시도해 주세요.')
      }
    } catch (err) {
      console.warn('푸시 활성화 실패:', err)
      setPermission(supported ? Notification.permission : 'unsupported')
      setError(err.message ?? '알림을 켤 수 없어요.')
    } finally {
      setPending(false)
    }
  }

  const handleTest = async () => {
    if (pending) return
    const ghId = getActiveGreenhouseId()
    if (!ghId) {
      setError('식물을 등록한 뒤에 테스트할 수 있어요.')
      return
    }
    setPending(true)
    setError(null)
    try {
      const res = await sendPushTest(ghId)
      if (res?.sent > 0) {
        setTestStatus('sent')
        writePushTestAck()
        setTimeout(() => setTestAck(true), 2500)
      } else {
        setError('구독된 디바이스가 없어요. 알림을 다시 켜주세요.')
      }
    } catch (err) {
      console.warn('푸시 테스트 실패:', err)
      setError(err.message ?? '테스트 알림을 보내지 못했어요.')
    } finally {
      setPending(false)
    }
  }

  const subtitle = isGranted
    ? (testStatus === 'sent'
        ? '테스트 알림을 보냈어요. 잠시 후 알림이 도착해요.'
        : '알림이 켜져 있어요. 테스트 알림을 한 번 보내볼까요?')
    : '매일의 일일 리포트와 긴급 알림을 받아보세요.'

  const title = isGranted ? '알림 켜짐' : '알림 받기'

  const buttonLabel = isGranted
    ? (testStatus === 'sent' ? '✓ 전송됨' : (pending ? '전송 중…' : '테스트 알림'))
    : (pending ? '설정 중…' : '알림 켜기')

  return (
    <div style={{
      padding: '10px 14px',
      borderBottom: '0.5px solid var(--brand-line)',
      background: 'var(--brand-soft)',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
    }}>
      <BellSmallIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-strong)' }}>
          {title}
        </div>
        <div style={{
          fontSize: 12,
          color: error ? 'var(--danger-tx)' : 'var(--tx-2)',
          marginTop: 1, lineHeight: 1.4,
        }}>
          {error ?? subtitle}
        </div>
      </div>
      <button
        onClick={isGranted ? handleTest : handleEnable}
        disabled={pending || testStatus === 'sent'}
        style={{
          padding: '7px 12px',
          background: (pending || testStatus === 'sent') ? 'var(--brand-tint)' : 'var(--brand)',
          border: 'none',
          borderRadius: 8,
          fontSize: 12.5, fontWeight: 700,
          color: '#fff',
          cursor: (pending || testStatus === 'sent') ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--ff)',
          flexShrink: 0,
          boxShadow: (pending || testStatus === 'sent') ? 'none' : 'var(--shadow-xs)',
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}

function BellSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4.5 12.5V8a4.5 4.5 0 019 0v4.5l1.5 1.5h-12l1.5-1.5z"
        stroke="var(--brand)" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7 15a2 2 0 004 0"
        stroke="var(--brand)" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function LogoSproutIcon({ size = 22 }) {
  return (
    <img
      src={sproutIcon}
      alt=""
      width={size}
      height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  )
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.5 8L13.5 3 11 8 13.5 13 2.5 8z"
        fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round"/>
    </svg>
  )
}

export default AIChat
