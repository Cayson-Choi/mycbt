'use client'

import { useState, useEffect } from 'react'

export default function CertifiedBanner() {
  const [stamped, setStamped] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStamped(true), 400)
    return () => clearTimeout(timer)
  }, [])

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
        {/* 텍스트 */}
        <p className={`text-white/90 text-sm md:text-base font-medium tracking-wide transition-opacity duration-500 ${stamped ? 'opacity-100' : 'opacity-0'}`}>
          한국기술사회 기술사들이 인증한 공식사이트입니다.
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
          `}
        >
          {/* 도장 본체 */}
          <div className="w-full h-full rounded-full border-[2.5px] border-red-500 flex items-center justify-center relative">
            <div className="absolute inset-[3px] rounded-full border border-red-500/50" />
            <span className="text-red-500 font-black text-[11px] md:text-sm leading-none tracking-tighter">
              인증
            </span>
          </div>

          {/* 찍힌 순간 번짐 효과 */}
          {stamped && (
            <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping-once" />
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
      `}</style>
    </div>
  )
}
