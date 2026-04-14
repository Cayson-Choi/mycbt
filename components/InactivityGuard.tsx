'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10분
const WARNING_BEFORE = 60 * 1000 // 1분 전 경고

export default function InactivityGuard() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 시험 풀이 중인지 확인
  const isExamAttempt = pathname?.startsWith('/exam/attempt/')
  const isLoggedIn = !!session

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current)
      warningTimerRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }, [])

  const handleLogout = useCallback(() => {
    clearTimers()
    setShowWarning(false)
    signOut({ callbackUrl: '/login' })
  }, [clearTimers])

  // resetTimer를 ref로 보관 — 이벤트 리스너가 매번 최신 버전을 호출하도록
  const resetTimerRef = useRef<() => void>(() => {})

  resetTimerRef.current = () => {
    if (!isLoggedIn || isExamAttempt) return

    clearTimers()
    setShowWarning(false)

    // 9분 후 경고 표시 + 카운트다운 시작
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(60)
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
              countdownRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, INACTIVITY_TIMEOUT - WARNING_BEFORE)

    // 10분 후 로그아웃
    timerRef.current = setTimeout(() => {
      handleLogout()
    }, INACTIVITY_TIMEOUT)
  }

  // 이벤트 리스너 설정 — 세션/경로 변경 시에만 재설정
  useEffect(() => {
    if (!isLoggedIn || isExamAttempt) {
      clearTimers()
      setShowWarning(false)
      return
    }

    // 안정된 핸들러 — ref로 최신 resetTimer 호출
    const handler = () => {
      resetTimerRef.current()
    }

    const events: (keyof WindowEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }))

    // 초기 타이머 세팅
    resetTimerRef.current()

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler))
      clearTimers()
    }
    // 의도적으로 isLoggedIn, isExamAttempt만 deps — 이 값이 바뀔 때만 재설정
    // resetTimerRef.current는 매 렌더마다 최신이라 deps 불필요
  }, [isLoggedIn, isExamAttempt, clearTimers])

  const handleContinue = () => {
    setShowWarning(false)
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    resetTimerRef.current()
  }

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4 text-center border dark:border-gray-700">
        <div className="text-4xl mb-4">⏰</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          자동 로그아웃 예정
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          10분간 활동이 없어 <span className="text-red-600 dark:text-red-400 font-bold">{countdown}초</span> 후 자동 로그아웃됩니다.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            계속 사용하기
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
