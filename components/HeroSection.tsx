'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface Slide {
  badge: string
  title: string
  description: string
  bgColor: string
  accentColor: string
  personImage: string
  personAlt: string
  imageScale?: number
}

const slides: Slide[] = [
  {
    badge: '4개 자격증',
    title: '기능사',
    description: '전기기능사 · 승강기기능사 · 위험물기능사 · 가스기능사\n자격증 취득의 첫 걸음, 기초부터 탄탄하게',
    bgColor: '#071a12',
    accentColor: '#34d399',
    personImage: '/hero/woman1.png',
    personAlt: '기능사',
  },
  {
    badge: '6개 자격증',
    title: '산업기사',
    description: '전기산업기사 · 소방설비산업기사(전기/기계)\n에너지 · 공조냉동기계 · 산업안전산업기사',
    bgColor: '#150d24',
    accentColor: '#a78bfa',
    personImage: '/hero/man1.png',
    personAlt: '산업기사',
  },
  {
    badge: '인기',
    title: '기사',
    description: '전기기사 · 소방설비기사(전기/기계) · 가스기사\n2,100문제 기출 완비, 전문가 검증 해설',
    bgColor: '#0f1729',
    accentColor: '#4f8cff',
    personImage: '/hero/man2.png',
    personAlt: '기사',
    imageScale: 0.95,
  },
  {
    badge: '최고 등급',
    title: '기능장',
    description: '전기기능장\n최고 등급 자격증에 도전하세요',
    bgColor: '#1a1200',
    accentColor: '#fbbf24',
    personImage: '/hero/man3.png',
    personAlt: '기능장',
  },
  {
    badge: '준비중',
    title: '공기업',
    description: '공기업 채용 대비 전공시험\n한국전력공사 · 한국수력원자력 등',
    bgColor: '#0a1a20',
    accentColor: '#22d3ee',
    personImage: '/hero/woman3.png',
    personAlt: '공기업',
  },
  {
    badge: '준비중',
    title: '과정평가형',
    description: 'NCS 기반 과정평가형 자격\n현장 중심 실무 역량을 평가합니다',
    bgColor: '#1a0d14',
    accentColor: '#fb7185',
    personImage: '/hero/woman2.png',
    personAlt: '과정평가형',
  },
]

const DURATION = 5000
const FADE_MS = 400

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(-1)
  const [textVisible, setTextVisible] = useState(true)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)
  const dotRef = useRef<HTMLDivElement>(null)

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const goTo = useCallback((index: number) => {
    if (index === current) return
    clearTimer()
    // 텍스트 + 이미지 동시 퇴장
    setTextVisible(false)
    setPrev(current)
    setCurrent(index)
    // 동시 입장 (퇴장 FADE_MS 후)
    setTimeout(() => {
      setTextVisible(true)
      setPrev(-1)
    }, FADE_MS)
  }, [current, clearTimer])

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, goTo])

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, goTo])

  // 자동 회전
  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(goNext, DURATION)
    return clearTimer
  }, [current, paused, goNext, clearTimer])

  // 터치
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) { diff > 0 ? goNext() : goPrev() }
  }

  const slide = slides[current]
  const prevSlide = prev >= 0 ? slides[prev] : null

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ===== 배경 레이어 (페이드 전환) ===== */}
      {prevSlide && (
        <div
          className="absolute inset-0 z-0 transition-opacity"
          style={{ backgroundColor: prevSlide.bgColor, opacity: 0, transitionDuration: `${FADE_MS}ms` }}
        />
      )}
      <div
        className="absolute inset-0 z-0 transition-opacity"
        style={{ backgroundColor: slide.bgColor, opacity: 1, transitionDuration: `${FADE_MS}ms` }}
      />

      {/* 배경 장식 */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}15, transparent 70%)` }}
        />
        <div
          className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}08, transparent 70%)` }}
        />
      </div>

      {/* ===== 메인 콘텐츠 ===== */}
      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex items-end min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]">

          {/* 텍스트 */}
          <div className="flex-1 z-10 pb-12 sm:pb-14 lg:pb-16 pt-8 sm:pt-10 lg:pt-14">
            {/* 배지 */}
            <div
              className="inline-block px-3 py-1 rounded text-[11px] font-bold text-white mb-4 transition-all ease-out"
              style={{
                backgroundColor: slide.accentColor,
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(16px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '0ms' : '0ms',
              }}
            >
              {slide.badge}
            </div>

            {/* 제목 */}
            <h2
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 sm:mb-4 leading-[1.1] tracking-tight transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '100ms' : '0ms',
              }}
            >
              {slide.title}
            </h2>

            {/* 설명 */}
            <p
              className="text-sm sm:text-base lg:text-lg text-white/50 leading-relaxed whitespace-pre-line max-w-lg transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '334ms' : '0ms',
              }}
            >
              {slide.description}
            </p>

            {/* CTA */}
            <div
              className="mt-5 sm:mt-6 transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '500ms' : '0ms',
              }}
            >
              <a
                href="#exams"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: slide.accentColor }}
              >
                자격증 선택
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* ===== 사람 이미지 ===== */}
          <div className="relative flex-shrink-0 w-[100px] sm:w-[160px] lg:w-[220px] xl:w-[260px] self-stretch">
            {slides.map((s, i) => {
              const scale = s.imageScale || 1
              const isActive = i === current
              return (
                <div
                  key={i}
                  className="absolute inset-0 transition-all ease-out"
                  style={{
                    opacity: isActive && textVisible ? 1 : 0,
                    transform: isActive && textVisible ? `scale(${scale})` : `translateY(16px) scale(${scale * 0.97})`,
                    transformOrigin: 'bottom center',
                    transitionDuration: '667ms',
                    transitionDelay: isActive && textVisible ? '500ms' : '0ms',
                  }}
                >
                  <Image
                    src={s.personImage}
                    alt={s.personAlt}
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 640px) 100px, (max-width: 1024px) 160px, 260px"
                    priority={i <= 1}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== 하단 네비게이션 (히어로 내부 하단 고정) ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-[3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
            {/* 도트 + 진행 바 통합 */}
            <div className="flex gap-1.5" ref={dotRef}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="relative h-6 flex items-center"
                  aria-label={`슬라이드 ${i + 1}`}
                >
                  <div className="w-8 h-[3px] rounded-full bg-white/15 overflow-hidden">
                    {i === current && (
                      <div
                        key={`p-${current}`}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: slide.accentColor,
                          animation: paused ? 'none' : `heroProgress ${DURATION}ms linear forwards`,
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
                      />
                    )}
                    {i < current && (
                      <div className="h-full w-full rounded-full bg-white/40" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 번호 */}
            <span className="text-[11px] text-white/20 tabular-nums ml-1">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>

            {/* 화살표 (데스크탑) */}
            <div className="hidden lg:flex items-center gap-1.5 ml-auto">
              <button
                onClick={goPrev}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                aria-label="이전"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                aria-label="다음"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
