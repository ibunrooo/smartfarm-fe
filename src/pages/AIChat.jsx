import { useEffect, useRef, useState } from 'react'
import DailyReportCard from '../components/DailyReportCard'
import DailyReportDetail from '../components/DailyReportDetail'
import { dailyReports } from '../data/dailyReports'

const initialMessages = [
  { id: 1, sender: 'ai',   type: 'text',   text: '안녕하세요! 팜-므파탈 도우미예요.',                                                                  time: '08:30', date: '2026-05-08' },
  { id: 2, sender: 'ai',   type: 'text',   text: '오늘의 일일 리포트를 보내드릴게요.',                                                                 time: '08:30', date: '2026-05-08' },
  { id: 3, sender: 'ai',   type: 'report', report: dailyReports[0],                                                                                    time: '08:30', date: '2026-05-08' },
  { id: 4, sender: 'user', type: 'text',   text: '잎 끝이 좀 마른 것 같던데 괜찮을까요?',                                                              time: '08:32', date: '2026-05-08' },
  { id: 5, sender: 'ai',   type: 'text',   text: '습도가 55%로 평소보다 다소 높아요. 통풍을 늘리면 도움이 될 거예요. 환기팬이 자동으로 켜져 있어요.',  time: '08:32', date: '2026-05-08' },
  { id: 6, sender: 'user', type: 'text',   text: '그럼 일단 지켜볼게요. 고마워요!',                                                                    time: '08:35', date: '2026-05-08' },
  { id: 7, sender: 'ai',   type: 'text',   text: '네, 변동이 있으면 바로 알려드릴게요.',                                                                time: '08:35', date: '2026-05-08' },
]

function AIChat() {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [activeReport, setActiveReport] = useState(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW 등록 실패:', err)
      })
    }
  }, [])

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const date = now.toISOString().slice(0, 10)
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender: 'user', type: 'text', text: trimmed, time, date },
    ])
    setDraft('')
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
      background: '#fff',
      border: '0.5px solid #e8e8e8',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid #e8e8e8',
        background: '#fff',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#2ea84e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BotPlantIcon />
        </div>
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a1a' }}>
            팜-므파탈 도우미
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ea84e' }} />
            <span style={{ fontSize: 12, color: '#888' }}>온라인</span>
          </div>
        </div>
      </div>

      <NotificationBanner />

      {/* 메시지 영역 */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto',
        background: '#f5f7f5',
        padding: '12px 14px',
      }}>
        {renderWithDateDividers(messages, setActiveReport)}
      </div>

      {/* 입력바 */}
      <div style={{
        padding: '10px 12px',
        background: '#fff',
        borderTop: '0.5px solid #e8e8e8',
        display: 'flex', alignItems: 'flex-end', gap: 8,
        flexShrink: 0,
      }}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="메시지를 입력하세요"
          rows={1}
          style={{
            flex: 1,
            padding: '10px 12px',
            background: '#f5f5f5',
            border: '0.5px solid #e8e8e8',
            borderRadius: 18,
            fontSize: 14,
            fontFamily: 'var(--ff)',
            outline: 'none',
            resize: 'none',
            minHeight: 38,
            maxHeight: 120,
            lineHeight: 1.4,
            color: '#1a1a1a',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!draft.trim()}
          style={{
            width: 38, height: 38,
            borderRadius: '50%',
            background: draft.trim() ? '#2ea84e' : '#cfe7d4',
            border: 'none',
            color: '#fff',
            cursor: draft.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
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
      <div style={{ flex: 1, height: 0.5, background: '#dcdcdc', maxWidth: 80 }} />
      <span style={{ fontSize: 12, color: '#999', fontWeight: 500 }}>{formatted}</span>
      <div style={{ flex: 1, height: 0.5, background: '#dcdcdc', maxWidth: 80 }} />
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
        <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{message.time}</span>
        <div style={{
          maxWidth: '75%',
          padding: '8px 12px',
          background: '#2ea84e',
          color: '#fff',
          borderRadius: '16px 16px 4px 16px',
          fontSize: 14,
          lineHeight: 1.45,
          wordBreak: 'break-word',
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
          background: '#2ea84e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BotPlantIcon size={16} />
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
        <div style={{
          maxWidth: '75%',
          padding: '8px 12px',
          background: '#fff',
          border: '0.5px solid #e8e8e8',
          color: '#1a1a1a',
          borderRadius: '16px 16px 16px 4px',
          fontSize: 14,
          lineHeight: 1.45,
          wordBreak: 'break-word',
        }}>
          {message.text}
        </div>
      )}
      <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0 }}>{message.time}</span>
    </div>
  )
}

function NotificationBanner() {
  const supported = typeof Notification !== 'undefined'
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported')

  if (!supported || permission !== 'default') return null

  const handleEnable = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      if (result === 'granted') {
        new Notification('팜-므파탈', {
          body: '알림이 켜졌어요. 일일 리포트와 긴급 알림을 보내드릴게요.',
          icon: '/favicon.svg',
        })
      }
    } catch (err) {
      console.warn('알림 권한 요청 실패:', err)
    }
  }

  return (
    <div style={{
      padding: '10px 14px',
      borderBottom: '0.5px solid #ddf2e2',
      background: '#f8fdf9',
      display: 'flex', alignItems: 'center', gap: 10,
      flexShrink: 0,
    }}>
      <BellSmallIcon />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e8a3c' }}>
          알림 받기
        </div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 1, lineHeight: 1.4 }}>
          매일의 일일 리포트와 긴급 알림을 받아보세요.
        </div>
      </div>
      <button
        onClick={handleEnable}
        style={{
          padding: '7px 12px',
          background: '#2ea84e',
          border: 'none',
          borderRadius: 8,
          fontSize: 12.5, fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
          flexShrink: 0,
        }}
      >
        알림 켜기
      </button>
    </div>
  )
}

function BellSmallIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4.5 12.5V8a4.5 4.5 0 019 0v4.5l1.5 1.5h-12l1.5-1.5z"
        stroke="#2ea84e" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
      <path d="M7 15a2 2 0 004 0"
        stroke="#2ea84e" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-')
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일`
}

function BotPlantIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <path d="M13 6C10 6 7.5 8.5 7.5 11.5c0 2 .9 3.7 2.3 4.8L9 21h8l-.8-4.7c1.4-1.1 2.3-2.8 2.3-4.8C18.5 8.5 16 6 13 6z"
        fill="#fff" opacity=".95"/>
      <line x1="13" y1="9" x2="13" y2="19" stroke="#2ea84e" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 12c0 0 1.3-1.5 3-1.5s3 1.5 3 1.5"
        stroke="#2ea84e" strokeWidth="1.1" strokeLinecap="round" fill="none"/>
    </svg>
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
