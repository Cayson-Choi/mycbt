'use client'

import { useEffect, useRef, useState } from 'react'

interface ScrollRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ScrollReveal({ children, className = '', delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

// 0→target 카운트업 후 잠시 유지 → 다시 0부터 반복
export function CountUp({ target, suffix = '', className = '' }: { target: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    let cancelled = false

    const runCycle = () => {
      if (cancelled) return

      const duration = 1500
      const steps = 40
      let step = 0

      setCount(0)

      const timer = setInterval(() => {
        if (cancelled) { clearInterval(timer); return }
        step++
        const progress = 1 - Math.pow(1 - step / steps, 3)
        setCount(Math.round(target * progress))
        if (step >= steps) {
          setCount(target)
          clearInterval(timer)
          // 3초 유지 후 다시 시작
          setTimeout(() => { if (!cancelled) runCycle() }, 3000)
        }
      }, duration / steps)
    }

    runCycle()
    return () => { cancelled = true }
  }, [started, target])

  return <span ref={ref} className={className}>{count}{suffix}</span>
}

// 타이핑 애니메이션: 한 글자씩 → 3번 깜빡임 → 다시 반복
export function TypeWriter({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    let cancelled = false

    const runCycle = async () => {
      if (cancelled) return

      // 타이핑
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return
        setDisplayText(text.slice(0, i))
        await new Promise(r => setTimeout(r, 80))
      }

      // 3번 깜빡임 (전체 텍스트 유지한 채로)
      for (let blink = 0; blink < 3; blink++) {
        if (cancelled) return
        setShowCursor(false)
        await new Promise(r => setTimeout(r, 300))
        if (cancelled) return
        setShowCursor(true)
        await new Promise(r => setTimeout(r, 300))
      }

      // 2초 유지
      await new Promise(r => setTimeout(r, 2000))

      // 텍스트 지우기
      for (let i = text.length; i >= 0; i--) {
        if (cancelled) return
        setDisplayText(text.slice(0, i))
        await new Promise(r => setTimeout(r, 30))
      }

      // 잠시 대기 후 반복
      await new Promise(r => setTimeout(r, 500))
      if (!cancelled) runCycle()
    }

    runCycle()
    return () => { cancelled = true }
  }, [started, text])

  return (
    <span ref={ref} className={className}>
      {displayText}
      <span className={`inline-block w-[3px] h-[1em] bg-current ml-0.5 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`} />
    </span>
  )
}
