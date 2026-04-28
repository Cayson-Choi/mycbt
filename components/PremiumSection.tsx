'use client'

import { useState, useEffect, useRef } from 'react'

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

/* ── 카운트업 애니메이션 ── */
function CountUp({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); ob.unobserve(el) } }, { threshold: 0.5 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(interval) }
      else setCount(Math.floor(current))
    }, duration / steps)
    return () => clearInterval(interval)
  }, [started, target, duration])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

/* ── 취업 연계 분야 ── */
const fields = [
  { name: '공기업 · 공공기관', count: '50+', color: 'blue' },
  { name: '건설 · 플랜트', count: '80+', color: 'purple' },
  { name: '전기설비 · 시공', count: '90+', color: 'emerald' },
  { name: '에너지 · 발전', count: '40+', color: 'amber' },
  { name: '제조 · 반도체', count: '50+', color: 'pink' },
  { name: '소방 · 안전관리', count: '40+', color: 'red' },
]

export default function PremiumSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ───── 상단: 프리미엄 혜택 ───── */}
      <div className="relative bg-[#0d1a2e] pt-12 pb-8 md:pt-16 md:pb-10">
        {/* 배경 장식 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* 헤더 */}
          <Reveal>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-amber-400 text-sm font-semibold tracking-wide">PREMIUM MEMBERSHIP</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 tracking-wider" style={{ lineHeight: 1.1 }}>
                <span className="block">프리미엄 회원만의</span>
                <span className="block mt-2 md:mt-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">특별한 혜택</span>
              </h2>
              <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
                합격부터 취업까지 원스톱으로 지원합니다
              </p>
            </div>
          </Reveal>

          {/* 숫자 통계 */}
          <Reveal delay={200}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { value: 95, suffix: '%', label: '자격증 취득률' },
                { value: 93, suffix: '%', label: '취업 연계율' },
                { value: 350, suffix: '+', label: '제휴 기업 수' },
                { value: 98, suffix: '%', label: '프리미엄회원 만족도' },
              ].map((stat, i) => (
                <div key={i} className="text-center py-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-2xl md:text-3xl font-black text-amber-400 mb-1">
                    <CountUp target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ───── 하단: 취업 연계 ───── */}
      <div className="relative bg-gradient-to-b from-[#0d1a2e] via-[#1B2A4A] to-[#0d1a2e] pt-8 pb-12 md:pt-10 md:pb-16">

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* 왼쪽: 텍스트 */}
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-semibold">취업 연계 프로그램</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-wider" style={{ lineHeight: 1.1 }}>
                  자격증 취득부터 <span className="relative inline-block text-amber-400">취업<span className="absolute -top-5 md:-top-7 left-0 w-full flex justify-around pointer-events-none"><span className="text-[8px] md:text-[10px]">●</span><span className="text-[8px] md:text-[10px]">●</span></span></span>까지<br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">모두 책임져</span> 드립니다
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  <span className="text-amber-400 font-bold">CAYSON</span>은 전국 350개+ 전기 관련 기업과 파트너십을 맺고 있습니다.
                  자격증을 취득하는 순간, 여러분의 이력서가 파트너 기업 인사담당자에게
                  직접 전달됩니다. 더 이상 혼자 취업 준비하지 마세요.
                </p>

                {/* 프로세스 */}
                <div className="space-y-3">
                  {[
                    { step: '01', title: '자격증 취득', desc: 'CAYSON으로 학습하고 시험에 합격하세요' },
                    { step: '02', title: '이력서 등록', desc: '간단한 이력 정보를 입력하면 끝' },
                    { step: '03', title: '기업 매칭', desc: 'AI가 적합한 기업을 매칭하여 추천' },
                    { step: '04', title: '면접 & 취업', desc: '파트너 기업에서 우선 면접 기회 제공' },
                  ].map((item, i) => (
                    <Reveal key={i} delay={i * 80}>
                      <div className="flex items-start gap-4 group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{item.title}</h4>
                          <p className="text-gray-500 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* 오른쪽: 취업 연계 분야 */}
            <Reveal delay={200}>
              <div>
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white/80 font-semibold text-sm tracking-widest uppercase">취업 연계 분야</h3>
                    <span className="text-amber-400/80 text-sm font-semibold">350+ 기업</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {fields.map((f, i) => (
                      <div key={i}
                        className="px-5 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15] transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-8 rounded-full bg-amber-400/60 group-hover:bg-amber-400 transition-colors" />
                          <div>
                            <div className="text-white text-sm font-bold">{f.name}</div>
                            <div className="text-white/40 text-xs">{f.count} 기업</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 text-center">
                    <span className="text-white/30 text-xs">전국 다양한 분야의 기업과 파트너쉽 체결</span>
                  </div>
              </div>
            </Reveal>
          </div>

          {/* CTA */}
          <Reveal delay={300}>
            <div className="mt-10 md:mt-12 text-center">
              <button className="group relative px-8 py-4 rounded-xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600 background-animate" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent shimmer-animate" />
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative text-gray-900 flex items-center gap-2">
                    프리미엄 시작하기
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                </button>
            </div>
          </Reveal>
        </div>
      </div>

      <style jsx>{`
        @keyframes background-animate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .background-animate {
          background-size: 200% auto;
          animation: background-animate 2.5s ease infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-animate {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}
