'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'

/* ── 타입 ── */
interface FloatingEl {
  type: 'block' | 'bubble' | 'sparkle' | 'dot' | 'pill' | 'ring' | 'swirl' | 'diamond'
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

/* ── 슬라이드별 고유 장식 데이터 ── */
const slides: Slide[] = [
  {
    badge: '4개 자격증',
    title: '기능사',
    description: '전기기능사, 승강기기능사, 위험물기능사, 가스기능사\n자격증 취득의 첫 걸음, 기초부터 탄탄하게',
    bgColor: '#071a12',
    accentColor: '#34d399',
    personImage: '/hero/woman1.png',
    personAlt: '기능사',
    // 레터블록 + 스월 + 스파클 + 도트
    floats: [
      { type: 'block', letter: 'C', right: '20%', top: '8%', size: 58, rotate: -12, delay: 1000, anim: 'float1' },
      { type: 'block', letter: 'S', right: '22%', top: '45%', size: 50, rotate: 10, delay: 1200, anim: 'float3' },
      { type: 'swirl', right: '18%', top: '58%', size: 55, color: '#34d399', delay: 1100, anim: 'float2' },
      { type: 'sparkle', right: '28%', top: '28%', size: 22, color: '#fbbf24', delay: 1350, anim: 'shimmer' },
      { type: 'sparkle', right: '26%', top: '68%', size: 14, color: '#fbbf24', delay: 1500, anim: 'shimmer' },
      { type: 'dot', right: '24%', top: '20%', size: 10, delay: 1050, anim: 'pulse' },
      { type: 'dot', right: '30%', top: '50%', size: 7, delay: 1400, anim: 'float1' },
      { type: 'dot', right: '16%', top: '75%', size: 5, delay: 1550, anim: 'pulse' },
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
    // 말풍선(머리 우측) + 다이아몬드/링/스파클
    floats: [
      { type: 'bubble', text: '6개 종목\n한번에 준비!', right: '-4%', top: '2%', color: '#a78bfa', delay: 1000, anim: 'wobble' },
      { type: 'diamond', right: '22%', top: '18%', size: 22, color: '#c084fc', delay: 1100, anim: 'float1' },
      { type: 'diamond', right: '24%', top: '55%', size: 16, color: '#a78bfa', rotate: 15, delay: 1350, anim: 'float3' },
      { type: 'ring', right: '20%', top: '35%', size: 44, color: '#a78bfa', delay: 1200, anim: 'float2' },
      { type: 'sparkle', right: '26%', top: '48%', size: 20, color: '#fbbf24', delay: 1250, anim: 'shimmer' },
      { type: 'sparkle', right: '28%', top: '10%', size: 14, color: '#c084fc', delay: 1450, anim: 'shimmer' },
      { type: 'dot', right: '22%', top: '65%', size: 9, delay: 1150, anim: 'pulse' },
      { type: 'dot', right: '30%', top: '75%', size: 6, delay: 1500, anim: 'pulse' },
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
    // 레터블록 + 필 뱃지 + 스파클
    floats: [
      { type: 'block', letter: 'N', right: '20%', top: '5%', size: 56, rotate: -8, delay: 1000, anim: 'float2' },
      { type: 'block', letter: 'o', right: '24%', top: '35%', size: 48, rotate: 14, delay: 1200, anim: 'float1' },
      { type: 'block', letter: '1', right: '18%', top: '58%', size: 44, rotate: -5, delay: 1400, anim: 'float3' },
      { type: 'pill', text: '인기 1위', right: '22%', top: '75%', color: '#4f8cff', delay: 1300, anim: 'float1' },
      { type: 'sparkle', right: '28%', top: '20%', size: 24, color: '#fbbf24', delay: 1100, anim: 'shimmer' },
      { type: 'dot', right: '30%', top: '45%', size: 8, delay: 1150, anim: 'pulse' },
      { type: 'dot', right: '26%', top: '68%', size: 6, delay: 1350, anim: 'float2' },
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
    // 금색 스파클 + 스월 + 링 + 다이아몬드
    floats: [
      { type: 'swirl', right: '18%', top: '5%', size: 65, color: '#fbbf24', delay: 1000, anim: 'float2' },
      { type: 'sparkle', right: '24%', top: '25%', size: 28, color: '#fbbf24', delay: 1100, anim: 'shimmer' },
      { type: 'sparkle', right: '20%', top: '48%', size: 18, color: '#f59e0b', delay: 1250, anim: 'shimmer' },
      { type: 'sparkle', right: '28%', top: '65%', size: 14, color: '#fbbf24', delay: 1400, anim: 'float3' },
      { type: 'diamond', right: '22%', top: '35%', size: 20, color: '#fbbf24', delay: 1150, anim: 'float1' },
      { type: 'ring', right: '20%', top: '55%', size: 36, color: '#f59e0b', delay: 1300, anim: 'float1' },
      { type: 'dot', right: '30%', top: '42%', size: 10, delay: 1200, anim: 'pulse' },
      { type: 'dot', right: '26%', top: '75%', size: 7, delay: 1450, anim: 'pulse' },
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
    // 말풍선(머리 우측) + 레터블록/링/스파클
    floats: [
      { type: 'bubble', text: '공기업 전공시험\n완벽 대비!', right: '-8%', top: '2%', color: '#06b6d4', delay: 1000, anim: 'wobble' },
      { type: 'block', letter: 'K', right: '22%', top: '18%', size: 52, rotate: 8, delay: 1200, anim: 'float2' },
      { type: 'block', letter: 'P', right: '24%', top: '55%', size: 46, rotate: -10, delay: 1400, anim: 'float1' },
      { type: 'ring', right: '20%', top: '38%', size: 32, color: '#22d3ee', delay: 1150, anim: 'float3' },
      { type: 'sparkle', right: '28%', top: '68%', size: 18, color: '#fbbf24', delay: 1300, anim: 'shimmer' },
      { type: 'dot', right: '26%', top: '28%', size: 9, delay: 1100, anim: 'pulse' },
      { type: 'dot', right: '30%', top: '48%', size: 6, delay: 1350, anim: 'float1' },
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
    // 필 뱃지 + 스월 + 다이아몬드 + 스파클
    floats: [
      { type: 'pill', text: 'NCS', right: '20%', top: '8%', color: '#f43f5e', delay: 1000, anim: 'float1' },
      { type: 'pill', text: '실무 역량', right: '22%', top: '55%', color: '#e11d48', delay: 1250, anim: 'float2' },
      { type: 'swirl', right: '18%', top: '32%', size: 50, color: '#fb7185', delay: 1100, anim: 'float3' },
      { type: 'diamond', right: '26%', top: '65%', size: 18, color: '#fb7185', delay: 1350, anim: 'float1' },
      { type: 'sparkle', right: '28%', top: '18%', size: 22, color: '#fbbf24', delay: 1150, anim: 'shimmer' },
      { type: 'sparkle', right: '24%', top: '75%', size: 13, color: '#fb7185', delay: 1450, anim: 'shimmer' },
      { type: 'dot', right: '30%', top: '42%', size: 10, delay: 1200, anim: 'pulse' },
      { type: 'dot', right: '22%', top: '15%', size: 7, delay: 1050, anim: 'float3' },
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
    setTextVisible(false)
    setPrev(current)
    setCurrent(index)
    setTimeout(() => {
      setTextVisible(true)
      setPrev(-1)
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

      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle, ${slide.accentColor}15, transparent 70%)` }} />
        <div className="absolute left-1/4 bottom-0 w-[400px] h-[400px] rounded-full transition-all duration-1000" style={{ background: `radial-gradient(circle, ${slide.accentColor}08, transparent 70%)` }} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-[2] max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="relative flex items-start sm:items-end min-h-[250px] sm:min-h-[360px] lg:min-h-[420px]">

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
                      transitionDelay: isActive ? `${f.delay}ms` : '0ms',
                    }}
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
                            opacity: 0.35,
                          }}
                        />
                      )}

                      {/* 스월 곡선 */}
                      {f.type === 'swirl' && <Swirl color={f.color || slide.accentColor} size={f.size || 60} />}

                      {/* 다이아몬드 */}
                      {f.type === 'diamond' && <Diamond color={f.color || slide.accentColor} size={f.size || 20} />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 텍스트 */}
          <div className="flex-1 z-10 pb-12 sm:pb-24 lg:pb-28 pt-7 sm:pt-6 lg:pt-8">
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
              className="text-2xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 sm:mb-4 leading-[1.1] tracking-tight transition-all ease-out"
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
              className="text-[10.5px] sm:text-base lg:text-lg text-white/50 leading-relaxed whitespace-pre-line max-w-xl transition-all ease-out"
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
              className="mt-4 sm:mt-6 transition-all ease-out"
              style={{
                opacity: textVisible ? 1 : 0,
                transform: textVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionDuration: '667ms',
                transitionDelay: textVisible ? '500ms' : '0ms',
              }}
            >
              <a
                href="#exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: slide.accentColor }}
              >
                자격증 선택
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
                      transitionDelay: isActive ? `${f.delay}ms` : '0ms',
                    }}
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
                    transitionDelay: isActive && textVisible ? '500ms' : '0ms',
                  }}
                >
                  <Image
                    src={s.personImage}
                    alt={s.personAlt}
                    fill
                    className="object-contain object-bottom"
                    sizes="(max-width: 640px) 120px, (max-width: 1024px) 180px, 260px"
                    priority={i <= 1}
                  />
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
                          animationPlayState: paused ? 'paused' : 'running',
                        }}
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
