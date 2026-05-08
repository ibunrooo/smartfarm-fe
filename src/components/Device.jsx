export function DeviceIcon({ name, size = 12 }) {
  const stroke = 'currentColor'
  const sw = size > 14 ? 1.4 : 1.1

  if (name === 'pump') return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5C6 1.5 3 5 3 7.5a3 3 0 006 0C9 5 6 1.5 6 1.5z"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none"/>
    </svg>
  )
  if (name === 'window') return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <rect x="2" y="2" width="8" height="8" rx="1"
        stroke={stroke} strokeWidth={sw} fill="none"/>
      <line x1="6" y1="2" x2="6" y2="10" stroke={stroke} strokeWidth={sw}/>
      <line x1="2" y1="6" x2="10" y2="6" stroke={stroke} strokeWidth={sw}/>
    </svg>
  )
  if (name === 'led') return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5a3.5 3.5 0 00-2 6.4V9.5h4V7.9A3.5 3.5 0 006 1.5zM4.5 10.5h3"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" fill="none"/>
    </svg>
  )
  return null
}
