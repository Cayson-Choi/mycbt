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

/* ── 혜택 데이터 ── */
const benefits = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <defs><linearGradient id="pb1" x1="8" y1="8" x2="40" y2="40"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#f59e0b" /></linearGradient></defs>
        <circle cx="24" cy="24" r="20" fill="url(#pb1)" opacity="0.15" />
        <path d="M24 10l3.5 7 7.5 1-5.5 5.3 1.3 7.7L24 27.5 17.2 31l1.3-7.7L13 18l7.5-1L24 10z" fill="url(#pb1)" />
      </svg>
    ),
    title: '전문가 검증 문제은행',
    desc: '기술사들이 한 문제씩 직접 검증한 12,000+ 문제. 오류 없는 정확한 문제로 실력을 쌓으세요.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <defs><linearGradient id="pb2" x1="8" y1="8" x2="40" y2="40"><stop offset="0%" stopColor="#818cf8" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
        <circle cx="24" cy="24" r="20" fill="url(#pb2)" opacity="0.15" />
        <rect x="14" y="14" width="20" height="20" rx="4" stroke="url(#pb2)" strokeWidth="2.5" fill="none" />
        <path d="M19 24l3 3 7-7" stroke="url(#pb2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI 실시간 약점 분석',
    desc: '과목별 정답률을 분석하고, 취약 파트를 집중 추천. 합격까지 최단 경로를 안내합니다.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <defs><linearGradient id="pb3" x1="8" y1="8" x2="40" y2="40"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient></defs>
        <circle cx="24" cy="24" r="20" fill="url(#pb3)" opacity="0.15" />
        <path d="M16 28c0-6 3.6-10 8-10s8 4 8 10" stroke="url(#pb3)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="24" cy="15" r="4" stroke="url(#pb3)" strokeWidth="2.5" fill="none" />
        <path d="M32 32c0-2 1.5-4 4-4" stroke="url(#pb3)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="36" cy="25" r="3" stroke="url(#pb3)" strokeWidth="2" fill="none" />
      </svg>
    ),
    title: '1:1 멘토링 매칭',
    desc: '현직 기술사 멘토와 1:1 질의응답. 막히는 문제도 전문가에게 직접 물어보세요.',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <defs><linearGradient id="pb4" x1="8" y1="8" x2="40" y2="40"><stop offset="0%" stopColor="#f472b6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
        <circle cx="24" cy="24" r="20" fill="url(#pb4)" opacity="0.15" />
        <rect x="13" y="18" width="22" height="16" rx="2" stroke="url(#pb4)" strokeWidth="2.5" fill="none" />
        <path d="M13 22l11 7 11-7" stroke="url(#pb4)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: '합격 후 취업처 연계',
    desc: '자격증 취득 즉시 파트너 기업에 이력서 추천. 전기 분야 채용 연계율 92%를 자랑합니다.',
  },
]

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
      <div className="relative bg-black pt-20 pb-10 md:pt-28 md:pb-14">
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
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-amber-400 text-sm font-semibold tracking-wide">PREMIUM MEMBERSHIP</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4" style={{ fontFamily: "var(--font-serif-kr), Georgia, serif" }}>
                <span className="block">프리미엄 회원만의</span>
                <span className="block mt-3 md:mt-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">특별한 혜택</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                단순한 문제풀이를 넘어, 합격부터 취업까지 원스톱으로 지원합니다
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
                <div key={i} className="text-center py-6 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-2xl md:text-3xl font-black text-white mb-1">
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
      <div className="relative bg-gradient-to-b from-black via-gray-800/85 to-black pt-10 pb-20 md:pt-14 md:pb-28">

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* 왼쪽: 텍스트 */}
            <Reveal>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-semibold">취업 연계 프로그램</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight" style={{ fontFamily: "var(--font-serif-kr), Georgia, serif" }}>
                  자격증 취득부터 <span className="relative inline-block text-amber-400">취업<span className="absolute -top-5 md:-top-7 left-0 w-full flex justify-around pointer-events-none"><span className="text-[8px] md:text-[10px]">●</span><span className="text-[8px] md:text-[10px]">●</span></span></span>까지<br />
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">모두 책임져</span> 드립니다
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  CAYSON은 전국 350개+ 전기 관련 기업과 파트너십을 맺고 있습니다.
                  자격증을 취득하는 순간, 여러분의 이력서가 파트너 기업 인사담당자에게
                  직접 전달됩니다. 더 이상 혼자 취업 준비하지 마세요.
                </p>

                {/* 프로세스 */}
                <div className="space-y-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <span className="text-white/30 text-xs">전국 다양한 분야의 전기 관련 기업과 제휴</span>
                  </div>
              </div>
            </Reveal>
          </div>

          {/* CTA */}
          <Reveal delay={300}>
            <div className="mt-16 md:mt-20 text-center">
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
