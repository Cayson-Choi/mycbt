'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

interface FloatingEl {
  type: 'laurel' | 'bubble' | 'sparkle' | 'dot'
  text?: string
  sub?: string
  x: string
  y: string
  delay: number
  color?: string
  size?: number
  anim?: 'float1' | 'float2' | 'float3' | 'shimmer' | 'pulse' | 'wobble'
}

interface Slide {
  badge: string
  title: string
  description: string
  bgColor: string
  accentColor: string
  personImage: string
  personAlt: string
  imageScale?: number
  floats: FloatingEl[]
}

/* ── 월계관 SVG 컴포넌트 (에어클래스 스타일) ── */
function LaurelBadge({ text, sub, accentColor }: { text: string; sub?: string; accentColor: string }) {
  return (
    <div className="relative w-[110px] h-[110px] lg:w-[130px] lg:h-[130px]">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 140 140" fill="none">
        {/* 왼쪽 월계관 */}
        <g opacity="0.9">
          <ellipse cx="28" cy="105" rx="8" ry="16" transform="rotate(30 28 105)" fill={accentColor} opacity="0.5" />
          <ellipse cx="28" cy="105" rx="6" ry="13" transform="rotate(30 28 105)" fill={accentColor} opacity="0.7" />
          <ellipse cx="20" cy="88" rx="7" ry="15" transform="rotate(20 20 88)" fill={accentColor} opacity="0.55" />
          <ellipse cx="20" cy="88" rx="5" ry="12" transform="rotate(20 20 88)" fill={accentColor} opacity="0.75" />
          <ellipse cx="16" cy="70" rx="7" ry="14" transform="rotate(8 16 70)" fill={accentColor} opacity="0.6" />
          <ellipse cx="16" cy="70" rx="5" ry="11" transform="rotate(8 16 70)" fill={accentColor} opacity="0.8" />
          <ellipse cx="18" cy="52" rx="7" ry="14" transform="rotate(-5 18 52)" fill={accentColor} opacity="0.55" />
          <ellipse cx="18" cy="52" rx="5" ry="11" transform="rotate(-5 18 52)" fill={accentColor} opacity="0.75" />
          <ellipse cx="25" cy="36" rx="7" ry="13" transform="rotate(-20 25 36)" fill={accentColor} opacity="0.5" />
          <ellipse cx="25" cy="36" rx="5" ry="10" transform="rotate(-20 25 36)" fill={accentColor} opacity="0.7" />
          <ellipse cx="36" cy="24" rx="6" ry="12" transform="rotate(-35 36 24)" fill={accentColor} opacity="0.45" />
          <ellipse cx="36" cy="24" rx="4" ry="9" transform="rotate(-35 36 24)" fill={accentColor} opacity="0.65" />
          <path d="M35 110 C22 95 14 75 16 55 C18 40 25 28 40 18" stroke={accentColor} strokeWidth="1.5" opacity="0.3" fill="none" />
        </g>
        {/* 오른쪽 월계관 (좌우 대칭) */}
        <g opacity="0.9" transform="translate(140,0) scale(-1,1)">
          <ellipse cx="28" cy="105" rx="8" ry="16" transform="rotate(30 28 105)" fill={accentColor} opacity="0.5" />
          <ellipse cx="28" cy="105" rx="6" ry="13" transform="rotate(30 28 105)" fill={accentColor} opacity="0.7" />
          <ellipse cx="20" cy="88" rx="7" ry="15" transform="rotate(20 20 88)" fill={accentColor} opacity="0.55" />
          <ellipse cx="20" cy="88" rx="5" ry="12" transform="rotate(20 20 88)" fill={accentColor} opacity="0.75" />
          <ellipse cx="16" cy="70" rx="7" ry="14" transform="rotate(8 16 70)" fill={accentColor} opacity="0.6" />
          <ellipse cx="16" cy="70" rx="5" ry="11" transform="rotate(8 16 70)" fill={accentColor} opacity="0.8" />
          <ellipse cx="18" cy="52" rx="7" ry="14" transform="rotate(-5 18 52)" fill={accentColor} opacity="0.55" />
          <ellipse cx="18" cy="52" rx="5" ry="11" transform="rotate(-5 18 52)" fill={accentColor} opacity="0.75" />
          <ellipse cx="25" cy="36" rx="7" ry="13" transform="rotate(-20 25 36)" fill={accentColor} opacity="0.5" />
          <ellipse cx="25" cy="36" rx="5" ry="10" transform="rotate(-20 25 36)" fill={accentColor} opacity="0.7" />
          <ellipse cx="36" cy="24" rx="6" ry="12" transform="rotate(-35 36 24)" fill={accentColor} opacity="0.45" />
          <ellipse cx="36" cy="24" rx="4" ry="9" transform="rotate(-35 36 24)" fill={accentColor} opacity="0.65" />
          <path d="M35 110 C22 95 14 75 16 55 C18 40 25 28 40 18" stroke={accentColor} strokeWidth="1.5" opacity="0.3" fill="none" />
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[66px] h-[66px] lg:w-[78px] lg:h-[78px] rounded-full bg-white/95 shadow-lg flex flex-col items-center justify-center">
          <div className="text-[10px] lg:text-[11px] font-black tracking-wide leading-tight" style={{ color: accentColor }}>{text}</div>
          {sub && <div className="text-[9px] lg:text-[10px] font-extrabold text-gray-700 leading-tight mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  )
}

/* ── 4각 반짝이 SVG ── */
function Sparkle({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 0 C12.5 8 16 11.5 24 12 C16 12.5 12.5 16 12 24 C11.5 16 8 12.5 0 12 C8 11.5 11.5 8 12 0Z"
        fill={color}
      />
    </svg>
  )
}

/* ── 각 슬라이드별 고유한 장식 배치 ── */
const slides: Slide[] = [
  {
    badge: '4개 자격증',
    title: '기능사',
    description: '전기기능사 · 승강기기능사 · 위험물기능사 · 가스기능사\n자격증 취득의 첫 걸음, 기초부터 탄탄하게',
    bgColor: '#071a12',
    accentColor: '#34d399',
    personImage: '/hero/woman1.png',
    personAlt: '기능사',
    floats: [
      { type: 'laurel', text: 'CAYSON', sub: '합격률 94%', x: '-70%', y: '0%', delay: 600, anim: 'float1' },
      { type: 'bubble', text: '필기+실기 완벽 대비', x: '45%', y: '-2%', delay: 800, color: '#34d399', anim: 'wobble' },
      { type: 'sparkle', x: '-45%', y: '60%', delay: 500, color: '#fbbf24', size: 30, anim: 'shimmer' },
      { type: 'sparkle', x: '85%', y: '25%', delay: 700, color: '#34d399', size: 20, anim: 'float3' },
      { type: 'sparkle', x: '-20%', y: '30%', delay: 900, color: '#fbbf24', size: 14, anim: 'shimmer' },
      { type: 'dot', x: '-55%', y: '40%', delay: 400, size: 10, anim: 'pulse' },
      { type: 'dot', x: '70%', y: '60%', delay: 600, size: 8, anim: 'float2' },
      { type: 'dot', x: '-30%', y: '80%', delay: 800, size: 6, anim: 'pulse' },
    ],
  },
  {
    badge: '6개 자격증',
    title: '산업기사',
    description: '전기산업기사 · 소방설비산업기사(전기/기계)\n에너지 · 공조냉동기계 · 산업안전산업기사',
    bgColor: '#150d24',
    accentColor: '#a78bfa',
    personImage: '/hero/man1.png',
    personAlt: '산업기사',
    floats: [
      { type: 'bubble', text: '6개 종목 한번에!', x: '-60%', y: '-2%', delay: 600, color: '#a78bfa', anim: 'float1' },
      { type: 'laurel', text: '전문가', sub: '검증 완료', x: '50%', y: '30%', delay: 800, anim: 'float2' },
      { type: 'sparkle', x: '80%', y: '5%', delay: 500, color: '#fbbf24', size: 26, anim: 'shimmer' },
      { type: 'sparkle', x: '-50%', y: '50%', delay: 700, color: '#c084fc', size: 18, anim: 'float3' },
      { type: 'sparkle', x: '60%', y: '70%', delay: 900, color: '#a78bfa', size: 22, anim: 'shimmer' },
      { type: 'dot', x: '-35%', y: '25%', delay: 400, size: 9, anim: 'pulse' },
      { type: 'dot', x: '75%', y: '50%', delay: 650, size: 7, anim: 'float1' },
      { type: 'dot', x: '-60%', y: '75%', delay: 850, size: 11, anim: 'pulse' },
    ],
  },
  {
    badge: '인기',
    title: '기사',
    description: '전기기사 · 소방설비기사(전기/기계) · 가스기사\n전문가 검증 기출, 합격까지 한 번에',
    bgColor: '#0f1729',
    accentColor: '#4f8cff',
    personImage: '/hero/man2.png',
    personAlt: '기사',
    imageScale: 0.95,
    floats: [
      { type: 'laurel', text: 'BEST', sub: '인기 1위', x: '-65%', y: '5%', delay: 600, anim: 'float1' },
      { type: 'laurel', text: '2025', sub: '최신 기출', x: '55%', y: '35%', delay: 900, anim: 'float3' },
      { type: 'sparkle', x: '75%', y: '0%', delay: 500, color: '#fbbf24', size: 28, anim: 'shimmer' },
      { type: 'sparkle', x: '-40%', y: '65%', delay: 750, color: '#4f8cff', size: 16, anim: 'float2' },
      { type: 'dot', x: '-50%', y: '35%', delay: 400, size: 12, anim: 'pulse' },
      { type: 'dot', x: '85%', y: '55%', delay: 600, size: 8, anim: 'float3' },
      { type: 'dot', x: '-25%', y: '85%', delay: 800, size: 6, anim: 'pulse' },
      { type: 'dot', x: '50%', y: '10%', delay: 700, size: 7, anim: 'float2' },
    ],
  },
  {
    badge: '최고 등급',
    title: '기능장',
    description: '전기기능장\n최고 등급 자격증에 도전하세요',
    bgColor: '#1a1200',
    accentColor: '#fbbf24',
    personImage: '/hero/man3.png',
    personAlt: '기능장',
    floats: [
      { type: 'bubble', text: '최고 등급에 도전!', x: '45%', y: '-5%', delay: 600, color: '#f59e0b', anim: 'wobble' },
      { type: 'laurel', text: 'TOP', sub: '기능장', x: '-70%', y: '25%', delay: 800, anim: 'float3' },
      { type: 'sparkle', x: '-40%', y: '0%', delay: 500, color: '#fbbf24', size: 32, anim: 'shimmer' },
      { type: 'sparkle', x: '80%', y: '40%', delay: 700, color: '#fbbf24', size: 20, anim: 'float1' },
      { type: 'sparkle', x: '-55%', y: '70%', delay: 900, color: '#f59e0b', size: 16, anim: 'shimmer' },
      { type: 'dot', x: '65%', y: '15%', delay: 450, size: 10, anim: 'pulse' },
      { type: 'dot', x: '-30%', y: '55%', delay: 650, size: 8, anim: 'float1' },
      { type: 'dot', x: '80%', y: '75%', delay: 850, size: 6, anim: 'pulse' },
    ],
  },
  {
    badge: '준비중',
    title: '공기업',
    description: '공기업 채용 대비 전공시험\n한국전력공사 · 한국수력원자력 등',
    bgColor: '#0a1a20',
    accentColor: '#22d3ee',
    personImage: '/hero/woman3.png',
    personAlt: '공기업',
    floats: [
      { type: 'laurel', text: 'KEPCO', sub: '한전 대비', x: '50%', y: '0%', delay: 600, anim: 'float2' },
      { type: 'bubble', text: '공기업 전공 특화', x: '-65%', y: '45%', delay: 800, color: '#06b6d4', anim: 'float1' },
      { type: 'sparkle', x: '-45%', y: '5%', delay: 500, color: '#22d3ee', size: 24, anim: 'shimmer' },
      { type: 'sparkle', x: '85%', y: '50%', delay: 700, color: '#fbbf24', size: 18, anim: 'float3' },
      { type: 'sparkle', x: '-25%', y: '75%', delay: 900, color: '#22d3ee', size: 14, anim: 'shimmer' },
      { type: 'dot', x: '70%', y: '30%', delay: 450, size: 11, anim: 'pulse' },
      { type: 'dot', x: '-55%', y: '65%', delay: 700, size: 7, anim: 'float3' },
      { type: 'dot', x: '55%', y: '80%', delay: 850, size: 9, anim: 'pulse' },
    ],
  },
  {
    badge: '준비중',
    title: '과정평가형',
    description: 'NCS 기반 과정평가형 자격\n현장 중심 실무 역량을 평가합니다',
    bgColor: '#1a0d14',
    accentColor: '#fb7185',
    personImage: '/hero/woman2.png',
    personAlt: '과정평가형',
    floats: [
      { type: 'laurel', text: 'NCS', sub: '기반 평가', x: '-65%', y: '-2%', delay: 600, anim: 'float1' },
      { type: 'bubble', text: '현장 실무 역량!', x: '50%', y: '5%', delay: 800, color: '#f43f5e', anim: 'wobble' },
      { type: 'sparkle', x: '85%', y: '35%', delay: 500, color: '#fb7185', size: 26, anim: 'shimmer' },
      { type: 'sparkle', x: '-50%', y: '55%', delay: 700, color: '#fbbf24', size: 20, anim: 'float1' },
      { type: 'sparkle', x: '60%', y: '70%', delay: 900, color: '#fb7185', size: 14, anim: 'shimmer' },
      { type: 'dot', x: '-35%', y: '30%', delay: 400, size: 10, anim: 'pulse' },
      { type: 'dot', x: '75%', y: '55%', delay: 650, size: 8, anim: 'float2' },
      { type: 'dot', x: '-60%', y: '80%', delay: 850, size: 6, anim: 'pulse' },
    ],
  },
]

const DURATION = 5000
const FADE_MS = 400

/* ── 애니메이션 매핑 (CSS keyframe name → duration) ── */
const animConfig: Record<string, { name: string; dur: string }> = {
  float1: { name: 'heroDecFloat1', dur: '3.5s' },
  float2: { name: 'heroDecFloat2', dur: '4s' },
  float3: { name: 'heroDecFloat3', dur: '3s' },
  shimmer: { name: 'heroDecShimmer', dur: '2.5s' },
  pulse: { name: 'heroDecPulse', dur: '2s' },
  wobble: { name: 'heroDecWobble', dur: '3s' },
}

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
    setTextVisible(false)
    setPrev(current)
    setCurrent(index)
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

  useEffect(() => {
    if (paused) return
    timerRef.current = setTimeout(goNext, DURATION)
    return clearTimer
  }, [current, paused, goNext, clearTimer])

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
      {/* ===== 배경 ===== */}
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

      {/* 배경 그라데이션 장식 */}
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
          <div className="flex-1 z-10 pb-14 sm:pb-16 lg:pb-20 pt-10 sm:pt-14 lg:pt-16">
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

            <h2
              className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-3 sm:mb-4 leading-[1.1] tracking-tight transition-all ease-out"
              style={{
                fontFamily: "'NanumSquareNeo', sans-serif",
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '100ms' : '0ms',
              }}
            >
              {slide.title}
            </h2>

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

          {/* ===== 사람 이미지 + 장식 ===== */}
          <div className="relative flex-shrink-0 w-[100px] sm:w-[160px] lg:w-[220px] xl:w-[260px] self-stretch">
            {/* 장식 요소 (이미지 뒤) */}
            {slide.floats.map((f, fi) => {
              const isActive = textVisible
              const ac = f.anim ? animConfig[f.anim] : undefined
              return (
                <div
                  key={`${current}-${fi}`}
                  className="absolute z-[1] hidden sm:block transition-all ease-out pointer-events-none"
                  style={{
                    left: f.x,
                    top: f.y,
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.7)',
                    transitionDuration: '600ms',
                    transitionDelay: isActive ? `${f.delay}ms` : '0ms',
                    animation: isActive && ac ? `${ac.name} ${ac.dur} ease-in-out infinite` : 'none',
                    animationDelay: `${f.delay}ms`,
                  }}
                >
                  {/* 월계관 뱃지 */}
                  {f.type === 'laurel' && (
                    <LaurelBadge
                      text={f.text || ''}
                      sub={f.sub}
                      accentColor={f.color || slide.accentColor}
                    />
                  )}

                  {/* 말풍선 */}
                  {f.type === 'bubble' && (
                    <div className="relative">
                      <div
                        className="px-5 py-3 rounded-2xl shadow-xl text-[12px] lg:text-[13px] font-bold text-white whitespace-nowrap"
                        style={{ backgroundColor: f.color || slide.accentColor }}
                      >
                        {f.text}
                      </div>
                      {/* 말풍선 꼬리 */}
                      <div
                        className="absolute -bottom-[10px] left-6 w-0 h-0"
                        style={{
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: `12px solid ${f.color || slide.accentColor}`,
                        }}
                      />
                    </div>
                  )}

                  {/* 4각 반짝이 */}
                  {f.type === 'sparkle' && (
                    <Sparkle color={f.color || slide.accentColor} size={f.size || 24} />
                  )}

                  {/* 흰 도트 */}
                  {f.type === 'dot' && (
                    <div
                      className="rounded-full bg-white/70"
                      style={{ width: f.size || 8, height: f.size || 8 }}
                    />
                  )}
                </div>
              )
            })}

            {/* 사람 이미지 (장식 위) */}
            {slides.map((s, i) => {
              const scale = s.imageScale || 1
              const isActive = i === current
              return (
                <div
                  key={i}
                  className="absolute inset-0 z-[2] transition-all ease-out"
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

      {/* ===== 좌우 화살표 (호버 시 표시) ===== */}
      <button
        onClick={goPrev}
        className="absolute left-0 top-0 bottom-0 z-[4] w-14 sm:w-20 hidden sm:flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer group"
        aria-label="이전"
      >
        <span className="text-white/60 group-hover:text-white text-3xl sm:text-4xl font-light transition-colors select-none">&lt;</span>
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-0 bottom-0 z-[4] w-14 sm:w-20 hidden sm:flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer group"
        aria-label="다음"
      >
        <span className="text-white/60 group-hover:text-white text-3xl sm:text-4xl font-light transition-colors select-none">&gt;</span>
      </button>

      {/* ===== 하단 네비게이션 ===== */}
      <div className="absolute bottom-0 left-0 right-0 z-[3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-4 sm:pb-5">
          <div className="flex items-center gap-3">
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

            <span className="text-[11px] text-white/20 tabular-nums ml-1">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
