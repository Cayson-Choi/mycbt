'use client'

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  Suspense,
  type ReactNode,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

type ProgressContextType = {
  start: () => void
  done: () => void
  run: <T>(task: Promise<T>) => Promise<T>
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext)
  if (!ctx) {
    return {
      start: () => {},
      done: () => {},
      run: async (task) => task,
    }
  }
  return ctx
}

const TRICKLE_INTERVAL = 200
const INITIAL_PROGRESS = 12
const TRICKLE_CEILING = 90
const COMPLETE_HOLD = 180
const FADE_MS = 320

export default function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const safetyRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)
  const pendingCountRef = useRef(0)

  const clearTimers = useCallback(() => {
    if (trickleRef.current) {
      clearInterval(trickleRef.current)
      trickleRef.current = null
    }
    if (hideRef.current) {
      clearTimeout(hideRef.current)
      hideRef.current = null
    }
    if (resetRef.current) {
      clearTimeout(resetRef.current)
      resetRef.current = null
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current)
      safetyRef.current = null
    }
  }, [])

  const doneRef = useRef<() => void>(() => {})

  const start = useCallback(() => {
    if (activeRef.current) return
    clearTimers()
    activeRef.current = true
    setVisible(true)
    setProgress(0)
    requestAnimationFrame(() => {
      setProgress(INITIAL_PROGRESS)
      trickleRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= TRICKLE_CEILING) return p
          const remaining = TRICKLE_CEILING - p
          const inc = Math.max(0.4, remaining * 0.08)
          return Math.min(TRICKLE_CEILING, p + inc)
        })
      }, TRICKLE_INTERVAL)
    })
    // 안전장치: 8초 안에 route change/manual done()이 없으면 강제 종료
    safetyRef.current = setTimeout(() => {
      if (activeRef.current) doneRef.current()
    }, 8000)
  }, [clearTimers])

  const done = useCallback(() => {
    if (!activeRef.current) return
    activeRef.current = false
    clearTimers()
    setProgress(100)
    hideRef.current = setTimeout(() => {
      setVisible(false)
      resetRef.current = setTimeout(() => {
        setProgress(0)
      }, FADE_MS)
    }, COMPLETE_HOLD)
  }, [clearTimers])

  useEffect(() => {
    doneRef.current = done
  }, [done])

  const run = useCallback(
    async <T,>(task: Promise<T>): Promise<T> => {
      pendingCountRef.current += 1
      start()
      try {
        return await task
      } finally {
        pendingCountRef.current = Math.max(0, pendingCountRef.current - 1)
        if (pendingCountRef.current === 0) done()
      }
    },
    [start, done]
  )

  useEffect(() => () => clearTimers(), [clearTimers])

  // 앵커 클릭 전역 감지: next/link 포함 모든 내부 링크
  // bubble phase로 실행해서 React의 preventDefault/stopPropagation이 먼저 처리되도록 함
  // (Link 안쪽 버튼이 stopPropagation 하면 여기로 이벤트가 오지 않아 바가 시작되지 않음)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return

      const target = e.target as HTMLElement | null
      if (!target) return

      // 버튼 클릭은 무시 (Link 내부 버튼이 stopPropagation 못 해도 바가 안 시작되도록)
      // — 버튼은 자체 액션(모달 오픈 등)이 기본이고, 네비게이션 의도면 Link를 써야 함
      const button = target.closest('button')
      const anchor = target.closest('a')
      if (button) {
        // 버튼이 anchor보다 더 가까운 조상이면 버튼 클릭으로 간주 → 바 시작 안 함
        if (!anchor || button.contains(anchor) === false) return
      }
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return
      if (anchor.target && anchor.target !== '' && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return
      if (anchor.dataset.noProgress === 'true') return
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return

      try {
        const url = new URL(href, window.location.href)
        if (url.origin !== window.location.origin) return
        if (url.pathname === window.location.pathname && url.search === window.location.search) return
      } catch {
        return
      }

      start()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [start])

  // 뒤로/앞으로 버튼
  useEffect(() => {
    const onPopState = () => start()
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [start])

  // 페이지 숨김 시 강제 완료 (새 탭 전환 등)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden' && activeRef.current) done()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [done])

  const value = useMemo(() => ({ start, done, run }), [start, done, run])

  return (
    <ProgressContext.Provider value={value}>
      <Suspense fallback={null}>
        <RouteChangeWatcher onComplete={done} />
      </Suspense>
      <ProgressBarView progress={progress} visible={visible} />
      {children}
    </ProgressContext.Provider>
  )
}

function RouteChangeWatcher({ onComplete }: { onComplete: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRun = useRef(true)

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    onComplete()
  }, [pathname, searchParams, onComplete])

  return null
}

function ProgressBarView({ progress, visible }: { progress: number; visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2px]"
      style={{
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background: '#ff0000',
          transition:
            progress === 0 ? 'none' : 'width 200ms cubic-bezier(0.1, 0.5, 0.3, 1)',
          willChange: 'width, opacity',
        }}
      />
    </div>
  )
}
