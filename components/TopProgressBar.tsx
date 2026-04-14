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
      // 내부 버튼이 preventDefault/stopPropagation을 한 경우 네비게이션이 취소되므로 무시
      if (e.defaultPrevented) return

      const target = e.target as HTMLElement | null
      if (!target) return

      // 클릭 대상이 버튼이거나 버튼 내부면 네비게이션 아님
      if (target.closest('button')) return

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

    // bubble phase 사용 — 버튼 핸들러가 stopPropagation 시 이 리스너는 발동하지 않음
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
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

  // 안전 장치: 네비게이션이 취소되거나 이상하게 멈춘 경우 5초 후 자동 숨김
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 5000)
    return () => clearTimeout(timer)
  }, [visible])

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
