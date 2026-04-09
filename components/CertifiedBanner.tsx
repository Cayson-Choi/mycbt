'use client'

import { useState, useEffect, useMemo } from 'react'

const TEXT = '한국건축전기설비기술사회와 한국기계설비기술사회가 인증한 공식사이트입니다.'
const CHARS = TEXT.split('')
// 강조할 글자 인덱스 (단체명)
const HIGHLIGHT_RANGES: [number, number][] = [[0, 11], [14, 23]]
function isHighlighted(i: number) { return HIGHLIGHT_RANGES.some(([s, e]) => i >= s && i <= e) }
const CHAR_DELAY = 80        // 글자 간 딜레이 (ms)
const CHAR_DURATION = 400    // 글자 애니메이션 지속 시간
const STAMP_DELAY = CHARS.length * CHAR_DELAY  // 도장 시작 시점
const STAMP_DURATION = 600   // 도장 떨림 지속
const CYCLE = STAMP_DELAY + STAMP_DURATION + 800  // 전체 1사이클 + 쉬는 시간

export default function CertifiedBanner() {
  const [stamped, setStamped] = useState(false)
  const [loopTick, setLoopTick] = useState(0)
  const [loopTime, setLoopTime] = useState(0)

  // 1) 초기 도장 쿵 효과
  useEffect(() => {
    const timer = setTimeout(() => setStamped(true), 400)
    return () => clearTimeout(timer)
  }, [])

  // 2) 루프 시작 (초기 효과 끝난 후 1.5초 뒤)
  useEffect(() => {
    if (!stamped) return
    const startDelay = setTimeout(() => {
      setLoopTick(1)
    }, 1500)
    return () => clearTimeout(startDelay)
  }, [stamped])

  // 3) 루프 타이머
  useEffect(() => {
    if (loopTick === 0) return
    const start = Date.now()
    let raf: number

    const tick = () => {
      const elapsed = (Date.now() - start) % CYCLE
      setLoopTime(elapsed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [loopTick])

  // 도장 떨림 활성화 여부
  const isStampShaking = loopTick > 0 && loopTime >= STAMP_DELAY && loopTime < STAMP_DELAY + STAMP_DURATION

  return (
    <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-3 overflow-hidden">
      {/* 배경 미세 패턴 */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative flex items-center justify-center gap-3">
        {/* 텍스트 — 글자별 웨이브 */}
        <p className={`text-white/90 text-sm md:text-base font-medium tracking-[0.08em] transition-opacity duration-500 ${stamped ? 'opacity-100' : 'opacity-0'}`}>
          {CHARS.map((char, i) => (
            <WaveChar key={i} char={char} index={i} loopTime={loopTime} active={loopTick > 0} highlight={isHighlighted(i)} />
          ))}
        </p>

        {/* 도장 */}
        <div
          className={`
            relative flex-shrink-0 w-10 h-10 md:w-12 md:h-12
            transition-all duration-300 ease-out
            ${stamped
              ? 'scale-100 opacity-100 rotate-[-8deg]'
              : 'scale-[3] opacity-0 rotate-[20deg]'
            }
            ${isStampShaking ? 'animate-stamp-shake' : ''}
          `}
        >
          {/* 도장 본체 */}
          <div className="w-full h-full rounded-full border-[2.5px] border-red-500 flex items-center justify-center relative">
            <div className="absolute inset-[3px] rounded-full border border-red-500/50" />
            <span className="text-red-500 font-black text-[11px] md:text-sm leading-none tracking-tighter">
              인증
            </span>
          </div>

          {/* 초기 찍힌 순간 번짐 효과 */}
          {stamped && !loopTick && (
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping-once" />
          )}

          {/* 루프 중 도장 떨림 시 빛나는 효과 */}
          {isStampShaking && (
            <div className="absolute inset-[-4px] rounded-full bg-red-500/20 animate-pulse-glow" />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes ping-once {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping-once {
          animation: ping-once 0.6s ease-out forwards;
        }
        @keyframes stamp-shake {
          0%, 100% { transform: rotate(-8deg) translateX(0); }
          10% { transform: rotate(-6deg) translateX(-2px); }
          20% { transform: rotate(-10deg) translateX(2px); }
          30% { transform: rotate(-7deg) translateX(-1.5px); }
          40% { transform: rotate(-9deg) translateX(1.5px); }
          50% { transform: rotate(-8deg) translateX(-1px); }
          60% { transform: rotate(-8deg) translateX(1px); }
          70% { transform: rotate(-8.5deg) translateX(-0.5px); }
          80% { transform: rotate(-7.5deg) translateX(0.5px); }
          90% { transform: rotate(-8deg) translateX(0); }
        }
        .animate-stamp-shake {
          animation: stamp-shake 0.6s ease-in-out;
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 0.6s ease-in-out;
        }
      `}</style>
    </div>
  )
}

/* 개별 글자 웨이브 컴포넌트 */
function WaveChar({ char, index, loopTime, active, highlight }: {
  char: string
  index: number
  loopTime: number
  active: boolean
  highlight: boolean
}) {
  const baseStyle: React.CSSProperties = highlight
    ? { display: 'inline-block', fontSize: '1.15em', fontWeight: 700, color: '#fdba74' }
    : { display: 'inline-block', color: 'rgba(255,255,255,0.9)' }

  const style = useMemo(() => {
    if (!active) return baseStyle

    const charStart = index * CHAR_DELAY
    const elapsed = loopTime - charStart

    if (elapsed < 0 || elapsed > CHAR_DURATION) {
      return { ...baseStyle, transform: 'scale(1) translateY(0)' }
    }

    const progress = elapsed / CHAR_DURATION
    const ease = Math.sin(progress * Math.PI)
    const scale = 1 + ease * 0.35
    const translateY = -ease * 3

    if (highlight) {
      // 오렌지 → 밝은 오렌지 + 글로우
      const r = 251, g = 146 + ease * 60, b = 60 + ease * 40
      return {
        ...baseStyle,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        color: `rgb(${r},${Math.min(g, 220)},${Math.min(b, 120)})`,
        textShadow: ease > 0.2 ? `0 0 ${ease * 10}px rgba(251,146,60,${ease * 0.5})` : 'none',
      }
    }

    const brightness = 0.9 + ease * 0.1
    return {
      ...baseStyle,
      transform: `scale(${scale}) translateY(${translateY}px)`,
      color: `rgba(255,255,255,${brightness})`,
      textShadow: ease > 0.2 ? `0 0 ${ease * 8}px rgba(255,255,255,${ease * 0.4})` : 'none',
    }
  }, [active, index, loopTime, highlight])

  if (char === ' ') return <span>&nbsp;</span>

  return <span style={style}>{char}</span>
}
