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
  personImage: string
  personAlt: string
  imageScale?: number
  personName: string
  personRole: string
}

const slides: Slide[] = [
  {
    badge: '4개 자격증',
    badgeColor: 'bg-emerald-500',
    title: '기능사',
    description: '전기기능사 · 승강기기능사 · 위험물기능사 · 가스기능사\n자격증 취득의 첫 걸음, 기초부터 탄탄하게',
    bgColor: 'from-[#071a12] to-[#0f2e1f]',
    accentColor: '#34d399',
    personImage: '/hero/woman.png',
    personAlt: '기능사 자격증',
    personName: '김서연 강사',
    personRole: '전기기능사 합격률 94%',
  },
  {
    badge: '6개 자격증',
    badgeColor: 'bg-violet-500',
    title: '산업기사',
    description: '전기산업기사 · 소방설비산업기사(전기/기계)\n에너지 · 공조냉동기계 · 산업안전산업기사',
    bgColor: 'from-[#150d24] to-[#251840]',
    accentColor: '#a78bfa',
    personImage: '/hero/man.png',
    personAlt: '산업기사 자격증',
    personName: '박준혁 강사',
    personRole: '현직 전기 엔지니어 12년',
  },
  {
    badge: '인기',
    badgeColor: 'bg-red-500',
    title: '기사',
    description: '전기기사 · 소방설비기사(전기/기계) · 가스기사\n2,100문제 기출 완비, 전문가 검증 해설',
    bgColor: 'from-[#0f1729] to-[#1a2744]',
    accentColor: '#4f8cff',
    personImage: '/hero/man2.png',
    personAlt: '기사 자격증',
    imageScale: 1.35,
    personName: '이정우 강사',
    personRole: '전기기사 문제 검증 전문가',
  },
  {
    badge: '최고 등급',
    badgeColor: 'bg-amber-500',
    title: '기능장',
    description: '전기기능장\n최고 등급 자격증에 도전하세요',
    bgColor: 'from-[#1a1200] to-[#302000]',
    accentColor: '#fbbf24',
    personImage: '/hero/man3.png',
    personAlt: '기능장 자격증',
    personName: '최민수 강사',
    personRole: '기능장 실기 지도 전문',
  },
  {
    badge: '준비중',
    badgeColor: 'bg-cyan-500',
    title: '공기업',
    description: '공기업 채용 대비 전공시험\n한국전력공사 · 한국수력원자력 등',
    bgColor: 'from-[#0a1a20] to-[#102a35]',
    accentColor: '#22d3ee',
    personImage: '/hero/woman3.png',
    personAlt: '공기업 시험',
    personName: '한수민 강사',
    personRole: '공기업 전공시험 컨설턴트',
  },
  {
    badge: '준비중',
    badgeColor: 'bg-rose-500',
    title: '과정평가형',
    description: 'NCS 기반 과정평가형 자격\n현장 중심 실무 역량을 평가합니다',
    bgColor: 'from-[#1a0d14] to-[#2d1520]',
    accentColor: '#fb7185',
    personImage: '/hero/woman2.png',
    personAlt: '과정평가형 자격',
    personName: '정유진 강사',
    personRole: 'NCS 과정평가 출제위원',
  },
]

export default function HeroSection() {
  const [current, setCurrent] = useState(0)
  const [displayIndex, setDisplayIndex] = useState(0)
  const [animPhase, setAnimPhase] = useState<'enter' | 'idle' | 'exit'>('enter')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)

  const INTERVAL = 3000

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const goTo = useCallback((index: number) => {
    clearTimer()
    setAnimPhase('exit')
    setTimeout(() => {
      setDisplayIndex(index)
      setCurrent(index)
      setAnimPhase('enter')
    }, 500)
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

  const slide = slides[displayIndex]
  const isVisible = animPhase === 'enter' || animPhase === 'idle'

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${slide.bgColor} transition-colors duration-700`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ===== 배경 장식 ===== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}18, transparent 70%)` }}
        />
        <div
          className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${slide.accentColor}0a, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${slide.accentColor} 1px, transparent 1px), linear-gradient(90deg, ${slide.accentColor} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
        <div className="hero-float-slow absolute w-3 h-3 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.15, top: '20%', left: '15%' }} />
        <div className="hero-float-med absolute w-2 h-2 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.1, top: '60%', left: '10%' }} />
        <div className="hero-float-fast absolute w-4 h-4 rounded-full"
          style={{ background: slide.accentColor, opacity: 0.08, top: '30%', right: '40%' }} />
      </div>

      {/* ===== 메인 콘텐츠 ===== */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex items-end sm:items-center min-h-[260px] sm:min-h-[300px] lg:min-h-[380px] py-8 sm:py-10 lg:py-14">

          {/* 텍스트 영역 */}
          <div className="flex-1 z-10 pb-2 sm:pb-0">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white mb-3 sm:mb-4
                ${slide.badgeColor} shadow-lg
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: isVisible ? '100ms' : '0ms' }}
            >
              {slide.badge}
            </div>

            <h2
              className={`text-2xl sm:text-4xl lg:text-[3.25rem] xl:text-6xl font-black text-white mb-3 sm:mb-4 leading-tight
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}
            >
              {slide.title}
            </h2>

            <p
              className={`text-sm sm:text-base lg:text-lg text-white/55 leading-relaxed whitespace-pre-line max-w-lg
                transition-all duration-600 ease-out
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isVisible ? '350ms' : '0ms' }}
            >
              {slide.description}
            </p>

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

          {/* ===== 사람 이미지 (크로스페이드) ===== */}
          <div className="relative flex-shrink-0 w-[140px] sm:w-[220px] lg:w-[320px] h-[200px] sm:h-[300px] lg:h-[400px]">
            {/* 이미지 뒤 글로우 */}
            <div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[40%] rounded-full blur-3xl transition-opacity duration-700
                ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              style={{ background: `radial-gradient(ellipse, ${slide.accentColor}25, transparent 70%)` }}
            />

            {/* 모든 이미지를 렌더링하고 현재 슬라이드만 보이도록 크로스페이드 */}
            {slides.map((s, i) => {
              const scale = s.imageScale || 1
              return (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  opacity: i === displayIndex && isVisible ? 1 : 0,
                  transform: i === displayIndex && isVisible
                    ? `translateY(0) scale(${scale})`
                    : `translateY(24px) scale(${scale * 0.97})`,
                  transformOrigin: 'bottom center',
                  transitionDelay: i === displayIndex && isVisible ? '200ms' : '0ms',
                }}
              >
                <Image
                  src={s.personImage}
                  alt={s.personAlt}
                  fill
                  className="object-contain object-bottom drop-shadow-2xl"
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 220px, 320px"
                  priority={i <= 1}
                />
              </div>
              )
            })}

          </div>
        </div>
      </div>

      {/* ===== 하단 네비게이션 ===== */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-4 sm:pb-5">
        <div className="flex items-center gap-3">
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

          <span className="text-[11px] text-white/25 tabular-nums ml-1">
            {String(current + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
          </span>

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
