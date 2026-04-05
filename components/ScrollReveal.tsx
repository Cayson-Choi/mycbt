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

      const duration = 3000
      const steps = 60
      let step = 0

      setCount(0)

      const timer = setInterval(() => {
        if (cancelled) { clearInterval(timer); return }
        step++
        // 강한 ease-out: 처음 빠르게, 끝으로 갈수록 점점 더 느려짐
        const progress = 1 - Math.pow(1 - step / steps, 5)
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

// 타이핑 애니메이션: 한 글자씩 제자리에서 나타남 → 3번 깜빡임 → 다시 반복
export function TypeWriter({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [charCount, setCharCount] = useState(0)
  const [visible, setVisible] = useState(true)
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

      setVisible(true)

      // 타이핑: 한 글자씩 나타남
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return
        setCharCount(i)
        await new Promise(r => setTimeout(r, 80))
      }

      // 3번 깜빡임 (전체 텍스트가 보였다 안 보였다)
      for (let blink = 0; blink < 3; blink++) {
        if (cancelled) return
        setVisible(false)
        await new Promise(r => setTimeout(r, 300))
        if (cancelled) return
        setVisible(true)
        await new Promise(r => setTimeout(r, 300))
      }

      // 2초 유지
      await new Promise(r => setTimeout(r, 2000))

      // 사라짐
      setVisible(false)
      await new Promise(r => setTimeout(r, 400))

      // 리셋 후 반복
      setCharCount(0)
      await new Promise(r => setTimeout(r, 300))
      if (!cancelled) runCycle()
    }

    runCycle()
    return () => { cancelled = true }
  }, [started, text])

  return (
    <span ref={ref} className={`${className} relative inline-block`}>
      {/* 투명 텍스트로 공간 확보 */}
      <span className="invisible">{text}</span>
      {/* 실제 보이는 텍스트: 제자리에서 글자가 나타남 */}
      <span className={`absolute inset-0 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {text.split('').map((char, i) => (
          <span key={i} className={i < charCount ? 'opacity-100' : 'opacity-0'}>{char}</span>
        ))}
      </span>
    </span>
  )
}
