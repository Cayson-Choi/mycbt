'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * YouTube/NProgress 스타일 상단 진행 바.
 *
 * 동작:
 * 1. 작업 시작 시 (시각적 피드백 필요)
 *    - 10%로 점프 + opacity 1
 *    - 이후 300ms 간격으로 서서히 증가 (90% 상한, 점점 느리게)
 * 2. 작업 완료 시
 *    - 100%로 스냅 (150ms 내 도달)
 *    - 150ms 대기 후 opacity를 0으로 페이드 (250ms)
 *    - 페이드 완료 후 width=0으로 리셋
 * 3. 새 작업이 페이드 중 발생하면
 *    - 현재 위치에서 다시 트리클 재개 (10%로 리셋 안 함)
 *
 * 추적 대상:
 * - Link 클릭으로 인한 페이지 이동 (pathname 변경까지)
 * - window.fetch로 보낸 네트워크 요청 (prefetch/세션 폴링 제외)
 *
 * 제외:
 * - 랜딩 페이지(/) 이동
 * - hover prefetch, NextAuth 세션 폴링, _next/* 내부 요청
 */
export default function TopProgressBar() {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0) // 0 = 숨김
  const [opacity, setOpacity] = useState(0)

  const fetchCountRef = useRef(0)
  const navPendingRef = useRef(false)
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completionTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const progressRef = useRef(0)

  // ─── 헬퍼 ───
  const updateProgress = (val: number | ((p: number) => number)) => {
    setProgress((prev) => {
      const next = typeof val === 'function' ? val(prev) : val
      progressRef.current = next
      return next
    })
  }

  const clearCompletionTimers = () => {
    completionTimersRef.current.forEach(clearTimeout)
    completionTimersRef.current = []
  }

  const startTrickle = () => {
    if (trickleRef.current) return
    trickleRef.current = setInterval(() => {
      updateProgress((p) => {
        if (p >= 90) return p
        // ease-out: 시작은 빠르게, 90%에 가까울수록 느리게
        const increment = Math.max(0.5, (90 - p) * 0.15)
        return Math.min(90, p + increment)
      })
    }, 300)
  }

  const stopTrickle = () => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current)
      trickleRef.current = null
    }
  }

  const checkActive = () => {
    const active = fetchCountRef.current > 0 || navPendingRef.current

    if (active) {
      // 완료 애니메이션이 진행 중이었다면 취소하고 현재 위치에서 재개
      clearCompletionTimers()
      if (progressRef.current === 0) {
        // 새 시작
        setOpacity(1)
        updateProgress(10)
      } else if (progressRef.current >= 100) {
        // 완료 직후 새 작업 시작 → 10%로 리셋하고 재시작
        setOpacity(1)
        updateProgress(10)
      } else {
        // 진행 중에 추가 작업 시작 → opacity만 보장
        setOpacity(1)
      }
      startTrickle()
    } else {
      // 모든 작업 종료 → 100%로 스냅 후 페이드
      stopTrickle()
      updateProgress(100)
      clearCompletionTimers()
      // 150ms (width transition 완료) → opacity 0으로 페이드
      const t1 = setTimeout(() => {
        setOpacity(0)
        // 250ms 페이드 완료 후 width=0으로 리셋
        const t2 = setTimeout(() => {
          updateProgress(0)
        }, 250)
        completionTimersRef.current.push(t2)
      }, 150)
      completionTimersRef.current.push(t1)
    }
  }

  const startNav = () => {
    if (navPendingRef.current) return
    navPendingRef.current = true
    checkActive()
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
    navTimeoutRef.current = setTimeout(() => {
      navPendingRef.current = false
      checkActive()
    }, 10000)
  }

  const endNav = () => {
    if (!navPendingRef.current) return
    navPendingRef.current = false
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = null
    }
    checkActive()
  }

  // ─── 1) fetch 가로채기 ───
  useEffect(() => {
    if (typeof window === 'undefined') return
    const originalFetch = window.fetch

    const isBackgroundRequest = (input: RequestInfo | URL, init?: RequestInit): boolean => {
      try {
        let headers: Headers | null = null
        if (input instanceof Request) {
          headers = input.headers
        } else if (init?.headers) {
          headers = new Headers(init.headers as HeadersInit)
        }

        // prefetch 요청
        if (headers) {
          if (headers.get('next-router-prefetch') === '1') return true
          if (headers.get('purpose') === 'prefetch') return true
          if (headers.get('sec-purpose')?.startsWith('prefetch')) return true
        }

        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
        if (url) {
          if (/\/api\/auth\/session(\?|$)/.test(url)) return true
          if (/\/_next\//.test(url)) return true

          // 랜딩 페이지 RSC 네비게이션
          try {
            const parsed = new URL(url, window.location.origin)
            if (parsed.pathname === '/') {
              const isRSC =
                headers?.get('rsc') === '1' ||
                headers?.get('RSC') === '1' ||
                parsed.searchParams.has('_rsc')
              if (isRSC) return true
            }
          } catch {
            /* ignore */
          }
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
      checkActive()
      try {
        return await originalFetch(...args)
      } finally {
        fetchCountRef.current = Math.max(0, fetchCountRef.current - 1)
        checkActive()
      }
    }

    return () => {
      window.fetch = originalFetch
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── 2) Link 클릭 감지 ───
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
        // 랜딩 페이지 제외
        if (url.pathname === '/') return
      } catch {
        return
      }

      startNav()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ─── 3) pathname 변경 → 네비게이션 완료 ───
  useEffect(() => {
    endNav()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ─── 4) 30s 안전장치 ───
  useEffect(() => {
    if (progress === 0) return
    const timer = setTimeout(() => {
      fetchCountRef.current = 0
      navPendingRef.current = false
      checkActive()
    }, 30000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress])

  // ─── 5) 언마운트 정리 ───
  useEffect(() => {
    return () => {
      stopTrickle()
      clearCompletionTimers()
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
    }
  }, [])

  if (progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] pointer-events-none"
      style={{
        width: `${progress}%`,
        opacity,
        transition: 'width 150ms ease-out, opacity 250ms ease-out',
      }}
    />
  )
}
