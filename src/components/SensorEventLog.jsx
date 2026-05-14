import { useMemo, useState } from 'react'
import { LOG_CATEGORIES, categoryLabels, categoryDotColor } from '../data/eventLogs'

const PAGE_SIZE = 10

function SensorEventLog({ logs }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => (
    filter === 'all' ? logs : logs.filter(l => l.category === filter)
  ), [logs, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const onFilterChange = (next) => {
    setFilter(next)
    setPage(0)
  }

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e8e8e8',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* 헤더 + 필터 */}
      <div style={{
        padding: '11px 14px',
        borderBottom: '0.5px solid #e8e8e8',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
            이벤트 로그
          </div>
          <div style={{ fontSize: 12, color: '#aaa' }}>
            총 {filtered.length}건
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <FilterChip active={filter === 'all'} onClick={() => onFilterChange('all')}>
            전체
          </FilterChip>
          {LOG_CATEGORIES.map(cat => (
            <FilterChip
              key={cat}
              active={filter === cat}
              dotColor={categoryDotColor[cat]}
              onClick={() => onFilterChange(cat)}
            >
              {categoryLabels[cat]}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* 리스트 */}
      <div>
        {visible.length === 0 ? (
          <div style={{
            padding: '24px 14px', textAlign: 'center',
            fontSize: 13, color: '#aaa',
          }}>
            {filter === 'all'
              ? '아직 기록된 활동이 없어요.'
              : '해당 카테고리의 로그가 없어요.'}
          </div>
        ) : visible.map((log, i) => (
          <div key={log.id} style={{
            padding: '9px 14px',
            borderBottom: i < visible.length - 1 ? '0.5px solid #f0f0f0' : 'none',
            display: 'flex', alignItems: 'flex-start', gap: 9,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: categoryDotColor[log.category],
              marginTop: 5, flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.4 }}>{log.text}</div>
              <div style={{ display: 'flex', gap: 5, marginTop: 3, alignItems: 'center' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: categoryDotColor[log.category],
                }}>
                  {categoryLabels[log.category]}
                </span>
                <span style={{ fontSize: 11, color: '#ccc' }}>·</span>
                <span style={{ fontSize: 11, color: '#aaa' }}>{log.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {filtered.length > PAGE_SIZE && (
        <div style={{
          padding: '9px 14px',
          borderTop: '0.5px solid #e8e8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <PageButton
            disabled={safePage === 0}
            onClick={() => setPage(p => Math.max(0, p - 1))}
          >
            ← 이전
          </PageButton>
          <span style={{ fontSize: 12.5, color: '#888', fontWeight: 500 }}>
            {safePage + 1} / {totalPages}
          </span>
          <PageButton
            disabled={safePage >= totalPages - 1}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          >
            다음 →
          </PageButton>
        </div>
      )}
    </div>
  )
}

function FilterChip({ active, dotColor, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        background: active ? '#2ea84e' : '#f5f5f5',
        border: 'none',
        borderRadius: 12,
        color: active ? '#fff' : '#666',
        fontSize: 12.5, fontWeight: 600,
        cursor: 'pointer',
        fontFamily: 'var(--ff)',
        transition: 'all .15s',
      }}
    >
      {dotColor && (
        <span style={{
          width: 5, height: 5, borderRadius: '50%',
          background: active ? '#fff' : dotColor,
        }} />
      )}
      {children}
    </button>
  )
}

function PageButton({ disabled, onClick, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 11px',
        background: 'transparent',
        border: '0.5px solid #ddd',
        borderRadius: 7,
        color: disabled ? '#ccc' : '#555',
        fontSize: 12.5, fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'var(--ff)',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

export default SensorEventLog
