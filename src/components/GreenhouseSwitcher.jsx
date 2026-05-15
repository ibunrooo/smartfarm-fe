import { useState } from 'react'

function GreenhouseSwitcher({ greenhouses, activeId, onChange, onAdd }) {
  const [open, setOpen] = useState(false)
  const active = greenhouses.find(g => g.id === activeId)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 12px',
          background: 'var(--surface)',
          border: '0.5px solid var(--bd)',
          borderRadius: 10,
          fontSize: 14, fontWeight: 600,
          color: 'var(--tx-1)', cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: active.plant?.theme?.main ?? 'var(--brand)',
        }} />
        {active.plant?.name ?? active.name}
        <span style={{ fontSize: 11, color: 'var(--tx-4)', marginLeft: 2 }}>▼</span>
      </button>
      {onAdd && (
        <button
          onClick={onAdd}
          title="온실 추가"
          style={{
            width: 30, height: 30,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--brand-soft)',
            border: '0.5px solid var(--brand-line)',
            borderRadius: 9,
            color: 'var(--brand)', fontSize: 16, fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--ff)',
          }}
        >
          +
        </button>
      )}

      {open && (
        <div style={{
          position: 'absolute', top: 38, left: 0, zIndex: 10,
          minWidth: 160,
          background: 'var(--surface)',
          border: '0.5px solid var(--bd)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-md)',
          padding: 4,
          display: 'flex', flexDirection: 'column',
        }}>
          {greenhouses.map(g => {
            const isActive = g.id === activeId
            return (
              <button
                key={g.id}
                onClick={() => { onChange(g.id); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 10px',
                  background: isActive ? 'var(--brand-soft)' : 'none',
                  border: 'none', borderRadius: 7,
                  fontSize: 14, fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--brand-strong)' : 'var(--tx-2)',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--ff)',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: g.plant?.theme?.main ?? (isActive ? 'var(--brand)' : 'var(--tx-4)'),
                }} />
                {g.plant?.name ?? g.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GreenhouseSwitcher
