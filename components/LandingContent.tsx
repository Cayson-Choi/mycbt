'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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

/* ─── 등급 데이터 (탭별 고유 색상 + SVG) ─── */
const grades = [
  {
    id: 'technician', label: '기능사', count: 4,
    gradient: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="3" fill="white" opacity="0.3" />
        <path d="M7 10l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'industrial', label: '산업기사', count: 6,
    gradient: 'from-violet-500 to-purple-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="11" rx="2" fill="white" opacity="0.3" />
        <rect x="4" y="7" width="12" height="7" rx="1" fill="white" opacity="0.2" />
        <circle cx="10" cy="10.5" r="2" fill="white" opacity="0.8" />
        <rect x="7" y="16" width="6" height="1.5" rx="0.5" fill="white" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'engineer', label: '기사', count: 4,
    gradient: 'from-blue-500 to-indigo-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l8 5v6l-8 5-8-5V7l8-5z" fill="white" opacity="0.25" />
        <path d="M10 2l8 5-8 5-8-5 8-5z" fill="white" opacity="0.4" />
        <circle cx="10" cy="10" r="2.5" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'master', label: '기능장', count: 1,
    gradient: 'from-amber-500 to-orange-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <path d="M10 2l2.5 5 5.5.8-4 3.9.9 5.3-4.9-2.6L5.1 17l.9-5.3-4-3.9L7.5 7 10 2z" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 'public', label: '공기업', count: 0,
    gradient: 'from-cyan-500 to-blue-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="6" width="10" height="12" rx="1" fill="white" opacity="0.3" />
        <rect x="3" y="4" width="14" height="4" rx="1" fill="white" opacity="0.4" />
        <rect x="8" y="14" width="4" height="4" fill="white" opacity="0.5" />
        <rect x="7" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.5" />
        <rect x="11" y="8" width="2" height="2" rx="0.5" fill="white" opacity="0.5" />
        <rect x="7" y="11.5" width="2" height="2" rx="0.5" fill="white" opacity="0.5" />
        <rect x="11" y="11.5" width="2" height="2" rx="0.5" fill="white" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'ncs', label: '과정평가형', count: 0,
    gradient: 'from-rose-500 to-pink-600',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="2" width="14" height="16" rx="2" fill="white" opacity="0.3" />
        <rect x="6" y="5" width="8" height="1.5" rx="0.5" fill="white" opacity="0.6" />
        <rect x="6" y="8" width="5" height="1.5" rx="0.5" fill="white" opacity="0.4" />
        <path d="M6 12l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
    ),
  },
]

/* ─── 이벤트 데이터 (engineerlab 스타일 — 좌상 제목 + 우상 뱃지 + 좌하 CTA + 우하 일러스트) ─── */
const events = [
  {
    title: '전 강좌\n무료 이벤트',
    badge: '가입혜택',
    cta: '추가 무료/할인 혜택,\n무료 교재까지',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="20" y="35" width="40" height="32" rx="4" fill="#60a5fa" />
        <rect x="18" y="30" width="44" height="10" rx="3" fill="#3b82f6" />
        <rect x="36" y="30" width="8" height="37" rx="1" fill="#2563eb" opacity="0.6" />
        <path d="M40 30c-4-8-12-10-14-6s2 10 8 12h6" fill="#f472b6" />
        <path d="M40 30c4-8 12-10 14-6s-2 10-8 12h-6" fill="#fb7185" />
        <circle cx="40" cy="30" r="4" fill="#e11d48" />
        <path d="M22 22c0-2 2-4 4-2s-1 5-4 6" fill="#f9a8d4" />
        <path d="M58 18c0-2-2-4-4-2s1 5 4 6" fill="#fda4af" />
        <circle cx="28" cy="16" r="2" fill="#fbbf24" />
        <circle cx="54" cy="22" r="1.5" fill="#fb923c" />
      </svg>
    ),
  },
  {
    title: '환승/재수강/\n내배카 할인',
    badge: '전원',
    cta: '인증 시 인강\n할인 혜택',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="12" y="20" width="48" height="38" rx="6" fill="#fde68a" />
        <rect x="12" y="20" width="48" height="14" rx="6" fill="#fbbf24" />
        <rect x="30" y="28" width="12" height="18" rx="2" fill="white" opacity="0.7" />
        <text x="32" y="42" fontSize="14" fontWeight="900" fill="#ea580c" fontFamily="system-ui">%</text>
        <path d="M52 16l3-4 3 2-4 4" fill="#f472b6" />
        <path d="M58 22l4-2 2 3-4 2" fill="#a78bfa" />
        <circle cx="18" cy="18" r="3" fill="#34d399" />
        <rect x="62" y="38" width="6" height="6" rx="1" transform="rotate(15 62 38)" fill="#fb923c" />
        <circle cx="10" cy="44" r="2" fill="#60a5fa" />
      </svg>
    ),
  },
  {
    title: '실기 복원\n사전 신청',
    badge: '전원',
    cta: '전기기사 복원\n참여하면 합격지원',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <circle cx="40" cy="40" r="28" fill="#fecdd3" />
        <circle cx="40" cy="40" r="22" fill="#fb7185" />
        <circle cx="40" cy="40" r="16" fill="#e11d48" />
        <polygon points="35,30 35,50 55,40" fill="white" />
      </svg>
    ),
  },
  {
    title: '필수기출1200제\nYoutube',
    badge: 'ONLY',
    cta: '전기기사\n대표유형 뽀개기',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="18" y="10" width="38" height="60" rx="8" fill="#fca5a5" />
        <rect x="20" y="16" width="34" height="48" rx="4" fill="white" />
        <rect x="22" y="18" width="30" height="36" rx="2" fill="#fee2e2" />
        <circle cx="37" cy="36" r="10" fill="#ef4444" />
        <polygon points="34,30 34,42 44,36" fill="white" />
        <rect x="32" y="58" width="10" height="3" rx="1.5" fill="#d1d5db" />
      </svg>
    ),
  },
  {
    title: '카톡 친구\n추천 이벤트',
    badge: '전원',
    cta: '교재, 강의,\n기프티콘 등 선물',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <path d="M14 55V30c0-2 2-4 4-4h44c2 0 4 2 4 4v25l-26 12-26-12z" fill="#fbbf24" />
        <path d="M14 30l26 18 26-18" fill="#f59e0b" />
        <path d="M14 55l26-12 26 12" fill="#fde68a" />
        <path d="M34 20c0-4 3-7 6-7s6 3 6 7c0 5-6 9-6 9s-6-4-6-9z" fill="#f472b6" />
        <path d="M28 26c0-3 2-5 4-5s4 2 4 5c0 4-4 6-4 6s-4-2-4-6z" fill="#fb7185" opacity="0.7" />
        <path d="M44 24c0-3 2-5 4-5s4 2 4 5c0 4-4 6-4 6s-4-2-4-6z" fill="#fda4af" opacity="0.8" />
      </svg>
    ),
  },
  {
    title: '합격자들의\n리얼 합격후기',
    badge: null,
    cta: '생생한 합격후기를\n남겨주세요!',
    illust: (
      <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
        <rect x="16" y="8" width="40" height="52" rx="4" fill="#bfdbfe" />
        <rect x="20" y="14" width="28" height="3" rx="1" fill="#3b82f6" opacity="0.4" />
        <rect x="20" y="20" width="20" height="3" rx="1" fill="#3b82f6" opacity="0.3" />
        <rect x="20" y="26" width="24" height="3" rx="1" fill="#3b82f6" opacity="0.35" />
        <rect x="20" y="32" width="16" height="3" rx="1" fill="#3b82f6" opacity="0.25" />
        <rect x="20" y="38" width="22" height="3" rx="1" fill="#3b82f6" opacity="0.3" />
        <circle cx="56" cy="52" r="16" fill="#60a5fa" />
        <circle cx="56" cy="46" r="6" fill="white" />
        <path d="M46 60c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="white" />
      </svg>
    ),
  },
]

/* ─── 합격 수기 데이터 ─── */
const testimonials = [
  {
    name: '김도현',
    tags: ['#전기기사', '#3개월합격', '#직장인'],
    quote: '퇴근 후 매일 1시간씩 CAYSON으로 기출만 반복했습니다. 오답노트 기능이 정말 큰 도움이 됐고, 실전과 동일한 환경 덕분에 시험장에서도 긴장 없이 풀 수 있었습니다.',
  },
  {
    name: '박서연',
    tags: ['#전기산업기사', '#비전공자', '#1회합격'],
    quote: '비전공이라 걱정이 많았는데 CAYSON의 과목별 분석 기능으로 약점을 파악하고 집중 공부했더니 1회 만에 합격했습니다. 문제 검증이 잘 되어있어서 믿고 풀었어요.',
  },
  {
    name: '이준혁',
    tags: ['#전기기능사', '#고등학생', '#2주합격'],
    quote: '학교 선생님 추천으로 시작했는데, 다른 사이트랑 다르게 오류가 거의 없어서 좋았습니다. 모바일로도 잘 되니까 통학 시간에 틈틈이 풀었어요.',
  },
  {
    name: '최유진',
    tags: ['#전기기사', '#육아맘', '#독학합격'],
    quote: '아이 재우고 새벽에 공부했는데, CAYSON은 깔끔하고 빠르게 문제만 풀 수 있어서 효율적이었습니다. 불필요한 기능 없이 핵심만 있는 점이 마음에 들었어요.',
  },
  {
    name: '정민수',
    tags: ['#전기기능장', '#현장경력20년', '#재도전'],
    quote: '세 번째 도전이었는데 이번에는 CAYSON으로 기출 패턴을 분석하면서 풀었더니 합격했습니다. 규정 개정 반영이 빨라서 구 규정 문제에 속지 않았어요.',
  },
]

/* ─── 강점 데이터 (컬러풀 SVG) ─── */
const strengths = [
  {
    title: '원본 대조 검증',
    desc: '인터넷 복사가 아닙니다. 실제 시험지 원본과 한 문제씩 대조하여 정답과 선택지를 검증합니다.',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" fill="#a7f3d0" />
        <rect x="8" y="6" width="16" height="20" rx="2" fill="#6ee7b7" />
        <rect x="11" y="10" width="4" height="1.5" rx="0.5" fill="#047857" opacity="0.5" />
        <rect x="11" y="14" width="8" height="1.5" rx="0.5" fill="#047857" opacity="0.4" />
        <rect x="11" y="18" width="6" height="1.5" rx="0.5" fill="#047857" opacity="0.35" />
        <circle cx="24" cy="24" r="7" fill="#059669" />
        <path d="M21 24l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '실전 동일 환경',
    desc: '한국산업인력공단 CBT와 동일한 과목 구성, 문항 수, 제한 시간으로 실전 감각을 잡아드립니다.',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/30',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="4" width="26" height="18" rx="2.5" fill="#c7d2fe" />
        <rect x="5" y="6" width="22" height="14" rx="1" fill="#818cf8" opacity="0.3" />
        <rect x="8" y="9" width="9" height="1.2" rx="0.5" fill="#4338ca" opacity="0.6" />
        <circle cx="8.6" cy="13" r="1.2" fill="#a5b4fc" />
        <rect x="11" y="12.2" width="7" height="1.2" rx="0.5" fill="#4338ca" opacity="0.4" />
        <circle cx="8.6" cy="16.5" r="1.2" fill="#4f46e5" />
        <rect x="11" y="15.7" width="7" height="1.2" rx="0.5" fill="#4338ca" opacity="0.5" />
        <rect x="20" y="9" width="5" height="9" rx="1" fill="#e0e7ff" />
        <rect x="21" y="15" width="3" height="2" rx="0.5" fill="#4f46e5" />
        <rect x="11" y="24" width="10" height="2" rx="1" fill="#a5b4fc" />
        <rect x="13" y="22" width="6" height="2" fill="#c7d2fe" />
      </svg>
    ),
  },
  {
    title: '자동 오답 분석',
    desc: '틀린 문제를 자동으로 분류하고 과목별 약점을 분석합니다. 같은 실수를 반복하지 않도록.',
    iconBg: 'bg-amber-50 dark:bg-amber-950/30',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="18" width="4" height="8" rx="1" fill="#fcd34d" />
        <rect x="10" y="12" width="4" height="14" rx="1" fill="#f59e0b" />
        <rect x="16" y="8" width="4" height="18" rx="1" fill="#d97706" />
        <rect x="22" y="14" width="4" height="12" rx="1" fill="#fbbf24" />
        <rect x="3" y="26" width="24" height="1.5" rx="0.5" fill="#92400e" opacity="0.2" />
        <circle cx="24" cy="10" r="5" stroke="#ea580c" strokeWidth="2" fill="white" opacity="0.9" />
        <line x1="27.5" y1="13.5" x2="30" y2="16" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: '24시간 오류 수정',
    desc: '오류가 발견되면 24시간 이내에 수정합니다. 규정 개정 사항도 실시간으로 반영합니다.',
    iconBg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="16" r="10" fill="#ede9fe" />
        <circle cx="14" cy="16" r="8" stroke="#7c3aed" strokeWidth="1.8" fill="none" />
        <line x1="14" y1="10" x2="14" y2="16" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="16" x2="18.5" y2="16" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="14" cy="16" r="1.5" fill="#7c3aed" />
        <path d="M24 9.5l2.5-2.5c.5-.5 1.3-.5 1.8 0l.7.7c.5.5.5 1.3 0 1.8L26.5 12" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <rect x="22" y="13" width="2.5" height="5.5" rx="0.8" transform="rotate(-45 22 13)" fill="#fbbf24" />
        <rect x="24.5" y="10.5" width="2" height="3" rx="0.5" transform="rotate(-45 24.5 10.5)" fill="#f59e0b" />
      </svg>
    ),
  },
]

export default function LandingContent() {
  const [activeTab, setActiveTab] = useState(0)


  return (
    <>
      {/* ════════════════════════════════════════
          SECTION 1 -- 교육과정 (등급 탭 + 카드)
         ════════════════════════════════════════ */}
      <section id="exams" className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
                Curriculum
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                교육과정
              </h2>
              <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full" />
            </div>
          </Reveal>

          {/* 탭 */}
          <Reveal delay={100}>
            <div className="flex gap-0 bg-gray-100 dark:bg-gray-900 rounded-xl p-1.5 mb-8 overflow-x-auto scrollbar-hide max-w-fit">
              {grades.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold whitespace-nowrap rounded-lg transition-all
                    ${activeTab === i
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                  {g.label}
                  {g.count > 0 && (
                    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded
                      ${activeTab === i
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                      {g.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Reveal>

          {/* 탭 콘텐츠 */}
          <Reveal delay={150}>
            <div className="min-h-[120px]">
              {grades[activeTab].count > 0 ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-8 gap-4 sm:gap-0">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${grades[activeTab].gradient} flex items-center justify-center shadow-lg`}>
                        {grades[activeTab].icon}
                      </div>
                      <h3 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {grades[activeTab].label}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-[46px] sm:ml-[52px]">
                      {grades[activeTab].count}개 자격증 필기/실기 준비
                    </p>
                  </div>
                  <Link
                    href={`/grade/${grades[activeTab].id}`}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl transition-colors flex-shrink-0 shadow-lg shadow-blue-600/25 w-full sm:w-auto"
                  >
                    자격증 선택
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-400 flex items-center justify-center mx-auto mb-3">
                    {/* 공사중 표시 — 삼각형 + 느낌표 */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3L2 21h20L12 3z" fill="currentColor" opacity="0.2" />
                      <path d="M12 3L2 21h20L12 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5" fill="none" />
                      <line x1="12" y1="10" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                      <circle cx="12" cy="17.5" r="1" fill="currentColor" opacity="0.6" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">준비 중입니다. 곧 서비스가 시작됩니다.</p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 -- 진행중인 이벤트
         ════════════════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
                Events
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                진행중인 이벤트
              </h2>
              <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {events.map((ev, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 h-full transition-all hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden min-h-[140px] sm:min-h-[170px]">
                  {/* 좌상단: 제목 */}
                  <h3 className="text-sm sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight whitespace-pre-line pr-12 sm:pr-16">
                    {ev.title}
                  </h3>
                  {/* 우상단: 뱃지 */}
                  {ev.badge && (
                    <div className="absolute top-3 right-3 sm:top-5 sm:right-5 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-gray-600 dark:bg-gray-500 text-white text-[8px] sm:text-[10px] font-bold flex items-center justify-center text-center leading-tight">
                      {ev.badge}
                    </div>
                  )}
                  {/* 좌하단: CTA */}
                  <p className="absolute bottom-3 left-4 sm:bottom-5 sm:left-6 text-[11px] sm:text-sm text-blue-600 dark:text-blue-400 font-medium leading-snug whitespace-pre-line max-w-[55%]">
                    {ev.cta} <span className="inline-block ml-0.5">&rarr;</span>
                  </p>
                  {/* 우하단: 일러스트 */}
                  <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 transition-transform group-hover:scale-110 w-[48px] h-[48px] sm:w-[72px] sm:h-[72px]">
                    {ev.illust}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 -- 합격 수기
         ════════════════════════════════════════ */}
      <section className="bg-amber-50 dark:bg-amber-950/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14 text-center">
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 tracking-wide uppercase mb-2">
                Real Reviews
              </p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight max-w-2xl mx-auto leading-snug">
                광고가 아닌, 수험생들의 진심
                <br className="hidden sm:block" />
                그리고 합격만으로 증명하겠습니다
              </h2>
              <div className="w-12 h-1 bg-amber-500 mt-4 rounded-full mx-auto" />
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
                  className="flex-shrink-0 w-[240px] sm:w-[320px] lg:w-[340px] bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-amber-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, s) => (
                      <svg key={s} className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.tags.map((tag) => (
                      <span key={`${tag}-${i}`} className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 -- CAYSON이 다른 이유
         ════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14 text-center">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
                Why CAYSON
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                CAYSON이 다른 이유
              </h2>
              <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full mx-auto" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 h-full transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-xl hover:shadow-blue-50/50 dark:hover:shadow-blue-950/20 hover:-translate-y-0.5">
                  <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                    {s.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 -- 고객센터 + CTA (engineerlab 스타일)
         ════════════════════════════════════════ */}
      <section className="relative bg-gray-900 overflow-hidden">
        {/* 어두운 오버레이 배경 */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            {/* 좌측: 텍스트 */}
            <Reveal>
              <div className="lg:flex-shrink-0 lg:w-[340px]">
                <p className="text-white/60 text-base sm:text-xl mb-3 sm:mb-4 leading-relaxed">
                  <span className="text-emerald-400 font-bold">CAYSON</span>은<br />언제나 열려있습니다
                </p>
                <h3 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  여러분의 <span className="text-amber-400">합격</span>만을<br />위해 노력하겠습니다
                </h3>
              </div>
            </Reveal>

            {/* 우측: 3개 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 flex-1 w-full">
              <Reveal delay={100}>
                <div className="bg-slate-700/80 backdrop-blur rounded-xl p-5 sm:p-6 h-full flex flex-col">
                  <h4 className="text-white font-bold text-base sm:text-lg mb-1">CAYSON</h4>
                  <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">고객센터</h4>
                  <div className="text-sm text-gray-300 space-y-1 mb-auto">
                    <p>평일: 10:00~18:00</p>
                    <p>점심시간: 12:30~13:30</p>
                    <p className="text-yellow-400">주말, 공휴일 휴무</p>
                  </div>
                  <a href="mailto:support@mycbt.xyz" className="mt-5 block text-center border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    이메일 문의하기
                  </a>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="bg-slate-600/80 backdrop-blur rounded-xl p-5 sm:p-6 h-full flex flex-col">
                  <h4 className="text-white font-bold text-base sm:text-lg mb-1">오류 신고</h4>
                  <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">센터</h4>
                  <div className="text-sm text-gray-300 space-y-1 mb-auto">
                    <p>24시간 접수 가능</p>
                    <p>확인 후 즉시 수정</p>
                    <p className="text-yellow-400">규정 개정 실시간 반영</p>
                  </div>
                  <a href="mailto:error@mycbt.xyz" className="mt-5 block text-center border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    오류 신고하기
                  </a>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="bg-blue-400/40 backdrop-blur rounded-xl p-5 sm:p-6 h-full flex flex-col">
                  <h4 className="text-white font-bold text-base sm:text-lg mb-1">CAYSON</h4>
                  <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">자주 묻는 질문</h4>
                  <div className="text-sm text-gray-200 space-y-1 mb-auto">
                    <p>회원가입, 시험 응시,</p>
                    <p>점수 확인, 오답노트 등</p>
                    <p>궁금한 점을 확인하세요</p>
                  </div>
                  <a href="#exams" className="mt-5 block text-center border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    FAQ 확인하기
                  </a>
                </div>
              </Reveal>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-8 text-center lg:text-right">
            * 문의는 이메일로 접수되며, 영업일 기준 24시간 이내 답변드립니다.
          </p>
        </div>
      </section>
    </>
  )
}
