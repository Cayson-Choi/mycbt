'use client'

import Link from 'next/link'
import { useState, useEffect, useRef, Fragment } from 'react'

/* ─────────────────────────────────────────────────────────
 * 프리미엄 멤버십 — 럭셔리 매거진 톤
 * ───────────────────────────────────────────────────────── */

const C = {
  bg: '#0a0908',
  bgAlt: '#0f0e0c',
  bgCard: '#13110e',
  gold: '#c9a96b',
  goldLight: '#e3c98a',
  goldDark: '#8c7444',
  goldHair: 'rgba(201, 169, 107, 0.22)',
  goldFaint: 'rgba(201, 169, 107, 0.08)',
  ivory: '#f4ede0',
  ivoryMute: 'rgba(244, 237, 224, 0.65)',
  ivoryDim: 'rgba(244, 237, 224, 0.42)',
  ivoryFaint: 'rgba(244, 237, 224, 0.18)',
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); ob.unobserve(el) } },
      { threshold: 0.1 }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [delay])
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
    >
      {children}
    </div>
  )
}

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`flex items-center gap-3 mb-6 ${center ? 'justify-center' : ''}`}>
      <span className="block w-10 h-px" style={{ background: C.gold }} />
      <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.4em] uppercase" style={{ color: C.gold }}>
        {children}
      </span>
      {center && <span className="block w-10 h-px" style={{ background: C.gold }} />}
    </div>
  )
}

function GoldOrnament({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 12" className={className} aria-hidden>
      <line x1="0" y1="6" x2="22" y2="6" stroke={C.gold} strokeWidth="0.5" />
      <circle cx="30" cy="6" r="2.5" fill="none" stroke={C.gold} strokeWidth="0.6" />
      <circle cx="30" cy="6" r="0.8" fill={C.gold} />
      <line x1="38" y1="6" x2="60" y2="6" stroke={C.gold} strokeWidth="0.5" />
    </svg>
  )
}

/* ─── Tier 데이터 ─── */
type Tier = { key: string; name: string; en: string; color: string; recommended?: boolean }
const TIERS: readonly Tier[] = [
  { key: 'FREE',    name: '무료',     en: 'Free',    color: '#9c9c9c' },
  { key: 'BRONZE',  name: '브론즈',   en: 'Bronze',  color: '#c98a5e' },
  { key: 'SILVER',  name: '실버',     en: 'Silver',  color: '#cfd2d6' },
  { key: 'GOLD',    name: '골드',     en: 'Gold',    color: '#e6c266' },
  { key: 'PREMIUM', name: '프리미엄', en: 'Premium', color: C.gold, recommended: true },
]

/* values 인덱스: [FREE, BRONZE, SILVER, GOLD, PREMIUM]
 * '○' = 포함, '×' = 미포함, 문자열 = 세부 내용
 */
const TIER_GROUPS: { category: string; rows: { label: string; values: string[] }[] }[] = [
  {
    category: '시험',
    rows: [
      { label: '응시 가능 시험',   values: ['무료 시험', '기능사', '+ 산업기사', '+ 기사', '전 등급 + 공식시험'] },
      { label: '응시 횟수',         values: ['일 3회',    '무제한', '무제한',     '무제한', '무제한'] },
      { label: '공식시험 참여',     values: ['×',         '×',     '×',          '○',     '○ + 우선'] },
    ],
  },
  {
    category: '학습',
    rows: [
      { label: '동영상 강의',      values: ['무료 일부',  '기능사 강의', '+ 산업기사', '+ 기사', '전체 공개'] },
      { label: 'AI 자동 채점',     values: ['×',          '기본',       '기본',       '상세',   '상세 + 피드백'] },
      { label: '오답노트 분석',    values: ['기본',       '기본',       '취약 분석',  '취약 분석', 'AI 학습 추천'] },
      { label: '학습 메모',        values: ['기본',       '기본',       '기본',       '기본',   '무제한'] },
    ],
  },
  {
    category: '커리어 · 지원',
    rows: [
      { label: '합격 멘토링',      values: ['×',  '×',  '×',  '제한적', '1:1 멘토링'] },
      { label: '취업 연계 매칭',   values: ['×',  '×',  '×',  '×',     '350+ 협력 기업'] },
      { label: '전용 고객지원',    values: ['일반', '일반', '일반', '우선', '24h 전용 채널'] },
    ],
  },
]

const placement = [
  { num: '01', title: '자격증 취득',  desc: 'CAYSON에서 학습하고 정기 시험에 합격합니다.' },
  { num: '02', title: '이력서 등록',  desc: '학력 · 경력 · 희망 지역을 입력해 매칭 풀에 등록합니다.' },
  { num: '03', title: '기업 매칭',    desc: '직무 적합도 기반으로 협력 기업을 추천받습니다.' },
  { num: '04', title: '면접 · 채용',  desc: '인사담당자에게 우선 면접 기회가 제공됩니다.' },
]

const fields: { name: string; count: number; share: number }[] = [
  { name: '전기설비 · 시공',   count: 90, share: 26 },
  { name: '건설 · 플랜트',     count: 80, share: 23 },
  { name: '공기업 · 공공기관', count: 50, share: 14 },
  { name: '제조 · 산업설비',   count: 50, share: 14 },
  { name: '에너지 · 발전',     count: 40, share: 11 },
  { name: '소방 · 안전관리',   count: 40, share: 12 },
]

/* ─── 셀 렌더링: ○/× 표시는 아이콘으로 ─── */
function TierCell({ value, isPremium }: { value: string; isPremium: boolean }) {
  if (value === '○') {
    return (
      <svg className="w-4 h-4 mx-auto" viewBox="0 0 16 16" fill="none" aria-label="포함">
        <circle cx="8" cy="8" r="6" stroke={isPremium ? C.gold : C.ivoryMute} strokeWidth="1.2" />
      </svg>
    )
  }
  if (value === '×') {
    return (
      <svg className="w-3.5 h-3.5 mx-auto" viewBox="0 0 16 16" fill="none" aria-label="미포함">
        <line x1="3" y1="3" x2="13" y2="13" stroke={C.ivoryFaint} strokeWidth="1.2" />
        <line x1="13" y1="3" x2="3" y2="13" stroke={C.ivoryFaint} strokeWidth="1.2" />
      </svg>
    )
  }
  return (
    <span
      className={`text-[12px] md:text-[13px] tracking-tight ${isPremium ? 'font-semibold' : ''}`}
      style={{ color: isPremium ? C.ivory : C.ivoryMute }}
    >
      {value}
    </span>
  )
}

export default function PremiumDetailContent() {
  return (
    <div className="relative" style={{ background: C.bg, color: C.ivory }}>
      {/* 페이지 골드 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(closest-side, rgba(201,169,107,0.55), transparent 70%)' }} />
        <div className="absolute top-[55%] right-0 w-[700px] h-[700px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(closest-side, rgba(201,169,107,0.6), transparent 70%)' }} />
      </div>

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-14 md:pt-20 pb-6 md:pb-8 text-center">
          <Reveal>
            <Eyebrow center>Membership — Vol. I</Eyebrow>
          </Reveal>

          <Reveal delay={150}>
            <h1
              className="font-serif font-light tracking-tight"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)', lineHeight: 1.05, letterSpacing: '-0.01em' }}
            >
              <span className="block">합격은 시작.</span>
              <span className="block italic mt-1.5" style={{ color: C.gold, fontWeight: 300 }}>
                그 다음을 함께합니다.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex items-center justify-center gap-4 mt-7 mb-5">
              <GoldOrnament className="w-[60px] h-3" />
            </div>
            <p
              className="max-w-xl mx-auto text-[14px] md:text-[16px]"
              style={{ color: C.ivoryMute, lineHeight: 1.7, letterSpacing: '-0.005em' }}
            >
              CAYSON 멤버십은 5단계로 성장합니다. 무료부터 프리미엄까지 — 학습 · 시험 · 채용까지의 길을 등급에 따라 단계적으로 열어갑니다.
            </p>
          </Reveal>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.goldHair}, transparent)` }} />
        </div>
      </section>

      {/* ═══════════════ 2. 5-TIER 비교표 ═══════════════ */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 md:py-14">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-7 md:mb-9">
              <Eyebrow center>Five Tiers</Eyebrow>
              <h2
                className="font-serif font-light tracking-tight"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 3rem)', lineHeight: 1.15 }}
              >
                다섯 등급, <span className="italic" style={{ color: C.gold }}>각자의 권리.</span>
              </h2>
              <p className="mt-4 text-[13px] md:text-[14px]" style={{ color: C.ivoryMute, lineHeight: 1.65 }}>
                무료 회원부터 프리미엄까지, 각 등급에 부여된 권한을 한눈에 비교하세요.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="overflow-x-auto -mx-6 lg:mx-0">
              <div className="min-w-[860px] px-6 lg:px-0">
                <div className="relative">
                  {/* PREMIUM 컬럼 강조 프레임 (카드 느낌) */}
                  <div
                    aria-hidden
                    className="absolute pointer-events-none rounded-sm"
                    style={{
                      top: '0',
                      right: '0',
                      bottom: '8px',
                      width: 'calc((100% - 180px) / 5)',
                      border: `1.5px solid ${C.gold}`,
                      background: `linear-gradient(180deg, ${C.bgCard} 0%, transparent 100%)`,
                      boxShadow: `0 0 50px rgba(201,169,107,0.30), 0 8px 32px rgba(0,0,0,0.4), inset 0 0 30px rgba(201,169,107,0.06)`,
                      zIndex: 0,
                    }}
                  />
                  {/* RECOMMENDED 우상단 코너 탭 */}
                  <div
                    aria-hidden
                    className="absolute px-3 py-1.5 text-[10px] tracking-[0.3em] uppercase font-semibold whitespace-nowrap"
                    style={{
                      top: '0',
                      right: '0',
                      width: 'calc((100% - 180px) / 5)',
                      textAlign: 'center',
                      background: C.gold,
                      color: C.bg,
                      borderTopLeftRadius: '2px',
                      borderTopRightRadius: '2px',
                      zIndex: 2,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.4)`,
                    }}
                  >
                    Recommended
                  </div>
                <table className="w-full border-collapse relative" style={{ tableLayout: 'fixed', zIndex: 1 }}>
                  <colgroup>
                    <col style={{ width: '180px' }} />
                    <col /><col /><col /><col /><col />
                  </colgroup>
                  {/* ─ 등급 헤더 ─ */}
                  <thead>
                    <tr>
                      <th className="text-left pb-6 align-bottom">
                        <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.ivoryDim }}>Tier</span>
                      </th>
                      {TIERS.map((t) => (
                        <th key={t.key} className="text-center pb-6 px-2 align-bottom relative">
                          <div style={{ marginTop: t.recommended ? '40px' : '8px' }}>
                            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: t.color, opacity: 0.85 }}>
                              {t.en}
                            </div>
                            <div
                              className="font-serif text-lg md:text-xl font-normal"
                              style={{ color: t.recommended ? C.ivory : C.ivoryMute }}
                            >
                              {t.name}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                    {/* 헤더 구분선 */}
                    <tr>
                      <td colSpan={6} className="p-0">
                        <div className="h-px" style={{ background: C.goldHair }} />
                      </td>
                    </tr>
                  </thead>

                  <tbody>
                    {TIER_GROUPS.map((group) => (
                      <Fragment key={group.category}>
                        {/* 카테고리 헤더 */}
                        <tr>
                          <td colSpan={6} className="pt-8 pb-3">
                            <div className="flex items-center gap-3">
                              <span className="block w-6 h-px" style={{ background: C.gold }} />
                              <span className="text-[10px] tracking-[0.35em] uppercase font-semibold" style={{ color: C.gold }}>
                                {group.category}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {group.rows.map((row, ri) => (
                          <tr key={ri} style={{ borderBottom: `1px solid ${C.goldFaint}` }}>
                            <td className="py-4 pr-4 text-[13px] tracking-tight" style={{ color: C.ivoryMute }}>
                              {row.label}
                            </td>
                            {row.values.map((v, ci) => {
                              const isPremium = ci === TIERS.length - 1
                              return (
                                <td
                                  key={ci}
                                  className="py-4 px-2 text-center align-middle relative"
                                  style={isPremium ? { background: C.goldFaint } : undefined}
                                >
                                  <TierCell value={v} isPremium={isPremium} />
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[12px] text-center" style={{ color: C.ivoryDim }}>
              상위 등급은 하위 등급의 모든 권한을 포함합니다.
            </p>
          </Reveal>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.goldHair}, transparent)` }} />
        </div>
      </section>

      {/* ═══════════════ 3. PREMIUM 전용 ═══════════════ */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-10 md:py-14">
          <Reveal>
            <div className="max-w-3xl">
              <Eyebrow>Exclusively Premium</Eyebrow>
              <h2
                className="font-serif font-light tracking-tight"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 3rem)', lineHeight: 1.15 }}
              >
                오직 프리미엄에만 <span className="italic" style={{ color: C.gold }}>열리는 길.</span>
              </h2>
              <p className="mt-4 text-[13px] md:text-[14px]" style={{ color: C.ivoryMute, lineHeight: 1.65 }}>
                다른 어떤 등급에서도 받을 수 없는, 합격 그 너머를 위한 세 가지 권리.
              </p>
            </div>
          </Reveal>

          {/* 메인 — 취업 연계 매칭 (큰 카드) */}
          <Reveal delay={150}>
            <div
              className="mt-7 md:mt-9 relative grid lg:grid-cols-5 gap-px"
              style={{ background: C.goldHair, border: `1px solid ${C.goldHair}` }}
            >
              {/* 좌: 4단계 프로세스 */}
              <div className="lg:col-span-3 p-6 md:p-10" style={{ background: C.bg }}>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-serif text-2xl tabular-nums font-light" style={{ color: C.gold }}>01</span>
                  <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.gold }}>Career Placement</span>
                </div>
                <h3 className="font-serif text-2xl md:text-3xl font-normal mb-3" style={{ color: C.ivory, lineHeight: 1.25 }}>
                  취업 연계 매칭
                </h3>
                <p className="text-[14px] mb-10 max-w-xl" style={{ color: C.ivoryMute, lineHeight: 1.7 }}>
                  CAYSON의 350+ 협력 기업에 자동 등록되어, 평균 43일 안에 합격 → 입사로 이어집니다.
                </p>

                <ol className="relative">
                  <div className="absolute left-[15px] top-3 bottom-3 w-px" style={{ background: C.goldHair }} />
                  {placement.map((s, i) => (
                    <li key={i} className="relative pl-12 pb-6 last:pb-0">
                      <div className="absolute left-0 top-0 flex items-center justify-center w-[32px] h-[32px] rounded-full"
                        style={{ background: C.bg, border: `1px solid ${C.gold}` }}>
                        <span className="text-[11px] font-medium tabular-nums tracking-wider" style={{ color: C.gold }}>{s.num}</span>
                      </div>
                      <h4 className="font-serif text-[15px] md:text-[17px] font-normal mb-1" style={{ color: C.ivory }}>{s.title}</h4>
                      <p className="text-[12px] md:text-[13px]" style={{ color: C.ivoryMute, lineHeight: 1.7 }}>{s.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 우: 분야 분포 */}
              <div className="lg:col-span-2 p-8 md:p-10" style={{ background: C.bgAlt }}>
                <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.ivoryDim }}>채용 연계 분야</div>
                <div className="font-serif text-lg md:text-xl mb-7" style={{ color: C.ivory }}>6개 산업 · 350+ 기업</div>

                <div className="space-y-4">
                  {fields.map((f, i) => (
                    <div key={i}>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-[12px] tracking-tight" style={{ color: C.ivory }}>{f.name}</span>
                        <span className="text-[10px] tabular-nums">
                          <span style={{ color: C.gold }}>{f.count}</span>
                          <span className="mx-1.5" style={{ color: C.ivoryDim }}>·</span>
                          <span style={{ color: C.ivoryDim }}>{f.share}%</span>
                        </span>
                      </div>
                      <div className="relative h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${(f.count / 90) * 100}%`, background: `linear-gradient(90deg, ${C.goldDark}, ${C.gold}, ${C.goldLight})` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* 보조 — 1:1 멘토링 + 24h 지원 */}
          <div className="mt-px grid md:grid-cols-2 gap-px" style={{ background: C.goldHair, border: `1px solid ${C.goldHair}`, borderTop: 'none' }}>
            <Reveal delay={250}>
              <div className="h-full p-8 md:p-10" style={{ background: C.bg }}>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-serif text-2xl tabular-nums font-light" style={{ color: C.gold }}>02</span>
                  <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.gold }}>Mentorship</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-normal mb-3" style={{ color: C.ivory }}>
                  1:1 합격 멘토링
                </h3>
                <p className="text-[13px] md:text-[14px]" style={{ color: C.ivoryMute, lineHeight: 1.7 }}>
                  같은 자격증을 합격한 선배 멘토와 1:1로 연결됩니다. 학습 동선 · 시험 전략 · 면접까지, 합격 경험자의 시각으로 코칭받으세요.
                </p>
              </div>
            </Reveal>
            <Reveal delay={350}>
              <div className="h-full p-8 md:p-10" style={{ background: C.bg }}>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-serif text-2xl tabular-nums font-light" style={{ color: C.gold }}>03</span>
                  <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.gold }}>Concierge</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-normal mb-3" style={{ color: C.ivory }}>
                  24h 전용 컨시어지
                </h3>
                <p className="text-[13px] md:text-[14px]" style={{ color: C.ivoryMute, lineHeight: 1.7 }}>
                  학습 · 결제 · 기술 · 시험 일정까지, 프리미엄 회원 전용 채널에서 24시간 가장 빠르게 응답합니다.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${C.goldHair}, transparent)` }} />
        </div>
      </section>

      {/* ═══════════════ 4. FINAL CTA ═══════════════ */}
      <section className="relative">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12 md:py-16">
          <Reveal>
            <div className="relative max-w-3xl mx-auto text-center">
              <GoldOrnament className="w-[80px] h-4 mx-auto mb-5" />
              <Eyebrow center>Begin Your Membership</Eyebrow>
              <h2
                className="font-serif font-light tracking-tight mt-2"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', lineHeight: 1.15 }}
              >
                <span className="block">합격 그 너머의 길.</span>
                <span className="block italic mt-2" style={{ color: C.gold }}>지금부터 함께합니다.</span>
              </h2>
              <p
                className="mt-5 text-[13px] md:text-[14px] max-w-xl mx-auto"
                style={{ color: C.ivoryMute, lineHeight: 1.7 }}
              >
                지금 등급을 선택하고, 다음 단계로 가는 가장 효율적인 길을 시작하세요.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3">
                <Link
                  href="/login"
                  className="group relative isolate inline-flex items-center justify-center gap-3 px-10 py-4 text-sm md:text-base font-semibold tracking-tight overflow-hidden transition-all duration-300"
                  style={{
                    background: C.gold,
                    color: C.bg,
                    borderRadius: '2px',
                    boxShadow: `0 0 40px rgba(201,169,107,0.3), 0 8px 24px rgba(0,0,0,0.4)`,
                  }}
                >
                  <span className="relative z-10">멤버십 시작하기</span>
                  <svg className="relative z-10 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: C.ivoryDim }}>
                  No commitment · Cancel anytime
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
