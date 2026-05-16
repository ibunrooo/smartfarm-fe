// 리포트 summary에 들어있는 "온실 gh-XXX" / "gh-XXX" 패턴을 식물명으로 치환
export function substituteGreenhouseId(text, greenhouseId, plantName) {
  if (!text || !greenhouseId || !plantName) return text
  const escaped = greenhouseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text
    .replace(new RegExp(`온실\\s+${escaped}`, 'g'), plantName)
    .replace(new RegExp(escaped, 'g'), plantName)
}
