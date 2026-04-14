'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * 전역 진행 바 — 페이지 이동 + 모든 fetch 작업 중 상단에 표시.
 * - Link 클릭 → 진행 바 시작 → pathname 변경 시 종료
 * - fetch() 호출 → 진행 바 시작 → 응답 도착 시 종료
 * - 두 작업이 겹치면 모두 완료될 때까지 표시 유지
 */
export default function TopProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  // 작업 카운터 (fetch + 네비게이션)
  const fetchCountRef = useRef(0)
  const navPendingRef = useRef(false)
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recompute = () => {
    const active = fetchCountRef.current > 0 || navPendingRef.current
    setVisible((prev) => {
      if (active && !prev) setProgress(10)
      return active
    })
    if (!active) {
      setProgress(100)
      setTimeout(() => setProgress(0), 250)
    }
  }

  const startNav = () => {
    if (navPendingRef.current) return
    navPendingRef.current = true
    recompute()
    // 안전 장치: 네비게이션이 10초 내 완료 안 되면 강제 종료
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
    navTimeoutRef.current = setTimeout(() => {
      navPendingRef.current = false
      recompute()
    }, 10000)
  }

  const endNav = () => {
    if (!navPendingRef.current) return
    navPendingRef.current = false
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = null
    }
    recompute()
  }

  // 1) fetch 가로채기 — 단, Next.js prefetch 등 백그라운드 요청은 제외
  useEffect(() => {
    if (typeof window === 'undefined') return
    const originalFetch = window.fetch

    const isBackgroundRequest = (input: RequestInfo | URL, init?: RequestInit): boolean => {
      try {
        // Request 객체 또는 RequestInit의 headers 확인
        let headers: Headers | null = null
        if (input instanceof Request) {
          headers = input.headers
        } else if (init?.headers) {
          headers = new Headers(init.headers as HeadersInit)
        }

        // Next.js prefetch 요청 (hover/viewport 진입 시 자동 발생) → 제외
        if (headers) {
          if (headers.get('next-router-prefetch') === '1') return true
          if (headers.get('purpose') === 'prefetch') return true
          if (headers.get('sec-purpose')?.startsWith('prefetch')) return true
        }

        // URL 기반 추가 필터: session 자동 폴링 등
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        if (url) {
          // NextAuth 세션 자동 폴링 제외 (사용자 액션이 아님)
          if (/\/api\/auth\/session(\?|$)/.test(url)) return true
          // _next/* 내부 요청 제외
          if (/\/_next\//.test(url)) return true
        }
      } catch {
        /* ignore */
      }
      return false
    }

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const [input, init] = args
      if (isBackgroundRequest(input, init)) {
        return originalFetch(...args)
      }

      fetchCountRef.current++
      recompute()
      try {
        return await originalFetch(...args)
      } finally {
        fetchCountRef.current = Math.max(0, fetchCountRef.current - 1)
        recompute()
      }
    }

    return () => {
      window.fetch = originalFetch
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) Link 클릭 감지 → 네비게이션 시작
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return
      const target = e.target as HTMLElement | null
      if (!target) return
      if (target.closest('button')) return

      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return
      if (anchor.target === '_blank') return
      if (e.ctrlKey || e.metaKey || e.shiftKey) return

      try {
        const url = new URL(href, window.location.origin)
        if (url.origin !== window.location.origin) return
        if (url.pathname === pathname) return
      } catch {
        return
      }

      startNav()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // 3) pathname 변경 → 네비게이션 완료
  useEffect(() => {
    endNav()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // 4) 진행 바 점진적 증가 (90%까지)
  useEffect(() => {
    if (!visible) return
    if (progress >= 90) return
    const timer = setTimeout(() => {
      setProgress((p) => Math.min(90, p + (90 - p) * 0.15))
    }, 300)
    return () => clearTimeout(timer)
  }, [visible, progress])

  // 5) 안전 장치: 30초 넘게 유지되면 강제 종료
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      fetchCountRef.current = 0
      navPendingRef.current = false
      setVisible(false)
      setProgress(0)
    }, 30000)
    return () => clearTimeout(timer)
  }, [visible])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.7)] transition-[width,opacity] duration-200 ease-out pointer-events-none"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
      }}
    />
  )
}
