'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { CountUp } from './ScrollReveal'

/* ── 스크롤 등장 ── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); ob.unobserve(el) } }, { threshold: 0.1 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [delay])
  return <div ref={ref} className={`transition-all duration-700 ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>{children}</div>
}

export default function PremiumSection() {
  return (
    <section className="relative overflow-hidden bg-[#050c18] py-8 md:py-12">
      {/* 배경 텍스처 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 도트 그리드 */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
        {/* 상단 셰엔 라인 */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.7) 50%, rgba(251,191,36,0.35) 100%)'
        }} />
        {/* 거친 필름 그레인 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.45]" preserveAspectRatio="none">
          <filter id="grain-coarse">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-coarse)" />
        </svg>
        {/* 미세 노이즈 */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.35] mix-blend-screen" preserveAspectRatio="none">
          <filter id="grain-fine">
            <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-fine)" />
        </svg>
        {/* 가로 스캔라인 */}
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)'
        }} />
        {/* 사선 패브릭 결 */}
        <div className="absolute inset-0 opacity-[0.08]" style={{
          backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)'
        }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* 헤더 */}
        <Reveal>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-2.5">
              <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-amber-400 text-xs font-semibold tracking-wide">PREMIUM MEMBERSHIP</span>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-white mb-2 tracking-wider" style={{ lineHeight: 1.1 }}>
              <span className="block">프리미엄 회원만의</span>
              <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">특별한 혜택</span>
            </h2>
            <p className="text-white text-2xl md:text-3xl lg:text-4xl max-w-3xl mx-auto font-semibold tracking-tight mt-3 md:mt-4" style={{ lineHeight: 1.3 }}>
              합격을 넘어 <span className="text-amber-400" style={{ fontFamily: "'Nanum Pen Script', cursive", fontSize: '2em', letterSpacing: '0.04em', verticalAlign: '-0.15em' }}><span className="stamp-char stamp-char-1">취</span><span className="stamp-char stamp-char-2">업</span></span>까지 <span className="text-white/40">—</span> 끝까지 책임집니다
            </p>
          </div>
        </Reveal>

        {/* KPI 스트립 */}
        <Reveal delay={150}>
          <div className="grid grid-cols-3 divide-x divide-white/[0.08] mt-6 md:mt-8 py-4 md:py-5 border-y border-white/[0.08]">
            {[
              { k: '취업 연계 기업', target: 350, suffix: '+', sub: '전국 전기 관련 기업' },
              { k: '연 매칭 건수', target: 1200, suffix: '+', sub: '회원 → 기업 추천' },
              { k: '평균 입사까지', target: 43, suffix: '일', sub: '합격 이후 매칭 소요' },
            ].map((m, i) => (
              <div key={i} className="px-4 sm:px-8 text-center">
                <div className="inline-flex items-center gap-1.5 mb-2 sm:mb-3">
                  <span className="block w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-white text-[13px] sm:text-sm md:text-[15px] font-semibold tracking-tight">{m.k}</span>
                </div>
                <div className="flex items-baseline justify-center gap-1">
                  <CountUp
                    target={m.target}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums"
                  />
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{m.suffix}</span>
                </div>
                <div className="text-white/75 text-[11px] sm:text-xs mt-1 hidden sm:block">{m.sub}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal delay={300}>
          <div className="mt-5 md:mt-6 flex flex-col items-center gap-2">
            <Link
              href="/premium"
              className="group relative isolate inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-[#0a1426] text-sm md:text-base font-bold tracking-tight transition-colors whitespace-nowrap shadow-lg shadow-amber-500/20 overflow-hidden"
            >
              {/* 내부 출렁이는 빛 (slosh) — 3개 레이어가 서로 다른 속도로 흐름 */}
              <span aria-hidden className="cta-slosh-a pointer-events-none absolute -inset-2 rounded-full mix-blend-screen opacity-70" />
              <span aria-hidden className="cta-slosh-b pointer-events-none absolute -inset-2 rounded-full mix-blend-screen opacity-60" />
              <span aria-hidden className="cta-slosh-c pointer-events-none absolute -inset-2 rounded-full mix-blend-screen opacity-50" />
              <span className="relative z-10">프리미엄 시작하기</span>
              <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
            <p className="text-white/55 text-xs md:text-sm">매칭 단계 · 채용 분야 · 합격 이후 지원 내역 자세히 보기</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
