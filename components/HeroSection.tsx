'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface Slide {
  badge: string
  badgeColor: string
  title: string
  description: string
  bgColor: string
  accentColor: string
  icon: string
  personImage: string
  personAlt: string
}

const slides: Slide[] = [
  {
    badge: '인기',
    badgeColor: 'bg-red-500',
    title: '전기기사 필기 CBT',
    description: '2018~2025년 기출문제 2,100문제\n전문가가 직접 검증한 정확한 문제와 해설',
    bgColor: 'from-[#0f1729] to-[#1a2744]',
    accentColor: '#4f8cff',
    icon: '⚡',
    personImage: '/hero/man.png',
    personAlt: '전기기사 강사',
  },
  {
    badge: '준비중',
    badgeColor: 'bg-emerald-500',
    title: '전기기능사 필기 CBT',
    description: '전기이론·전기기기·전기설비\n3과목 60분 실전 모의고사',
    bgColor: 'from-[#071a12] to-[#0f2e1f]',
    accentColor: '#34d399',
    icon: '🔌',
    personImage: '/hero/woman.png',
    personAlt: '전기기능사 강사',
  },
  {
    badge: 'AI 채점',
    badgeColor: 'bg-violet-500',
    title: 'AI 자동 채점 시스템',
    description: '주관식·서술형 문제도 AI가 자동 채점\n즉각적인 피드백으로 실력 향상',
    bgColor: 'from-[#150d24] to-[#251840]',
    accentColor: '#a78bfa',
    icon: '🤖',
    personImage: '/hero/man.png',
    personAlt: 'AI 채점 시스템',
  },
  {
    badge: '실시간',
    badgeColor: 'bg-amber-500',
    title: '실시간 랭킹 시스템',
    description: '오늘의 Top5 랭킹 실시간 업데이트\n다른 수험생과 실력을 비교해 보세요',
    bgColor: 'from-[#1a1200] to-[#302000]',
    accentColor: '#fbbf24',
    icon: '🏆',
    personImage: '/hero/woman.png',
    personAlt: '랭킹 시스템',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [animPhase, setAnimPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)

  const INTERVAL = 5000

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const goTo = useCallback((index: number) => {
    clearTimer()
    // exit → 바뀐 뒤 enter
    setAnimPhase('exit')
    setTimeout(() => {
      setCurrent(index)
      setAnimPhase('enter')
    }, 400)
  }, [])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  // 자동 회전
  useEffect(() => {
    timerRef.current = setTimeout(next, INTERVAL)
    return clearTimer
  }, [current, next])

  // enter 후 idle로 전환
  useEffect(() => {
    if (animPhase === 'enter') {
      const t = setTimeout(() => setAnimPhase('idle'), 800)
      return () => clearTimeout(t)
    }
  }, [animPhase])

  // 터치 스와이프
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev()
    }
  }

  const slide = slides[current]
  const isVisible = animPhase === 'enter' || animPhase === 'idle'

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${slide.bgColor} transition-colors duration-700`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ===== 배경 장식 ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* 메인 글로우 */}
        <div
          className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${slide.accentColor}18, transparent 70%)`,
          }}
        />
        {/* 보조 글로우 */}
        <div
          className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full transition-all duration-1000"
          style={{
            background: `radial-gradient(circle, ${slide.accentColor}0a, transparent 70%)`,
          }}
        />
        {/* 격자 패턴 */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${slide.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${slide.accentColor} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        {/* 떠다니는 원형 장식 */}
        <div
          className="hero-float-slow absolute w-3 h-3 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.15, top: '20%', left: '15%' }}
        />
        <div
          className="hero-float-med absolute w-2 h-2 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.1, top: '60%', left: '10%' }}
        />
        <div
          className="hero-float-fast absolute w-4 h-4 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.08, top: '30%', right: '40%' }}
        />
      </div>

      {/* ===== 메인 콘텐츠 ===== */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex items-end sm:items-center min-h-[260px] sm:min-h-[300px] lg:min-h-[380px] py-8 sm:py-10 lg:py-14">

          {/* 텍스트 영역 */}
          <div className="flex-1 z-10 pb-2 sm:pb-0">
            {/* 배지 */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mb-3 sm:mb-4
                ${slide.badgeColor} shadow-lg
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}
            >
              <span>{slide.icon}</span>
              <span>{slide.badge}</span>
            </div>

            {/* 제목 */}
            <h2
              className={`text-2xl sm:text-4xl lg:text-[3.25rem] xl:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
            >
              {slide.title}
            </h2>

            {/* 설명 */}
            <p
              className={`text-sm sm:text-base lg:text-lg text-white/55 leading-relaxed whitespace-pre-line max-w-lg
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isVisible ? '350ms' : '0ms' }}
            >
              {slide.description}
            </p>

            {/* CTA 버튼 */}
            <div
              className={`mt-4 sm:mt-5 transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isVisible ? '500ms' : '0ms' }}
            >
              <a
                href="#exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${slide.accentColor}, ${slide.accentColor}bb)`,
                  boxShadow: `0 4px 20px ${slide.accentColor}40`,
                }}
              >
                시험 보러 가기
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* ===== 사람 이미지 ===== */}
          <div className="relative flex-shrink-0 w-[140px] sm:w-[220px] lg:w-[320px] h-[200px] sm:h-[300px] lg:h-[400px]">
            {/* 이미지 뒤 글로우 */}
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[40%] rounded-full blur-3xl transition-all duration-700
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{
                background: `radial-gradient(ellipse, ${slide.accentColor}25, transparent 70%)`,
                transitionDelay: isVisible ? '300ms' : '0ms',
              }}
            />

            {/* 사람 이미지 */}
            <div
              className={`absolute inset-0 transition-all duration-700 ease-out
                ${isVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-10 scale-95'}`}
              style={{ transitionDelay: isVisible ? '250ms' : '0ms' }}
            >
              <Image
                src={slide.personImage}
                alt={slide.personAlt}
                fill
                className="object-contain object-bottom drop-shadow-2xl"
                sizes="(max-width: 640px) 140px, (max-width: 1024px) 200px, 260px"
                priority={current === 0}
              />
            </div>

            {/* 떠다니는 아이콘 장식 (이미지 주변) */}
            <div
              className={`absolute -top-2 -right-2 sm:top-2 sm:right-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-lg hero-float-slow
                transition-all duration-600
                ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{
                background: `linear-gradient(135deg, ${slide.accentColor}30, ${slide.accentColor}10)`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${slide.accentColor}20`,
                transitionDelay: isVisible ? '600ms' : '0ms',
              }}
            >
              {slide.icon}
            </div>

            <div
              className={`absolute bottom-16 -left-4 sm:bottom-20 sm:-left-6 w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-sm shadow-lg hero-float-med
                transition-all duration-600
                ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{
                background: `linear-gradient(135deg, ${slide.accentColor}25, ${slide.accentColor}08)`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${slide.accentColor}15`,
                transitionDelay: isVisible ? '750ms' : '0ms',
              }}
            >
              ✓
            </div>
          </div>
        </div>
      </div>

      {/* ===== 하단 네비게이션 ===== */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-4 sm:pb-5">
        <div className="flex items-center gap-3">
          {/* 도트 */}
          <div className="flex gap-2">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="group relative h-6 flex items-center"
                aria-label={`슬라이드 ${i + 1}`}
              >
                <div
                  className={`h-[3px] rounded-full transition-all duration-500
                    ${i === current
                      ? 'w-8 sm:w-10'
                      : 'w-3 sm:w-4 group-hover:w-5 opacity-30 group-hover:opacity-50'
                    }`}
                  style={{ backgroundColor: i === current ? s.accentColor : '#ffffff' }}
                />
              </button>
            ))}
          </div>

          {/* 슬라이드 번호 */}
          <span className="text-[11px] text-white/25 tabular-nums ml-1">
            {String(current + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
          </span>

          {/* 화살표 (데스크탑) */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
              aria-label="이전"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
              aria-label="다음"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mt-3 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
          <div
            key={current}
            className="h-full rounded-full hero-progress-bar"
            style={{ backgroundColor: slide.accentColor }}
          />
        </div>
      </div>
    </div>
  )
}
