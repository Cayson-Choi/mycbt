'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import PremiumSection from './PremiumSection'
import VideoPlayerModal from './VideoPlayerModal'
import { hasTierAccess, TIER_LABELS as TIER_LABEL, TIER_TEXT_COLOR as TIER_COLOR, TIER_BADGE_LIGHT as TIER_BADGE } from '@/lib/tier'

export type LandingVideo = {
  id: number
  title: string
  videoUrl: string
  thumbnailUrl: string | null
  categoryId: number | null
  categoryName: string | null
  durationText: string | null
  ratingText: string | null
  price: number | null
  minTier: string
}


type FallbackLecture = { title: string; stars: string; hours: string }

const ENGINEER_FALLBACK: FallbackLecture[] = [
  { title: '전기자기학 핵심 이론 완성', stars: '4.8(52)', hours: '32시간' },
  { title: '전력공학 핵심 공식 마스터', stars: '4.7(29)', hours: '28시간' },
  { title: '전기기기 구조와 원리 총정리', stars: '4.9(67)', hours: '26시간' },
  { title: '회로이론 및 제어공학 집중', stars: '4.8(41)', hours: '24시간' },
]

const TECHNICIAN_FALLBACK: FallbackLecture[] = [
  { title: '전기이론 기초부터 실전까지', stars: '4.7(38)', hours: '20시간' },
  { title: '전기기기 핵심 구조 이해', stars: '4.8(45)', hours: '18시간' },
  { title: '전기설비 시공 실무 정리', stars: '4.6(31)', hours: '16시간' },
  { title: '실기 작업형 완벽 대비', stars: '4.9(28)', hours: '15시간' },
]

const ELEVATOR_FALLBACK: FallbackLecture[] = [
  { title: '엘리베이터 구조와 원리', stars: '4.7(33)', hours: '18시간' },
  { title: '권상기·제어반 핵심 정리', stars: '4.8(27)', hours: '16시간' },
  { title: '승강기 안전관리 실무', stars: '4.6(22)', hours: '14시간' },
  { title: '에스컬레이터 점검 가이드', stars: '4.7(19)', hours: '12시간' },
]

function VideoYBanner({ subtitle, title, bg, href }: { subtitle: string; title: string; bg: string; href: string }) {
  return (
    <Reveal>
      <Link href={href} className={`block rounded-xl overflow-hidden h-full ${bg} p-4 sm:p-5 flex flex-col justify-between min-h-[110px] sm:min-h-[280px] relative cursor-pointer group border border-[#C9A84C]/20 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:-translate-y-0.5 transition-all`}>
        <span
          className="absolute top-1/2 left-1/2 text-[60px] sm:text-[80px] font-black text-[#C9A84C]/10 select-none leading-none tracking-tight whitespace-nowrap transition-transform duration-500 group-hover:scale-110"
          style={{ transform: 'translate(-50%, -50%) rotate(-25deg)' }}
        >
          CAYSON
        </span>
        <div className="relative z-10">
          <p className="text-xs sm:text-sm font-semibold text-[#C9A84C]/80 tracking-[0.25em] uppercase mb-1.5">{subtitle}</p>
          <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
            {title}<br />동영상 강의
          </h3>
        </div>
        <p className="relative z-10 text-xs sm:text-sm text-[#C9A84C]/90 font-semibold mt-2">
          더 보러 가기 <span className="ml-0.5 inline-block transition-transform group-hover:translate-x-1">&rsaquo;</span>
        </p>
      </Link>
    </Reveal>
  )
}

function VideoCardFromDb({ v, idx, onPlay }: { v: LandingVideo; idx: number; onPlay: (v: LandingVideo) => void }) {
  return (
    <Reveal delay={(idx + 1) * 80}>
      <button
        type="button"
        onClick={() => onPlay(v)}
        className="text-left w-full group rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 overflow-hidden h-full bg-[#FEFDF5] dark:bg-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all hover:-translate-y-1 flex flex-col"
      >
        <div className="aspect-[4/3] w-full bg-[#F5F0E6] dark:bg-gray-800 flex items-center justify-center overflow-hidden relative">
          {v.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#C9A84C]/40 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          )}
          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30">
            <span className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="#1B2A4A" className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
        </div>
        <div className="flex-1 min-h-0 p-2.5 sm:p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1B2A4A] dark:text-white leading-snug line-clamp-2 mb-1">{v.title}</h4>
            <p className="text-xs sm:text-sm font-semibold text-[#1B2A4A]/80 dark:text-gray-300 mb-1">
              {v.price && v.price > 0 ? `${v.price.toLocaleString()}원` : '무료'}
            </p>
            {(v.ratingText || v.durationText) && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#1B2A4A]/70 dark:text-gray-400">
                {v.ratingText && (
                  <>
                    <span className="text-[#C9A84C]">&#9733;</span>
                    <span>{v.ratingText}</span>
                  </>
                )}
                {v.ratingText && v.durationText && <span className="text-[#C9A84C]/30">|</span>}
                {v.durationText && <span>{v.durationText}</span>}
              </div>
            )}
          </div>
          <span className={`inline-flex items-center self-end px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide ${TIER_BADGE[v.minTier] ?? TIER_BADGE.FREE}`}>
            {TIER_LABEL[v.minTier] ?? v.minTier}
          </span>
        </div>
      </button>
    </Reveal>
  )
}

function VideoPreparingCard({ lec, idx }: { lec: FallbackLecture; idx: number }) {
  return (
    <Reveal delay={(idx + 1) * 80}>
      <div className="group rounded-xl border border-[#C9A84C]/15 dark:border-gray-700 overflow-hidden h-full min-h-[260px] sm:min-h-[280px] bg-[#FEFDF5] dark:bg-gray-900 hover:shadow-lg hover:shadow-[#C9A84C]/10 transition-all hover:-translate-y-1 flex flex-col">
        <div className="flex-[2] min-h-0 bg-[#F5F0E6] dark:bg-gray-800 flex flex-col items-center justify-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#C9A84C]/40 dark:text-gray-600 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="text-[9px] sm:text-[10px] text-[#C9A84C]/50 dark:text-gray-500 font-medium tracking-wider">준비중</span>
        </div>
        <div className="flex-1 min-h-0 p-2.5 sm:p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#1B2A4A] dark:text-white leading-snug line-clamp-2 mb-1">{lec.title}</h4>
            <p className="text-xs sm:text-sm font-semibold text-[#1B2A4A]/80 dark:text-gray-300 mb-1">무료</p>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[#1B2A4A]/70 dark:text-gray-400">
              <span className="text-[#C9A84C]">&#9733;</span>
              <span>{lec.stars}</span>
              <span className="text-[#C9A84C]/30">|</span>
              <span>{lec.hours}</span>
            </div>
          </div>
          <p className="text-sm sm:text-base font-extrabold tracking-wide text-right text-emerald-600 dark:text-emerald-400">무료</p>
        </div>
      </div>
    </Reveal>
  )
}

/* ─── 스크롤 등장 ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => setV(true), delay); ob.unobserve(el) } }, { threshold: 0.12 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [delay])
  return <div ref={ref} className={`transition-all duration-700 ease-out ${v ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>{children}</div>
}

/* ─── Ornamental Divider ─── */
function OrnamentalDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#C9A84C]/60" />
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#C9A84C]" fill="currentColor">
        <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z" />
      </svg>
      <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#C9A84C]/60" />
    </div>
  )
}

/* ─── Section Heading ─── */
function SectionHeading({ label, title, subtitle, center = false }: { label: string; title: string; subtitle?: React.ReactNode; center?: boolean }) {
  return (
    <div className={`mb-12 sm:mb-16 ${center ? 'text-center' : ''}`}>
      <p className="text-xs font-semibold text-[#C9A84C] dark:text-[#C9A84C] tracking-[0.25em] uppercase mb-3">
        {label}
      </p>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2A4A] dark:text-white tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[#1B2A4A]/60 dark:text-gray-400 mt-3 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
      <OrnamentalDivider className={`mt-5 ${center ? '' : 'justify-start'}`} />
    </div>
  )
}

/* ─── 등급 데이터 — Premium dark gradient + CAYSON 워터마크 ─── */
const grades = [
  {
    id: 'basic', label: '진단평가', count: 1,
    badge: '입문 과정',
    cta: '자격증 입문자를 위한\n기초 진단평가',
    cardBg: 'bg-gradient-to-br from-[#0a3d4d] to-[#155571]', badgeBg: 'bg-teal-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g0a" x1="20" y1="10" x2="60" y2="60"><stop offset="0%" stopColor="#4dd0e1" /><stop offset="100%" stopColor="#00838f" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="14" ry="3" fill="#b2ebf2" opacity="0.5" />
        <rect x="22" y="18" width="36" height="44" rx="3" fill="url(#g0a)" />
        <rect x="28" y="26" width="24" height="3" rx="1.5" fill="#e0f7fa" opacity="0.7" />
        <rect x="28" y="33" width="18" height="3" rx="1.5" fill="#e0f7fa" opacity="0.5" />
        <rect x="28" y="40" width="20" height="3" rx="1.5" fill="#e0f7fa" opacity="0.5" />
        <circle cx="40" cy="52" r="5" fill="#e0f7fa" stroke="#4dd0e1" strokeWidth="1" />
        <path d="M38 52l2 2 4-4" stroke="#00838f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'technician', label: '기능사', count: 4,
    badge: '4개 자격증',
    cta: '전기기능사 외 3개\n필기/실기 준비',
    cardBg: 'bg-gradient-to-br from-[#0d3d33] to-[#1f5d4f]', badgeBg: 'bg-emerald-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g1a" x1="30" y1="10" x2="50" y2="55"><stop offset="0%" stopColor="#5ef6d0" /><stop offset="100%" stopColor="#22b893" /></linearGradient>
          <linearGradient id="g1b" x1="28" y1="50" x2="40" y2="72"><stop offset="0%" stopColor="#26c6da" /><stop offset="100%" stopColor="#00897b" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="14" ry="3" fill="#b2dfdb" opacity="0.5" />
        <path d="M30 52l-5 16 10-5 5 7 5-7 10 5-5-16" fill="url(#g1b)" />
        <circle cx="40" cy="34" r="20" fill="url(#g1a)" />
        <circle cx="40" cy="34" r="15" fill="#e0f2f1" stroke="#80cbc4" strokeWidth="1.5" />
        <path d="M33 34l4 4 8-8" stroke="#00897b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse cx="34" cy="22" rx="6" ry="2" fill="white" opacity="0.3" transform="rotate(-20 34 22)" />
      </svg>
    ),
  },
  {
    id: 'industrial', label: '산업기사', count: 6,
    badge: '6개 자격증',
    cta: '전기산업기사 외 5개\n현장 전문가 도약',
    cardBg: 'bg-gradient-to-br from-[#3d2d5c] to-[#5a4485]', badgeBg: 'bg-violet-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g2a" x1="20" y1="20" x2="60" y2="60"><stop offset="0%" stopColor="#b388ff" /><stop offset="100%" stopColor="#7c4dff" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="16" ry="3" fill="#d1c4e9" opacity="0.5" />
        <circle cx="40" cy="38" r="22" fill="url(#g2a)" />
        <circle cx="40" cy="38" r="16" fill="#ede7f6" stroke="#b39ddb" strokeWidth="1.5" />
        <path d="M40 28v10" stroke="#5e35b1" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M40 38l6 4" stroke="#5e35b1" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="40" cy="38" r="2.5" fill="#5e35b1" />
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(n => <circle key={n} cx={40 + 14 * Math.cos(n * Math.PI / 6)} cy={38 + 14 * Math.sin(n * Math.PI / 6)} r="1" fill="#9575cd" />)}
        <ellipse cx="34" cy="26" rx="5" ry="2" fill="white" opacity="0.25" transform="rotate(-25 34 26)" />
      </svg>
    ),
  },
  {
    id: 'engineer', label: '기사', count: 4,
    badge: '4개 자격증',
    cta: '전기기사 외 3개\n체계적 합격 전략',
    cardBg: 'bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A]', badgeBg: 'bg-blue-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g3a" x1="20" y1="14" x2="60" y2="50"><stop offset="0%" stopColor="#64b5f6" /><stop offset="100%" stopColor="#1565c0" /></linearGradient>
          <linearGradient id="g3b" x1="20" y1="38" x2="60" y2="60"><stop offset="0%" stopColor="#1e88e5" /><stop offset="100%" stopColor="#0d47a1" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="18" ry="3" fill="#bbdefb" opacity="0.5" />
        <path d="M40 14L12 30l28 14 28-14L40 14z" fill="url(#g3a)" />
        <path d="M12 30v14l28 16 28-16V30L40 44 12 30z" fill="url(#g3b)" />
        <path d="M40 44v16" stroke="#0d47a1" strokeWidth="2" />
        <rect x="63" y="30" width="3" height="24" rx="1.5" fill="#0d47a1" />
        <ellipse cx="64.5" cy="54" rx="5" ry="3.5" fill="#1565c0" />
        <ellipse cx="64.5" cy="52.5" rx="5" ry="3.5" fill="#42a5f5" />
        <circle cx="40" cy="60" r="4" fill="#ffd54f" stroke="#ffb300" strokeWidth="1" />
        <path d="M38 60l1.5 1.5 3-3" stroke="#f57f17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 20c0-1 2-2 4-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'master', label: '기능장', count: 1,
    badge: '1개 자격증',
    cta: '전기기능장\n최고 등급에 도전',
    cardBg: 'bg-gradient-to-br from-[#5c3d1a] to-[#8b5e2e]', badgeBg: 'bg-amber-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g4a" x1="22" y1="18" x2="58" y2="60"><stop offset="0%" stopColor="#ffe082" /><stop offset="100%" stopColor="#ffab00" /></linearGradient>
          <linearGradient id="g4b" x1="26" y1="44" x2="54" y2="62"><stop offset="0%" stopColor="#ffca28" /><stop offset="100%" stopColor="#ff8f00" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="16" ry="3" fill="#ffe0b2" opacity="0.5" />
        <path d="M26 46h28v16a4 4 0 01-4 4H30a4 4 0 01-4-4V46z" fill="url(#g4b)" />
        <path d="M26 46h28v8H26z" fill="#fdd835" />
        <path d="M18 20l10 12 12-14 12 14 10-12-6 26H24L18 20z" fill="url(#g4a)" />
        <circle cx="18" cy="20" r="4" fill="#ff8f00" /><circle cx="18" cy="20" r="2" fill="#ffe082" />
        <circle cx="62" cy="20" r="4" fill="#ff8f00" /><circle cx="62" cy="20" r="2" fill="#ffe082" />
        <circle cx="40" cy="18" r="4" fill="#ff8f00" /><circle cx="40" cy="18" r="2" fill="#ffe082" />
        <rect x="36" y="50" width="8" height="8" rx="2" fill="white" opacity="0.25" />
        <path d="M24 26c0-1 2-3 4-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'ncs', label: '과정평가형', count: 0,
    badge: '2개 자격증',
    cta: 'NCS 과정평가형\n교육훈련 자격 취득',
    cardBg: 'bg-gradient-to-br from-[#5c1f3d] to-[#7d2f55]', badgeBg: 'bg-gray-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g6a" x1="24" y1="10" x2="56" y2="56"><stop offset="0%" stopColor="#f48fb1" /><stop offset="100%" stopColor="#ad1457" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="14" ry="3" fill="#f8bbd0" opacity="0.5" />
        <path d="M40 8C28 8 20 18 20 30c0 8 4 15 9 19v7h22v-7c5-4 9-11 9-19 0-12-8-22-20-22z" fill="url(#g6a)" />
        <path d="M40 8C32 8 26 14 24 22c2-4 8-8 16-8s14 4 16 8c-2-8-8-14-16-14z" fill="white" opacity="0.2" />
        <circle cx="40" cy="30" r="11" fill="#fce4ec" stroke="#f48fb1" strokeWidth="1" />
        <path d="M35 30l3 3 7-7" stroke="#ad1457" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="29" y="56" width="22" height="5" rx="2.5" fill="#880e4f" />
        <rect x="29" y="56" width="22" height="2.5" rx="2.5" fill="#ad1457" />
        <rect x="33" y="61" width="14" height="3" rx="1.5" fill="#880e4f" />
        <path d="M33 18c-2 3-3 6-3 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'etc', label: '공식시험', count: 1,
    badge: '실전 모의고사',
    cta: '공식시험\n실전 환경 그대로',
    cardBg: 'bg-gradient-to-br from-[#1f2d5c] to-[#3d4985]', badgeBg: 'bg-indigo-500',
    icon: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="g7a" x1="20" y1="14" x2="60" y2="60"><stop offset="0%" stopColor="#7986cb" /><stop offset="100%" stopColor="#303f9f" /></linearGradient>
        </defs>
        <ellipse cx="40" cy="68" rx="16" ry="3" fill="#c5cae9" opacity="0.5" />
        <rect x="18" y="16" width="44" height="48" rx="4" fill="url(#g7a)" />
        <rect x="24" y="24" width="32" height="3" rx="1.5" fill="#e8eaf6" opacity="0.6" />
        <rect x="24" y="31" width="24" height="3" rx="1.5" fill="#e8eaf6" opacity="0.4" />
        <rect x="24" y="38" width="28" height="3" rx="1.5" fill="#e8eaf6" opacity="0.4" />
        <circle cx="30" cy="52" r="6" fill="#e8eaf6" stroke="#7986cb" strokeWidth="1" />
        <path d="M28 52l2 2 4-4" stroke="#303f9f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 20c0-1 2-2 4-1" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
  },
]

/* ─── 합격 수기 데이터 ─── */
const testimonials = [
  {
    name: '김도현',
    tags: ['#전기기사', '#3개월합격', '#직장인'],
    rating: 5,
    quote: '퇴근 후 매일 1시간씩 CAYSON으로 기출만 반복했습니다. 오답노트 기능이 정말 큰 도움이 됐고, 실전과 동일한 환경 덕분에 시험장에서도 긴장 없이 풀 수 있었습니다.',
  },
  {
    name: '박서연',
    tags: ['#전기산업기사', '#1회합격'],
    rating: 5,
    quote: '비전공이라 걱정이 많았는데 CAYSON의 과목별 분석 기능으로 약점을 파악하고 집중 공부했더니 1회 만에 합격했습니다. 문제 검증이 잘 되어있어서 믿고 풀었어요.',
  },
  {
    name: '이준혁',
    tags: ['#전기기능사'],
    rating: 4,
    quote: '학교 선생님 추천으로 시작했는데, 다른 사이트랑 다르게 오류가 거의 없어서 좋았습니다. 모바일로도 잘 되니까 통학 시간에 틈틈이 풀었어요.',
  },
  {
    name: '최유진',
    tags: ['#전기기사', '#육아맘', '#독학합격'],
    rating: 5,
    quote: '아이 재우고 새벽에 공부했는데, CAYSON은 깔끔하고 빠르게 문제만 풀 수 있어서 효율적이었습니다. 불필요한 기능 없이 핵심만 있는 점이 마음에 들었어요.',
  },
  {
    name: '정민수',
    tags: ['#전기기능장', '#재도전'],
    rating: 4,
    quote: '세 번째 도전이었는데 이번에는 CAYSON으로 기출 패턴을 분석하면서 풀었더니 합격했습니다. 규정 개정 반영이 빨라서 구 규정 문제에 속지 않았어요.',
  },
]

/* ─── CAYSON이 다른 이유 — 인터랙티브 섹션 ─── */
function WhyCaysonSection() {
  const [activeFeature, setActiveFeature] = useState(0)
  const triggerRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!triggerRef.current) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    obs.observe(triggerRef.current)
    return () => obs.disconnect()
  }, [])

  // 자동 로테이션
  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => setActiveFeature(p => (p + 1) % 6), 4000)
    return () => clearInterval(id)
  }, [visible])

  const features = [
    {
      tab: '원본 대조',
      title: '시험지 원본과 한 문제씩 직접 대조',
      desc: '인터넷 문제를 그대로 복사하지 않습니다. 실제 시험지 원본과 한 문제씩 대조해 검증합니다.',
      image: '/tab-graphics/wonbon.png',
    },
    {
      tab: 'AI 이중 검증',
      title: 'AI + 수동 이중 검증 시스템',
      desc: 'AI가 전체 문제를 자동 검토한 후, 수동으로 한 번 더 확인합니다. 이중 검증을 통해 정답 오류를 원천 차단합니다.',
      image: '/tab-graphics/ai.png',
    },
    {
      tab: '즉시 수정',
      title: '오류 발견 즉시 수정, 방치 없음',
      desc: '오류를 발견하면 방치하지 않습니다. 확인 즉시 수정하고 규정 개정 사항도 실시간으로 반영합니다.',
      image: '/tab-graphics/jeuksi.png',
    },
    {
      tab: '실전 CBT',
      title: '한국산업인력공단 CBT 동일 구현',
      desc: '단순 문제풀이가 아닙니다. 실제 시험과 동일한 과목 구성, 문항 수, 제한 시간으로 실전 감각을 잡아드립니다.',
      image: '/tab-graphics/cbt.png',
    },
    {
      tab: '약점 분석',
      title: '과목별 약점을 자동으로 분석',
      desc: '시험 종료 즉시 과목별 정답률과 약점을 자동 분석합니다. 어디가 부족한지 한눈에 파악하고 집중 학습하세요.',
      image: '/tab-graphics/yakjeom.png',
    },
    {
      tab: '실시간 반영',
      title: '규정 개정 사항 실시간 반영',
      desc: '전기 관련 법규와 규정이 바뀌면 즉시 문제에 반영합니다. 항상 최신 기준으로 학습할 수 있습니다.',
      image: '/tab-graphics/realtime.png',
    },
  ]

  // 모든 탭이 동일한 royal-navy + 골드 계열을 공유 (이전엔 색상별 분기였으나 디자인 통일됨)
  const tabStyle = {
    active: 'bg-[#1B2A4A] text-white shadow-[#1B2A4A]/25',
    border: 'border-[#C9A84C]/30 dark:border-[#C9A84C]/20',
    ring: 'ring-[#C9A84C]/10',
  }

  const f = features[activeFeature]

  return (
    <section className="bg-[#FEFDF5] dark:bg-gray-950 overflow-hidden">
      <div ref={triggerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12 sm:pb-16">
        <Reveal>
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-xs font-semibold text-[#C9A84C] dark:text-[#C9A84C] tracking-[0.25em] uppercase mb-3">Why CAYSON</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1B2A4A] dark:text-white tracking-tight leading-snug">
              왜 {'CAYSON'.split('').map((ch, i) => (
                <span key={i} className="inline-block text-[#C9A84C] tracking-wide" style={{ animation: `caysonBounce 4s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, marginRight: '0.04em' }}>{ch}</span>
              ))}이어야 할까요?
            </h2>
            <OrnamentalDivider className="mt-5" />
          </div>
        </Reveal>

        <div className="mb-4 sm:mb-6" />

        {/* 콘텐츠 카드 */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${tabStyle.border} ring-2 ${tabStyle.ring} shadow-lg shadow-[#C9A84C]/5 transition-all duration-500 overflow-hidden`}>
          <div className="grid lg:grid-cols-2 gap-0">
            {/* 좌: 비주얼 — 6장 모두 렌더링하고 활성 탭만 보이게 (탭 전환 시 추가 다운로드 없음) */}
            <div className="p-5 sm:p-8">
              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden">
                {features.map((ft, i) => (
                  <Image
                    key={ft.image}
                    src={ft.image}
                    alt={ft.tab}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={i === 0}
                    className={`object-cover transition-opacity duration-500 ${i === activeFeature ? 'opacity-100' : 'opacity-0'}`}
                  />
                ))}
              </div>
            </div>
            {/* 우: 설명 */}
            <div className="p-5 sm:p-8 flex flex-col justify-center">
              <div key={activeFeature} className="transition-all duration-500">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B2A4A] dark:text-white leading-tight mb-4">{f.title}</h3>
                <p className="text-sm sm:text-base text-[#1B2A4A]/60 dark:text-gray-400 leading-relaxed mb-6">{f.desc}</p>
                {/* 프로그레스 인디케이터 */}
                <div className="flex gap-1.5">
                  {features.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-[#1B2A4A]/10 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${i === activeFeature ? 'bg-[#C9A84C]' : i < activeFeature ? 'bg-[#C9A84C]/40' : ''}`}
                        style={{ width: i === activeFeature ? '100%' : i < activeFeature ? '100%' : '0%', transition: i === activeFeature ? 'width 4s linear' : 'width 0.3s' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Reveal delay={300}>
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-[#1B2A4A]/50 dark:text-gray-400 text-sm mb-3 sm:mb-4">검증된 문제로 공부하면 합격이 가까워집니다</p>
            <Link
              href="/login"
              className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-[#1B2A4A] via-[#2A3F6A] to-[#1B2A4A] text-white font-semibold px-10 py-4 rounded-xl text-sm sm:text-base transition-all hover:shadow-xl hover:shadow-[#1B2A4A]/20 hover:scale-[1.03] active:scale-[0.97] overflow-hidden border border-[#C9A84C]/30"
             
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#1B2A4A] via-[#344d7a] to-[#1B2A4A] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" style={{ animation: 'ctaShimmer 2.5s ease-in-out infinite' }} />
              <span className="relative">지금 무료로 시작하기</span>
              <svg className="relative w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// gradeMap: grades 배열의 id → DB grade name 매핑
const gradeDbMap: Record<string, string> = {
  basic: '진단평가',
  technician: '기능사',
  industrial: '산업기사',
  engineer: '기사',
  master: '기능장',
  ncs: '과정평가형',
  etc: '기타',
}

export default function LandingContent({ gradeCounts: initialGradeCounts, initialHiddenCards = [], videos = [] }: { gradeCounts?: Record<string, number>; initialHiddenCards?: string[]; videos?: LandingVideo[] }) {
  const [hiddenCards] = useState<string[]>(initialHiddenCards)
  const [gradeCounts] = useState<Record<string, number> | undefined>(initialGradeCounts)
  const [playing, setPlaying] = useState<LandingVideo | null>(null)
  const [locked, setLocked] = useState<LandingVideo | null>(null)
  const { data: session } = useSession()
  const userTier = (session?.user as { tier?: string } | undefined)?.tier ?? 'FREE'
  const userIsAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false

  const handlePlay = (v: LandingVideo) => {
    if (!session?.user) {
      window.location.href = `/login?redirect=${encodeURIComponent('/')}`
      return
    }
    if (!userIsAdmin && !hasTierAccess(userTier, v.minTier)) {
      setLocked(v)
      return
    }
    setPlaying(v)
  }
  // 카테고리별 비디오 분리 (이름 정확 매칭 — '전기기능사'와 '전기기사'가 부분 매칭 충돌하지 않도록 주의)
  const engineerVideos = videos.filter((v) => {
    const n = v.categoryName ?? ''
    return n.includes('전기기사') && !n.includes('산업기사') && !n.includes('기능사')
  })
  const technicianVideos = videos.filter((v) => (v.categoryName ?? '').includes('전기기능사'))
  const elevatorVideos = videos.filter((v) => (v.categoryName ?? '').includes('승강기'))
  const engineerFeatured = engineerVideos.slice(0, 4)
  const technicianFeatured = technicianVideos.slice(0, 4)
  const elevatorFeatured = elevatorVideos.slice(0, 4)
  // 서버 데이터가 10초 캐시로 충분히 fresh하므로 클라이언트 추가 fetch 불필요

  return (
    <>
      {/* ════════════════════════════════════════
          SECTION 1 -- 과정별 CBT (등급 탭 + 카드)
         ════════════════════════════════════════ */}
      <section id="exams" className="bg-[#FEFDF5] dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Reveal>
            <SectionHeading label="CBT Practice" title="과정별 CBT" />
          </Reveal>

          {/* Royal-styled card grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {grades.map((g) => {
              // 관리자가 숨김 처리한 카드는 표시하지 않음
              if (hiddenCards?.includes(g.id)) return null
              // DB에서 가져온 실제 시험 수로 덮어씌우기
              const dbGrade = gradeDbMap[g.id]
              const realCount = gradeCounts && dbGrade ? (gradeCounts[dbGrade] ?? 0) : g.count
              // 시험이 0개이고 "준비중"이 아닌 카드는 숨김
              if (realCount === 0 && g.badge !== '준비중') return null
              return (
              <Reveal key={g.id}>
                {realCount > 0 ? (
                  <Link
                    href={`/grade/${g.id}`}
                    className={`group block relative overflow-hidden rounded-xl ${g.cardBg} p-4 sm:p-5 h-full min-h-[140px] sm:min-h-[170px] transition-all duration-300 hover:shadow-xl hover:shadow-[#C9A84C]/20 hover:-translate-y-1 cursor-pointer border border-white/10`}
                  >
                    {/* 노이즈 질감 — 입자감 부여 */}
                    {/* 원단 weave — 가로 세로 짜임 패턴 (강) */}
                    <div
                      className="absolute inset-0 opacity-[0.85] mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 6px),
                          repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 1px, transparent 1px, transparent 6px)
                        `,
                      }}
                    />
                    {/* 큰 직물 그레인 — 거친 섬유 입자감 */}
                    <div
                      className="absolute inset-0 opacity-[0.65] mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='nf'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nf)'/></svg>\")",
                      }}
                    />
                    {/* 미세 grain — 디테일 */}
                    <div
                      className="absolute inset-0 opacity-[0.30] mix-blend-soft-light pointer-events-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='nfx'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nfx)'/></svg>\")",
                      }}
                    />
                    {/* 좌상단 부드러운 빛 + 우하단 그림자 — 입체감 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/[0.18] pointer-events-none" />
                    {/* 배경 CAYSON 사선 워터마크 */}
                    <span
                      className="absolute top-1/2 left-1/2 text-[44px] sm:text-[64px] font-black text-white/[0.06] select-none leading-none tracking-tight whitespace-nowrap transition-transform duration-500 group-hover:scale-110"
                      style={{ transform: 'translate(-50%, -50%) rotate(-25deg)' }}
                    >
                      CAYSON
                    </span>
                    {/* 좌상단: 제목 */}
                    <h3 className="relative z-10 text-base sm:text-xl font-bold text-white leading-tight">
                      {g.label}
                    </h3>
                    {/* 우상단: 뱃지 */}
                    <div className={`absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 ${g.badgeBg} text-white text-[8px] sm:text-[10px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full tracking-wider z-10`}>
                      {g.badge}
                    </div>
                    {/* 좌하단: CTA 설명 */}
                    <p className="absolute bottom-2.5 left-4 sm:bottom-3.5 sm:left-5 text-[10px] sm:text-xs text-white/70 font-medium leading-snug whitespace-pre-line max-w-[80%] z-10">
                      {g.cta} <span className="inline-block ml-0.5 transition-transform group-hover:translate-x-0.5 text-[#C9A84C]">&rarr;</span>
                    </p>
                  </Link>
                ) : (
                  <div className={`relative overflow-hidden rounded-xl ${g.cardBg} p-4 sm:p-5 h-full min-h-[140px] sm:min-h-[170px] opacity-50 border border-white/5`}>
                    {/* 원단 weave — 가로 세로 짜임 패턴 (강) */}
                    <div
                      className="absolute inset-0 opacity-[0.85] mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage: `
                          repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 6px),
                          repeating-linear-gradient(90deg, rgba(0,0,0,0.32) 0px, rgba(0,0,0,0.32) 1px, transparent 1px, transparent 6px)
                        `,
                      }}
                    />
                    {/* 큰 직물 그레인 — 거친 섬유 입자감 */}
                    <div
                      className="absolute inset-0 opacity-[0.65] mix-blend-overlay pointer-events-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='nf'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nf)'/></svg>\")",
                      }}
                    />
                    {/* 미세 grain — 디테일 */}
                    <div
                      className="absolute inset-0 opacity-[0.30] mix-blend-soft-light pointer-events-none"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='nfx'><feTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nfx)'/></svg>\")",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/[0.18] pointer-events-none" />
                    <span
                      className="absolute top-1/2 left-1/2 text-[44px] sm:text-[64px] font-black text-white/[0.05] select-none leading-none tracking-tight whitespace-nowrap"
                      style={{ transform: 'translate(-50%, -50%) rotate(-25deg)' }}
                    >
                      CAYSON
                    </span>
                    <h3 className="relative z-10 text-base sm:text-xl font-bold text-white/80 leading-tight">
                      {g.label}
                    </h3>
                    <div className={`absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 ${g.badgeBg} text-white text-[8px] sm:text-[10px] font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full tracking-wider z-10`}>
                      {g.badge}
                    </div>
                    <p className="absolute bottom-2.5 left-4 sm:bottom-3.5 sm:left-5 text-[10px] sm:text-xs text-white/50 font-medium leading-snug whitespace-pre-line max-w-[80%] z-10">
                      {g.cta}
                    </p>
                  </div>
                )}
              </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 -- 동영상 강의 (airklass 스타일)
         ════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 border-t border-[#C9A84C]/10 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Reveal>
            <SectionHeading label="Video Lectures" title="동영상 강의" />
          </Reveal>

          {/* 전기기사 그룹 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 mb-5 sm:mb-6">
            <div className="col-span-2 sm:col-span-1"><VideoYBanner subtitle="Engineer" title="전기기사" bg="bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A]" href="/videos/engineer" /></div>
            {engineerFeatured.length > 0
              ? engineerFeatured.map((v, i) => <VideoCardFromDb key={v.id} v={v} idx={i} onPlay={handlePlay} />)
              : ENGINEER_FALLBACK.map((lec, i) => <VideoPreparingCard key={lec.title} lec={lec} idx={i} />)}
          </div>

          {/* 전기기능사 그룹 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 mb-5 sm:mb-6">
            <div className="col-span-2 sm:col-span-1"><VideoYBanner subtitle="Technician" title="전기기능사" bg="bg-gradient-to-br from-[#0d3d33] to-[#1f5d4f]" href="/videos/technician" /></div>
            {technicianFeatured.length > 0
              ? technicianFeatured.map((v, i) => <VideoCardFromDb key={v.id} v={v} idx={i} onPlay={handlePlay} />)
              : TECHNICIAN_FALLBACK.map((lec, i) => <VideoPreparingCard key={lec.title} lec={lec} idx={i} />)}
          </div>

          {/* 승강기기능사 그룹 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            <div className="col-span-2 sm:col-span-1"><VideoYBanner subtitle="Elevator" title="승강기기능사" bg="bg-gradient-to-br from-[#3d2d5c] to-[#5a4485]" href="/videos/elevator" /></div>
            {elevatorFeatured.length > 0
              ? elevatorFeatured.map((v, i) => <VideoCardFromDb key={v.id} v={v} idx={i} onPlay={handlePlay} />)
              : ELEVATOR_FALLBACK.map((lec, i) => <VideoPreparingCard key={lec.title} lec={lec} idx={i} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          PREMIUM SECTION -- 동영상 강의 아래 배치
         ════════════════════════════════════════ */}
      <PremiumSection />

      {/* ════════════════════════════════════════
          SECTION 3 -- 합격 수기
         ════════════════════════════════════════ */}
      <section className="bg-[#FEFDF5] dark:bg-gray-950/50 overflow-hidden border-t border-[#C9A84C]/10 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4 sm:pb-6">
          <Reveal>
            <div className="mb-6 sm:mb-8 text-center">
              <p className="text-xs font-semibold text-[#C9A84C] dark:text-[#C9A84C] tracking-[0.25em] uppercase mb-3">
                Testimonials
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B2A4A] dark:text-white tracking-tight max-w-2xl mx-auto leading-snug">
                광고가 아닌, 수험생들의 진심
                <br className="hidden sm:block" />
                그리고 합격만으로 증명하겠습니다
              </h2>
              <OrnamentalDivider className="mt-5" />
            </div>
          </Reveal>

          {/* 무한 마퀴 (왼→오 자동 흐름) */}
          <div className="overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8">
            <div
              className="flex gap-5 w-max hover:[animation-play-state:paused]"
              style={{ animation: 'marqueeScroll 40s linear infinite' }}
            >
              {/* 카드 2벌 (무한루프용) */}
              {[...testimonials, ...testimonials].map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  className="flex-shrink-0 w-[240px] sm:w-[320px] lg:w-[340px] bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-7 border border-[#C9A84C]/20 dark:border-gray-700 shadow-sm hover:shadow-md hover:shadow-[#C9A84C]/10 transition-shadow"
                >
                  {/* Decorative quote mark */}
                  <div className="text-4xl text-[#C9A84C]/20 leading-none mb-2">&ldquo;</div>
                  <p className="text-sm text-[#1B2A4A]/70 dark:text-gray-300 leading-relaxed mb-4 line-clamp-4">
                    {t.quote}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.tags.map((tag) => (
                      <span key={`${tag}-${i}`} className="text-xs font-medium text-[#1B2A4A]/60 dark:text-[#C9A84C] bg-[#C9A84C]/10 dark:bg-[#C9A84C]/10 px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5 pt-3 border-t border-[#C9A84C]/15 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6A] flex items-center justify-center text-[#C9A84C] text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-[#1B2A4A] dark:text-white">{t.name}</span>
                    <div className="flex gap-0.5 ml-auto">
                      {[...Array(5)].map((_, s) => (
                        <svg key={s} className={`w-3.5 h-3.5 ${s < t.rating ? 'text-[#C9A84C]' : 'text-[#C9A84C]/20 dark:text-gray-600'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 -- CAYSON이 다른 이유 (인터랙티브)
         ════════════════════════════════════════ */}
      <WhyCaysonSection />

      {/* ════════════════════════════════════════
          SECTION 5 -- 고객센터 + CTA (British Royal dark)
         ════════════════════════════════════════ */}
      <section className="relative bg-[#1B2A4A] overflow-hidden">
        {/* 미니멀 골드 도트 콘스텔레이션 */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `
            radial-gradient(circle at 14px 14px, rgba(201,168,76,0.18) 1px, transparent 1.5px),
            radial-gradient(circle at 42px 42px, rgba(201,168,76,0.10) 0.5px, transparent 1px)
          `,
          backgroundSize: '28px 28px, 56px 56px'
        }} />
        {/* Gold line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            {/* 좌측: 텍스트 */}
            <Reveal>
              <div className="lg:flex-shrink-0 lg:w-[380px]">
                <p className="text-white/50 text-base sm:text-xl mb-3 sm:mb-4 leading-relaxed">
                  <span className="text-[#C9A84C] font-semibold">CAYSON</span>은<br />언제나 열려있습니다
                </p>
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                  여러분의 <span className="text-[#C9A84C]">합격</span>만을 위해<br />노력하겠습니다
                </h3>
              </div>
            </Reveal>

            {/* 우측: 2개 카드 */}
            <div className="grid grid-cols-2 gap-3 sm:gap-5 flex-1 w-full">
              <Reveal delay={100}>
                <div className="relative overflow-hidden bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 sm:p-5 h-full flex flex-col border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-colors" style={{
                  boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.15), 0 8px 24px -12px rgba(0,0,0,0.4)'
                }}>
                  {/* ── 질감 레이어 ── */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                    {/* 상단 골드 셰엔 */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{
                      background: 'linear-gradient(90deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.7) 50%, rgba(201,168,76,0.3) 100%)'
                    }} />
                    {/* 그레인 */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.20]" preserveAspectRatio="none">
                      <filter id="grain-card-1">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                      </filter>
                      <rect width="100%" height="100%" filter="url(#grain-card-1)" />
                    </svg>
                  </div>

                  {/* ── 콘텐츠 ── */}
                  <div className="relative z-10 flex flex-col h-full">
                    <h4 className="text-white font-bold text-base sm:text-lg mb-3">고객센터</h4>
                    <div className="text-xs sm:text-sm text-white/60 space-y-1.5 mb-auto">
                      <p>평일: 10:00~18:00</p>
                      <p>점심시간: 12:30~13:30</p>
                      <p className="text-[#C9A84C]/80">주말, 공휴일 휴무</p>
                    </div>
                    <a href="https://open.kakao.com/o/smarimpi" target="_blank" rel="noopener noreferrer" className="mt-3 sm:mt-4 block text-center border border-[#C9A84C]/30 text-[#C9A84C] font-semibold py-2 rounded-lg hover:bg-[#C9A84C]/10 transition-colors text-xs sm:text-sm tracking-wider bg-[#1B2A4A]/30">
                      카카오톡 문의하기
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="relative overflow-hidden bg-white/[0.04] backdrop-blur-sm rounded-xl p-4 sm:p-5 h-full flex flex-col border border-[#C9A84C]/20 hover:border-[#C9A84C]/40 transition-colors" style={{
                  boxShadow: 'inset 0 1px 0 rgba(201,168,76,0.15), 0 8px 24px -12px rgba(0,0,0,0.4)'
                }}>
                  {/* ── 질감 레이어 ── */}
                  <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                    {/* 상단 골드 셰엔 */}
                    <div className="absolute top-0 left-0 right-0 h-px" style={{
                      background: 'linear-gradient(90deg, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.7) 50%, rgba(201,168,76,0.3) 100%)'
                    }} />
                    {/* 그레인 */}
                    <svg className="absolute inset-0 w-full h-full opacity-[0.20]" preserveAspectRatio="none">
                      <filter id="grain-card-2">
                        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
                      </filter>
                      <rect width="100%" height="100%" filter="url(#grain-card-2)" />
                    </svg>
                  </div>

                  {/* ── 콘텐츠 ── */}
                  <div className="relative z-10 flex flex-col h-full">
                    <h4 className="text-white font-bold text-base sm:text-lg mb-3">오류신고</h4>
                    <div className="text-xs sm:text-sm text-white/60 space-y-1.5 mb-auto">
                      <p>24시간 접수 가능</p>
                      <p>확인 후 즉시 수정</p>
                      <p className="text-[#C9A84C]/80">규정 개정 실시간 반영</p>
                    </div>
                    <a href="mailto:cayson0127@gmail.com?subject=[오류신고]%20문제%20오류%20신고합니다" className="mt-3 sm:mt-4 block text-center border border-[#C9A84C]/30 text-[#C9A84C] font-semibold py-2 rounded-lg hover:bg-[#C9A84C]/10 transition-colors text-xs sm:text-sm tracking-wider bg-[#1B2A4A]/30">
                      오류 신고하기
                    </a>
                  </div>
                </div>
              </Reveal>

            </div>
          </div>

        </div>
      </section>

      <VideoPlayerModal
        open={!!playing}
        onClose={() => setPlaying(null)}
        video={playing}
      />

      {locked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4" onClick={() => setLocked(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-xl">🔒</div>
              <h3 className="text-lg font-bold dark:text-white">등급을 올려주세요</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              이 강의는 <span className={`font-bold ${TIER_COLOR[locked.minTier] ?? ''}`}>{TIER_LABEL[locked.minTier] ?? locked.minTier}</span> 등급 이상만 시청할 수 있습니다.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              현재 등급: <span className="font-medium">{TIER_LABEL[userTier] ?? userTier}</span>
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setLocked(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 text-sm font-medium">
                닫기
              </button>
              <Link href="/my" className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg hover:from-amber-600 hover:to-yellow-600 text-sm font-bold">
                등급 업그레이드
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
