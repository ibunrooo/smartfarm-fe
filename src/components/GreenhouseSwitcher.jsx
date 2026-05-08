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
          background: '#fff',
          border: '0.5px solid #e8e8e8',
          borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          color: '#1a1a1a', cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: active.plant?.theme?.main ?? '#2ea84e',
        }} />
        {active.name}
        <span style={{ fontSize: 9, color: '#aaa', marginLeft: 2 }}>▼</span>
      </button>
      <button
        onClick={onAdd}
        title="온실 추가"
        style={{
          width: 30, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f8fdf9',
          border: '0.5px solid #ddf2e2',
          borderRadius: 9,
          color: '#2ea84e', fontSize: 16, fontWeight: 500,
          cursor: 'pointer',
          fontFamily: 'var(--ff)',
        }}
      >
        +
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 38, left: 0, zIndex: 10,
          minWidth: 160,
          background: '#fff',
          border: '0.5px solid #e8e8e8',
          borderRadius: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,.06)',
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
                  background: isActive ? '#f2faf3' : 'none',
                  border: 'none', borderRadius: 7,
                  fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#1e8a3c' : '#555',
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--ff)',
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: g.plant?.theme?.main ?? (isActive ? '#2ea84e' : '#ccc'),
                }} />
                {g.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default GreenhouseSwitcher
