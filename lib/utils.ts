// Base64 data URL → Blob 변환
export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  return new Blob([array], { type: mime })
}

// PDF에서 추출한 텍스트의 불필요한 줄바꿈을 정리
// 단독 \n → 공백, \n\n (빈 줄) → 유지
export function normalizeLineBreaks(text: string): string {
  if (!text) return text
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{2,}/g, '___PARA___')   // 빈 줄(문단 구분)은 보존
    .replace(/\n/g, ' ')                 // 단독 줄바꿈 → 공백
    .replace(/___PARA___/g, '\n\n')      // 문단 구분 복원
    .replace(/ {2,}/g, ' ')              // 연속 공백 정리
}
