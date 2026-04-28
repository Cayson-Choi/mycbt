'use client'

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

/* ── 채용 연계 분야 (수치는 350개 기준 분포) ── */
type Field = { name: string; count: number; share: number }

const fields: Field[] = [
  { name: '전기설비 · 시공',   count: 90, share: 26 },
  { name: '건설 · 플랜트',     count: 80, share: 23 },
  { name: '공기업 · 공공기관', count: 50, share: 14 },
  { name: '제조 · 산업설비',   count: 50, share: 14 },
  { name: '에너지 · 발전',     count: 40, share: 11 },
  { name: '소방 · 안전관리',   count: 40, share: 12 },
]

export default function PremiumSection() {
  return (
    <section className="relative overflow-hidden">
      {/* ───── 상단: 프리미엄 혜택 ───── */}
      <div className="relative bg-[#050c18] pt-8 pb-2 md:pt-10 md:pb-3">
        {/* 배경 레이어 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 도트 그리드 */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
          {/* 상단 셰엔 라인 */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.35) 50%, transparent 100%)'
          }} />
          {/* 거친 필름 그레인(베이스) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.45]" preserveAspectRatio="none">
            <filter id="grain-top-coarse">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-top-coarse)" />
          </svg>
          {/* 미세 노이즈(디테일) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.35] mix-blend-screen" preserveAspectRatio="none">
            <filter id="grain-top-fine">
              <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-top-fine)" />
          </svg>
          {/* 가로 스캔라인 */}
          <div className="absolute inset-0 opacity-[0.12] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)'
          }} />
          {/* 사선 패브릭 결 */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* 헤더 */}
          <Reveal>
            <div className="text-center mb-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-amber-400 text-xs font-semibold tracking-wide">PREMIUM MEMBERSHIP</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-2 tracking-wider" style={{ lineHeight: 1.1 }}>
                <span className="block">프리미엄 회원만의</span>
                <span className="block mt-1 md:mt-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">특별한 혜택</span>
              </h2>
              <p className="text-white/80 text-sm md:text-base max-w-2xl mx-auto font-medium">
                합격부터 취업까지 원스톱으로 지원합니다
              </p>
            </div>
          </Reveal>

        </div>
      </div>

      {/* ───── 하단: 채용 연계 ───── */}
      <div className="relative bg-[#02060f] pt-8 pb-10 md:pt-12 md:pb-14">
        {/* 디바이더 중앙 포인트 (overflow-hidden 밖에 두어 잘리지 않도록) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-amber-400 z-10 pointer-events-none" />
        {/* 배경 레이어 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* 상단 디바이더 셰엔 (양 끝까지 보이도록) */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, rgba(251,191,36,0.35) 0%, rgba(251,191,36,0.7) 50%, rgba(251,191,36,0.35) 100%)'
          }} />
          {/* 크로스 그리드 */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
            backgroundSize: '80px 80px'
          }} />
          {/* 거친 필름 그레인(베이스) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.45]" preserveAspectRatio="none">
            <filter id="grain-bottom-coarse">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-bottom-coarse)" />
          </svg>
          {/* 미세 노이즈(디테일) */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.30] mix-blend-screen" preserveAspectRatio="none">
            <filter id="grain-bottom-fine">
              <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain-bottom-fine)" />
          </svg>
          {/* 가로 스캔라인 */}
          <div className="absolute inset-0 opacity-[0.10] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)'
          }} />
          {/* 사선 패브릭 결 */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 4px)'
          }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* 섹션 헤더 — 에디토리얼 풍 */}
          <Reveal>
            <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-end pb-6 md:pb-8">
              <div className="md:col-span-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className="block w-8 h-px bg-amber-400/70" />
                  <span className="text-amber-400/80 text-[11px] font-semibold tracking-[0.25em] uppercase">Career Placement</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-[36px] font-bold text-white tracking-tight" style={{ lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  합격, 그 다음을<br />
                  <span className="text-amber-400">CAYSON이 책임</span>집니다.
                </h2>
              </div>
              <div className="md:col-span-5">
                <p className="text-white/80 text-[15px] md:text-[16px] font-medium tracking-tight" style={{ lineHeight: 1.7 }}>
                  전국 전기·플랜트·에너지 분야 협력 기업과 채용 네트워크를 운영합니다.<br />
                  합격과 동시에 이력서가 인사담당자에게 직접 전달됩니다.
                </p>
              </div>
            </div>
          </Reveal>

          {/* 핵심 지표 스트립 */}
          <Reveal delay={100}>
            <div className="grid grid-cols-3 py-5 md:py-6">
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

          {/* 본문 2열 — 진행 단계 / 분야 분포 */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 pt-12 md:pt-16">

            {/* 좌: 진행 단계 (수직 타임라인) */}
            <Reveal delay={150}>
              <div>
                <div className="flex items-baseline justify-between mb-7">
                  <h3 className="text-white text-[15px] font-semibold tracking-tight">매칭이 진행되는 4단계</h3>
                </div>

                <ol className="relative">
                  {[
                    { num: 1, title: '자격증 취득', desc: 'CAYSON에서 학습하고 정기 시험에 합격합니다.' },
                    { num: 2, title: '이력서 등록', desc: '학력·경력·희망 지역을 입력하면 매칭 풀에 자동 등록됩니다.' },
                    { num: 3, title: '기업 매칭', desc: '경력 요건과 직무 적합도 기반으로 협력 기업을 추천받습니다.' },
                    { num: 4, title: '면접 · 채용', desc: '협력 기업 인사담당자에게 우선 면접 기회가 제공됩니다.' },
                  ].map((s, i, arr) => (
                    <li key={i} className="relative pl-12 pb-7 last:pb-0">
                      {i < arr.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/40" />
                      )}
                      <div className="absolute left-0 top-0 flex items-center justify-center w-[32px] h-[32px] rounded-full bg-amber-400">
                        <span className="text-[#0a1426] text-[14px] font-bold tabular-nums">{s.num}</span>
                      </div>
                      <h4 className="text-white text-[15px] font-semibold tracking-tight mb-1.5">{s.title}</h4>
                      <p className="text-white/75 text-[13px] leading-relaxed">{s.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            {/* 우: 분야 분포 (가로 막대) */}
            <Reveal delay={200}>
              <div>
                <div className="flex items-baseline justify-between mb-7">
                  <h3 className="text-white text-[15px] font-semibold tracking-tight">채용 연계 분야</h3>
                  <span className="text-white/35 text-[11px] tracking-wider">단위: 협력 기업 수</span>
                </div>

                <div className="space-y-4">
                  {fields.map((f, i) => (
                    <div key={i} className="group">
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-white/85 text-[13px] sm:text-sm font-medium tracking-tight">{f.name}</span>
                        <span className="text-white/55 text-[12px] sm:text-[13px] tabular-nums font-medium">
                          <span className="text-white">{f.count}</span>
                          <span className="text-white/30 ml-1.5">·</span>
                          <span className="text-white/35 ml-1.5">{f.share}%</span>
                        </span>
                      </div>
                      <div className="relative h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(f.count / 90) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-7 text-white/75 text-[12px] sm:text-[13px] leading-relaxed border-l-2 border-amber-400/60 pl-3">
                  CAYSON 채용 네트워크는 전기설비·시공 비중이 가장 높으며, 공기업·민간 산업이 균형 있게 분포되어 있습니다.
                </p>
              </div>
            </Reveal>
          </div>

          {/* CTA — 절제된 라인 버튼 */}
          <Reveal delay={300}>
            <div className="mt-6 md:mt-8 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div>
                <div className="text-white text-lg sm:text-xl font-semibold tracking-tight mb-1">프리미엄 멤버십에서 모든 혜택을 만나보세요.</div>
                <div className="text-white/70 text-sm">합격 이후의 다음 단계까지 원스톱으로 지원합니다.</div>
              </div>
              <button className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-amber-400 hover:bg-amber-300 text-[#0a1426] text-sm font-bold tracking-tight transition-colors whitespace-nowrap">
                프리미엄 시작하기
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </Reveal>
        </div>
      </div>

    </section>
  )
}
