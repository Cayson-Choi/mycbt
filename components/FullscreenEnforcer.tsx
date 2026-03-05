'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface FullscreenEnforcerProps {
  attemptId: string
  enabled: boolean
  children: React.ReactNode
}

export default function FullscreenEnforcer({
  attemptId,
  enabled,
  children,
}: FullscreenEnforcerProps) {
  const [showWarning, setShowWarning] = useState(false)
  const isReenteringRef = useRef(false)

  const reportViolation = useCallback(async () => {
    try {
      await fetch(`/api/attempts/${attemptId}/violation`, {
        method: 'POST',
      })
    } catch (err) {
      console.error('위반 기록 실패:', err)
    }
  }, [attemptId])

  const enterFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled) return
    if (document.fullscreenElement) return
    isReenteringRef.current = true
    document.documentElement.requestFullscreen().catch(() => {}).finally(() => {
      setTimeout(() => {
        isReenteringRef.current = false
      }, 500)
    })
  }, [])

  useEffect(() => {
    if (!enabled) return

    // 전체화면 API 지원 시에만 진입
    if (document.fullscreenEnabled) {
      enterFullscreen()
    }

    // fullscreenchange: 전체화면 탈출 감지 (API 지원 브라우저만)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !isReenteringRef.current) {
        setShowWarning(true)
        reportViolation()
      }
    }

    if (document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', handleFullscreenChange)
    }

    return () => {
      if (document.fullscreenEnabled) {
        document.removeEventListener('fullscreenchange', handleFullscreenChange)
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
      }
    }
  }, [enabled, enterFullscreen, reportViolation])

  const handleWarningClose = () => {
    setShowWarning(false)
    if (enabled) {
      enterFullscreen()
    }
  }

  return (
    <>
      {children}
      <ConfirmDialog
        open={showWarning}
        title="경고: 시험 이탈 감지"
        message="전체화면을 벗어났습니다. 이탈 기록이 저장됩니다."
        confirmText="확인"
        cancelText="확인"
        confirmColor="red"
        onConfirm={handleWarningClose}
        onCancel={handleWarningClose}
      />
    </>
  )
}
