'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 페이지 네비게이션 중 상단에 얇은 진행 바 표시.
 * - Link 클릭 등으로 <a> 클릭 이벤트 발생 시 시작
 * - pathname이 변경되면 완료
 * - 500ms 내 완료 시 표시 안 함 (깜빡임 방지)
 */
export default function TopProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  // Link 클릭 감지 → 진행 바 시작
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (anchor.target === '_blank') return
      if (e.ctrlKey || e.metaKey || e.shiftKey) return

      // 같은 경로면 무시
      try {
        const url = new URL(href, window.location.origin)
        if (url.origin !== window.location.origin) return
        if (url.pathname === pathname) return
      } catch {
        return
      }

      setVisible(true)
      setProgress(0)
      // 즉시 30%로 점프, 이후 천천히 90%까지 증가
      requestAnimationFrame(() => setProgress(30))
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [pathname])

  // 진행 중 점진 증가
  useEffect(() => {
    if (!visible) return
    if (progress >= 90) return
    const timer = setTimeout(() => {
      setProgress((p) => Math.min(90, p + (90 - p) * 0.2))
    }, 300)
    return () => clearTimeout(timer)
  }, [visible, progress])

  // pathname 변경 → 완료
  useEffect(() => {
    if (!visible) return
    setProgress(100)
    const timer = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 250)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)] transition-[width,opacity] duration-200 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress >= 100 ? 0 : 1,
      }}
    />
  )
}
