'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

/* ── 타입 ── */
interface FloatingEl {
  type: 'block' | 'bubble' | 'sparkle' | 'dot' | 'pill' | 'ring' | 'swirl' | 'diamond' | 'wreath' | 'dualWreath'
  text?: string
  letter?: string
  right: string
  top: string
  delay: number
  color?: string
  size?: number
  rotate?: number
  anim: string
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
  ctaText?: string
  ctaHref?: string
  floats: FloatingEl[]
}

/* ── 3D 레터블록 SVG (에어클래스 OPIC 스타일) ── */
function LetterBlock({ letter, size = 44 }: { letter: string; size?: number }) {
  const h = Math.round(size * 1.18)
  return (
    <svg width={size} height={h} viewBox="0 0 44 52" fill="none">
      <rect x="5" y="12" width="35" height="35" rx="8" fill="#78350f" opacity="0.15" />
      <rect x="4" y="9" width="35" height="35" rx="8" fill="#ca8a04" opacity="0.45" />
      <rect x="4" y="5" width="35" height="35" rx="8" fill="#fde68a" />
      <rect x="8" y="9" width="27" height="27" rx="5" fill="#fefce8" />
      <text x="21.5" y="29" textAnchor="middle" fontSize="18" fontWeight="800" fill="#b45309" fontFamily="system-ui, -apple-system, sans-serif">{letter}</text>
    </svg>
  )
}

/* ── 4각 반짝이 SVG ── */
function Sparkle({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 0 C12.5 8 16 11.5 24 12 C16 12.5 12.5 16 12 24 C11.5 16 8 12.5 0 12 C8 11.5 11.5 8 12 0Z" fill={color} />
    </svg>
  )
}

/* ── 장식 곡선 스월 SVG (에어클래스 리본 스타일) ── */
function Swirl({ color, size = 60 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path
        d="M8,48 C12,28 28,10 44,22 C56,31 42,46 32,40 C22,34 34,24 42,30"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  )
}

/* ── 다이아몬드(마름모) SVG ── */
function Diamond({ color, size = 20 }: { color: string; size?: number }) {
  const half = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect
        x={half}
        y="0"
        width={half * 0.92}
        height={half * 0.92}
        rx="2"
        transform={`rotate(45 ${half} ${half})`}
        fill={color}
        opacity="0.7"
      />
    </svg>
  )
}

/* ── 월계관 단일 (PNG 이미지 + 내부 텍스트) ── */
function LaurelWreath({ size = 80, text }: { color?: string; size?: number; text?: string }) {
  const innerSize = size * 0.55
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <img
        src="/hero/mooncrown/image.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{ animation: 'wreathBreath 4s ease-in-out infinite' }}
      />
      {text && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-center font-black leading-tight text-white whitespace-pre-line"
            style={{
              width: innerSize,
              fontSize: size * 0.11,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            }}
          >
            {text}
          </span>
        </div>
      )}
    </div>
  )
}

/* ── 월계관 2개 순차 등장 (프리미엄 슬라이드용) ── */
function DualWreath({ size = 160 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* 첫 번째: 자격증 취득 */}
      <div
        className="opacity-0"
        style={{ animation: 'wreathAppear 0.8s ease-out 0.5s forwards' }}
      >
        <LaurelWreath size={size} text={'자격증\n취득'} />
      </div>
      {/* 두 번째: 취업 연계 */}
      <div
        className="opacity-0"
        style={{ animation: 'wreathAppear 0.8s ease-out 1.8s forwards' }}
      >
        <LaurelWreath size={size} text={'취업\n연계'} />
      </div>
    </div>
  )
}

/* ── 슬라이드별 고유 장식 데이터 ── */
const slides: Slide[] = [
  {
    badge: 'CAYSON',
    title: '전기·소방 자격증\n한 곳에서',
    description: '기능사부터 기사까지\n케이슨에서 한 번에 준비하세요',
    bgColor: '#2f2a29',
    accentColor: '#fbbf24',
    personImage: '/hero/man2.png',
    personAlt: 'CAYSON',
    floats: [
      { type: 'bubble', text: '기능사부터\n기사까지!', right: '-4%', top: '2%', color: '#b45309', delay: 1000, anim: 'wobble' },
      { type: 'wreath', text: '합격의\n시작', right: '16%', top: '8%', size: 160, color: '#fbbf24', delay: 1100, anim: 'float2' },
      { type: 'sparkle', right: '26%', top: '10%', size: 22, color: '#fbbf24', delay: 1200, anim: 'shimmer' },
      { type: 'sparkle', right: '22%', top: '60%', size: 16, color: '#fbbf24', delay: 1350, anim: 'shimmer' },
      { type: 'dot', right: '28%', top: '40%', size: 8, delay: 1150, anim: 'pulse' },
      { type: 'dot', right: '18%', top: '70%', size: 6, delay: 1300, anim: 'float1' },
    ],
  },
  {
    badge: '인기',
    title: '합격으로 증명하는\n전기기능사 기출 CBT',
    description: '역대 기출문제 3,600+ 수록\n기초부터 탄탄하게 합격까지',
    bgColor: '#1d2088',
    accentColor: '#818cf8',
    personImage: '/hero/woman1.png',
    personAlt: '전기기능사 강사',
    floats: [
      { type: 'wreath', text: '3,600+\n문제', right: '14%', top: '6%', size: 170, color: '#fbbf24', delay: 1000, anim: 'float1' },
      { type: 'sparkle', right: '26%', top: '10%', size: 22, color: '#fbbf24', delay: 1200, anim: 'shimmer' },
      { type: 'sparkle', right: '22%', top: '62%', size: 16, color: '#fbbf24', delay: 1400, anim: 'shimmer' },
      { type: 'swirl', right: '16%', top: '48%', size: 50, color: '#818cf8', delay: 1150, anim: 'float3' },
      { type: 'dot', right: '28%', top: '35%', size: 8, delay: 1100, anim: 'pulse' },
      { type: 'dot', right: '20%', top: '72%', size: 6, delay: 1350, anim: 'float2' },
    ],
  },
  {
    badge: '인기',
    title: '전문가 검증 기출문제\n전기기사 합격의 지름길',
    description: '역대 기출 총망라 · 실시간 랭킹\n오답노트로 약점까지 완벽 보완',
    bgColor: '#e14c32',
    accentColor: '#fb923c',
    personImage: '/hero/woman3.png',
    personAlt: '전기기사 강사',
    floats: [
      { type: 'wreath', text: '역대기출\n총망라', right: '16%', top: '10%', size: 160, color: '#fbbf24', delay: 1000, anim: 'float2' },
      { type: 'sparkle', right: '24%', top: '8%', size: 24, color: '#fbbf24', delay: 1150, anim: 'shimmer' },
      { type: 'sparkle', right: '28%', top: '58%', size: 14, color: '#fbbf24', delay: 1350, anim: 'shimmer' },
      { type: 'diamond', right: '18%', top: '32%', size: 18, color: '#fb923c', delay: 1250, anim: 'float3' },
      { type: 'dot', right: '22%', top: '42%', size: 9, delay: 1200, anim: 'pulse' },
      { type: 'dot', right: '30%', top: '68%', size: 6, delay: 1450, anim: 'float1' },
    ],
  },
  {
    badge: '과정평가형',
    title: 'NCS 기반 실무 역량 평가\n소방설비산업기사(전기)',
    description: '과정평가형 완벽 대비\n현장 중심 실무 문제로 합격까지',
    bgColor: '#fe87ca',
    accentColor: '#f43f5e',
    personImage: '/hero/woman2.png',
    personAlt: '소방설비산업기사 강사',
    floats: [
      { type: 'pill', text: 'NCS', right: '20%', top: '8%', color: '#f43f5e', delay: 1000, anim: 'float1' },
      { type: 'pill', text: '과정평가형', right: '22%', top: '58%', color: '#e11d48', delay: 1250, anim: 'float2' },
      { type: 'sparkle', right: '26%', top: '25%', size: 20, color: '#fbbf24', delay: 1100, anim: 'shimmer' },
      { type: 'sparkle', right: '28%', top: '72%', size: 14, color: '#fb7185', delay: 1400, anim: 'shimmer' },
      { type: 'dot', right: '24%', top: '42%', size: 8, delay: 1150, anim: 'pulse' },
      { type: 'diamond', right: '18%', top: '65%', size: 16, color: '#fb7185', delay: 1300, anim: 'float3' },
    ],
  },
  {
    badge: 'PREMIUM',
    title: '자격증 취득부터 취업까지\nCAYSON 프리미엄',
    description: '프리미엄 등급만의 특별한 혜택\n합격률을 높이는 최고의 학습 경험',
    bgColor: '#1b1514',
    accentColor: '#fbbf24',
    personImage: '',
    personAlt: '',
    ctaText: '프리미엄 알아보기',
    ctaHref: '#premium',
    floats: [
      { type: 'dualWreath', right: '2%', top: '10%', size: 150, delay: 0, anim: 'float1' },
      { type: 'sparkle', right: '18%', top: '5%', size: 28, color: '#fbbf24', delay: 1000, anim: 'shimmer' },
      { type: 'sparkle', right: '12%', top: '52%', size: 20, color: '#f59e0b', delay: 1200, anim: 'shimmer' },
      { type: 'sparkle', right: '24%', top: '72%', size: 14, color: '#fbbf24', delay: 1400, anim: 'shimmer' },
      { type: 'diamond', right: '8%', top: '38%', size: 22, color: '#fbbf24', delay: 1100, anim: 'float2' },
      { type: 'ring', right: '20%', top: '48%', size: 40, color: '#f59e0b', delay: 1250, anim: 'float3' },
      { type: 'dot', right: '26%', top: '22%', size: 10, delay: 1050, anim: 'pulse' },
      { type: 'dot', right: '16%', top: '78%', size: 7, delay: 1350, anim: 'pulse' },
    ],
  },
]

const DURATION = 5000
const FADE_MS = 400

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

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
  }, [])

  const goTo = useCallback((index: number) => {
    if (index === current) return
    clearTimer()
    setTextVisible(false)          // 1) 현재 텍스트 fade-out
    setPrev(current)
    setTimeout(() => {
      setCurrent(index)            // 2) fade-out 완료 후 텍스트 교체
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTextVisible(true)     // 3) 새 텍스트 fade-in
          setPrev(-1)
        })
      })
    }, FADE_MS)
  }, [current, clearTimer])

  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, goTo])
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo])

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
      {/* 배경 */}
      {prevSlide && (
        <div className="absolute inset-0 z-0 transition-opacity" style={{ backgroundColor: prevSlide.bgColor, opacity: 0, transitionDuration: `${FADE_MS}ms` }} />
      )}
      <div className="absolute inset-0 z-0 transition-opacity" style={{ backgroundColor: slide.bgColor, opacity: 1, transitionDuration: `${FADE_MS}ms` }} />

      {/* 배경 글로우 */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle, ${slide.accentColor}15, transparent 70%)` }} />
        <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle, ${slide.accentColor}08, transparent 70%)` }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="relative flex items-start sm:items-end h-[250px] sm:h-[360px] lg:h-[420px]">

          {/* ===== 장식 레이어 (말풍선 제외: 사람 뒤 z-0) ===== */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden sm:block">
            {slide.floats.filter(f => f.type !== 'bubble').map((f, fi) => {
              const isActive = textVisible
              const ac = animConfig[f.anim]
              return (
                <div
                  key={`deco-${current}-${fi}`}
                  className="absolute"
                  style={{ right: f.right, top: f.top }}
                >
                  {/* 등장 애니메이션 (외부) */}
                  <div
                    className="transition-all ease-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive
                        ? `rotate(${f.rotate || 0}deg) scale(1)`
                        : `rotate(${f.rotate || 0}deg) scale(0.4)`,
                      transitionDuration: '500ms',
                      transitionDelay: isActive ? `${f.delay}ms` : '0ms' }}
                  >
                    {/* 떠다니는 애니메이션 (내부) */}
                    <div style={{ animation: ac ? `${ac.name} ${ac.dur} ease-in-out infinite` : 'none' }}>

                      {/* 3D 레터블록 */}
                      {f.type === 'block' && <LetterBlock letter={f.letter || ''} size={f.size || 44} />}

                      {/* 말풍선 (에어클래스 스타일 — 크고 둥근 직사각형, 좌하단 꼬리) */}
                      {f.type === 'bubble' && (
                        <div className="relative">
                          <div
                            className="relative px-6 py-4 lg:px-8 lg:py-5 rounded-[20px] shadow-2xl text-[15px] lg:text-[18px] font-extrabold text-white overflow-hidden"
                            style={{ backgroundColor: f.color || slide.accentColor }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-[20px]" />
                            <span className="relative whitespace-pre-line leading-snug">{f.text}</span>
                          </div>
                          {/* 꼬리 — 좌하단, 사람 머리 방향 */}
                          <svg className="absolute -bottom-[14px] left-3" width="22" height="16" viewBox="0 0 22 16" fill="none">
                            <path d="M0 0C4 8 2 14 0 16L22 0H0Z" fill={f.color || slide.accentColor} />
                          </svg>
                        </div>
                      )}

                      {/* 반짝이 */}
                      {f.type === 'sparkle' && <Sparkle color={f.color || slide.accentColor} size={f.size || 24} />}

                      {/* 도트 */}
                      {f.type === 'dot' && (
                        <div className="rounded-full bg-white/70" style={{ width: f.size || 8, height: f.size || 8 }} />
                      )}

                      {/* 필 뱃지 */}
                      {f.type === 'pill' && (
                        <div
                          className="relative px-5 py-2 rounded-full text-[12px] font-bold text-white shadow-lg whitespace-nowrap overflow-hidden"
                          style={{ backgroundColor: f.color || slide.accentColor }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-full" />
                          <span className="relative">{f.text}</span>
                        </div>
                      )}

                      {/* 링 */}
                      {f.type === 'ring' && (
                        <div
                          className="rounded-full"
                          style={{
                            width: f.size || 40,
                            height: f.size || 40,
                            border: `2.5px solid ${f.color || slide.accentColor}`,
                            opacity: 0.35 }}
                        />
                      )}

                      {/* 스월 곡선 */}
                      {f.type === 'swirl' && <Swirl color={f.color || slide.accentColor} size={f.size || 60} />}

                      {/* 다이아몬드 */}
                      {f.type === 'diamond' && <Diamond color={f.color || slide.accentColor} size={f.size || 20} />}

                      {/* 월계관 */}
                      {f.type === 'wreath' && <LaurelWreath color={f.color || '#fbbf24'} size={f.size || 80} text={f.text} />}

                      {/* 월계관 2개 순차 등장 (프리미엄) */}
                      {f.type === 'dualWreath' && <DualWreath size={f.size || 150} />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 텍스트 */}
          <div className="flex-1 z-10 pb-12 sm:pb-24 lg:pb-28 pt-7 sm:pt-6 lg:pt-8">
            <div
              className="inline-block px-4 py-1.5 rounded text-xs font-bold text-white mb-4 transition-all ease-out"
              style={{
                backgroundColor: slide.accentColor,
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(16px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '0ms' : '0ms' }}
            >
              {slide.badge}
            </div>

            <h2
              className="text-2xl sm:text-4xl lg:text-[42px] font-extrabold text-white mb-2 sm:mb-3 leading-[1.5] tracking-normal whitespace-pre-line transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '100ms' : '0ms' }}
            >
              {slide.title}
            </h2>

            <p
              className="text-[11px] sm:text-[13px] lg:text-sm text-white leading-relaxed whitespace-pre-line max-w-md transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '334ms' : '0ms' }}
            >
              {slide.description}
            </p>

            <div
              className="mt-4 sm:mt-6 transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '500ms' : '0ms' }}
            >
              <a
                href={slide.ctaHref || '#exams'}
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: slide.accentColor }}
              >
                {slide.ctaText || '시험 보러 가기'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>

          {/* ===== 말풍선 레이어 (사람 뒤 — DOM 순서로 사람보다 먼저 렌더) ===== */}
          <div className="absolute inset-0 z-[3] pointer-events-none hidden sm:block">
            {slide.floats.filter(f => f.type === 'bubble').map((f, fi) => {
              const isActive = textVisible
              const ac = animConfig[f.anim]
              return (
                <div
                  key={`bubble-${current}-${fi}`}
                  className="absolute"
                  style={{ right: f.right, top: f.top }}
                >
                  <div
                    className="transition-all ease-out"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'scale(1)' : 'scale(0.4)',
                      transitionDuration: '500ms',
                      transitionDelay: isActive ? `${f.delay}ms` : '0ms' }}
                  >
                    <div style={{ animation: ac ? `${ac.name} ${ac.dur} ease-in-out infinite` : 'none' }}>
                      <div className="relative">
                        <div
                          className="relative px-6 py-4 lg:px-8 lg:py-5 rounded-[20px] shadow-2xl text-[15px] lg:text-[18px] font-extrabold text-white overflow-hidden"
                          style={{ backgroundColor: f.color || slide.accentColor }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent rounded-[20px]" />
                          <span className="relative whitespace-pre-line leading-snug">{f.text}</span>
                        </div>
                        <svg className="absolute -bottom-[14px] left-3" width="22" height="16" viewBox="0 0 22 16" fill="none">
                          <path d="M0 0C4 8 2 14 0 16L22 0H0Z" fill={f.color || slide.accentColor} />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 사람 이미지 (말풍선 위) */}
          <div className="relative flex-shrink-0 w-[145px] sm:w-[180px] lg:w-[220px] xl:w-[260px] self-stretch z-[5]">
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
                    transitionDelay: isActive && textVisible ? '500ms' : '0ms' }}
                >
                  {s.personImage && (
                    <Image
                      src={s.personImage}
                      alt={s.personAlt}
                      fill
                      className="object-contain object-bottom"
                      sizes="(max-width: 640px) 120px, (max-width: 1024px) 180px, 260px"
                      priority={i <= 1}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* 좌우 화살표 */}
      <button onClick={goPrev} className="absolute left-0 top-0 bottom-0 z-[4] w-14 sm:w-20 hidden sm:flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer group" aria-label="이전">
        <span className="text-white/60 group-hover:text-white text-3xl sm:text-4xl font-light transition-colors select-none">&lt;</span>
      </button>
      <button onClick={goNext} className="absolute right-0 top-0 bottom-0 z-[4] w-14 sm:w-20 hidden sm:flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer group" aria-label="다음">
        <span className="text-white/60 group-hover:text-white text-3xl sm:text-4xl font-light transition-colors select-none">&gt;</span>
      </button>

      {/* 하단 네비게이션 */}
      <div className="absolute bottom-0 left-0 right-0 z-[3]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-3 sm:pb-5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex gap-1 sm:gap-1.5">
              {slides.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className="relative h-6 flex items-center" aria-label={`슬라이드 ${i + 1}`}>
                  <div className="w-6 sm:w-8 h-[3px] rounded-full bg-white/15 overflow-hidden">
                    {i === current && (
                      <div
                        key={`p-${current}`}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: slide.accentColor,
                          animation: paused ? 'none' : `heroProgress ${DURATION}ms linear forwards`,
                          animationPlayState: paused ? 'paused' : 'running' }}
                      />
                    )}
                    {i < current && <div className="h-full w-full rounded-full bg-white/40" />}
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
