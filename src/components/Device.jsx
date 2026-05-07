export function DeviceIcon({ name, size = 12 }) {
  const stroke = 'currentColor'
  const sw = size > 14 ? 1.4 : 1.1

  if (name === 'pump') return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 1.5C6 1.5 3 5 3 7.5a3 3 0 006 0C9 5 6 1.5 6 1.5z"
        stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none"/>
    </svg>
  )
  if (name === 'fan') return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="1" fill={stroke}/>
      <path d="M6 5V2M6 7v3M5 6H2M7 6h3"
        stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
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
