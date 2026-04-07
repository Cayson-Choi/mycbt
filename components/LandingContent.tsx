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

/* ─── 등급 데이터 ─── */
const grades = [
  { id: 'technician', label: '기능사', count: 4 },
  { id: 'industrial', label: '산업기사', count: 6 },
  { id: 'engineer', label: '기사', count: 4 },
  { id: 'master', label: '기능장', count: 1 },
  { id: 'public', label: '공기업', count: 0 },
  { id: 'ncs', label: '과정평가형', count: 0 },
]

/* ─── 이벤트 데이터 (내용에 맞는 상세 SVG) ─── */
const events = [
  {
    title: '전 강좌 무료',
    desc: '회원가입 후 모든 기출문제 무료 이용',
    icon: (
      /* 선물 상자 — 리본 + 박스 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="6" y="18" width="28" height="16" rx="2.5" fill="currentColor" opacity="0.2" />
        <rect x="8" y="20" width="24" height="12" rx="1.5" fill="currentColor" opacity="0.12" />
        <rect x="4" y="14" width="32" height="6" rx="2" fill="currentColor" opacity="0.35" />
        <rect x="18" y="14" width="4" height="20" rx="0.5" fill="currentColor" opacity="0.5" />
        <path d="M20 14c-2-4-6-6-8-4s0 6 4 7h4" fill="currentColor" opacity="0.4" />
        <path d="M20 14c2-4 6-6 8-4s0 6-4 7h-4" fill="currentColor" opacity="0.4" />
        <circle cx="20" cy="14" r="2" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
  {
    title: '환승/재수강 할인',
    desc: '타 사이트 이용자 환승 시 혜택 제공',
    icon: (
      /* 할인 티켓 — 톱니 가장자리 + % 표시 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="10" width="32" height="20" rx="3" fill="currentColor" opacity="0.2" />
        <circle cx="4" cy="18" r="3" fill="white" />
        <circle cx="4" cy="24" r="3" fill="white" />
        <circle cx="36" cy="18" r="3" fill="white" />
        <circle cx="36" cy="24" r="3" fill="white" />
        <line x1="15" y1="10" x2="15" y2="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.3" />
        <circle cx="22" cy="17" r="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" fill="none" />
        <circle cx="30" cy="23" r="2" stroke="currentColor" strokeWidth="1.5" opacity="0.6" fill="none" />
        <line x1="22" y1="24" x2="30" y2="16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
        <text x="8" y="23" fontSize="8" fontWeight="900" fill="currentColor" opacity="0.7" fontFamily="system-ui">%</text>
      </svg>
    ),
  },
  {
    title: '실기 복원 참여',
    desc: '실기 시험 복원에 참여하고 포인트 받기',
    icon: (
      /* 시험지 + 연필 — 복원 참여 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="8" y="4" width="20" height="28" rx="2" fill="currentColor" opacity="0.15" />
        <rect x="12" y="10" width="10" height="1.5" rx="0.5" fill="currentColor" opacity="0.4" />
        <rect x="12" y="14" width="12" height="1.5" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="12" y="18" width="8" height="1.5" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="12" y="22" width="11" height="1.5" rx="0.5" fill="currentColor" opacity="0.25" />
        <path d="M28 16l-2.5 12.5L24 30l1.5-1.5L38 16l-2-2-8 2z" fill="currentColor" opacity="0.6" />
        <path d="M36 14l2 2 1.5-1.5c.4-.4.4-1.1 0-1.5l-.5-.5c-.4-.4-1.1-.4-1.5 0L36 14z" fill="currentColor" opacity="0.8" />
        <line x1="28" y1="16" x2="30" y2="18" stroke="white" strokeWidth="0.8" opacity="0.5" />
      </svg>
    ),
  },
  {
    title: '기출 1200제',
    desc: '전기기사 기출 1200제 무료 제공',
    icon: (
      /* 펼쳐진 책 + 페이지 — 문제집 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <path d="M20 8C16 6 10 5 4 6v24c6-1 12 0 16 2" fill="currentColor" opacity="0.15" />
        <path d="M20 8c4-2 10-3 16-2v24c-6-1-12 0-16 2" fill="currentColor" opacity="0.25" />
        <line x1="20" y1="8" x2="20" y2="32" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <rect x="7" y="12" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.35" />
        <rect x="7" y="15" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="7" y="18" width="7" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="7" y="21" width="5" height="1" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="24" y="12" width="7" height="1" rx="0.5" fill="currentColor" opacity="0.4" />
        <rect x="24" y="15" width="5" height="1" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="24" y="18" width="8" height="1" rx="0.5" fill="currentColor" opacity="0.35" />
        <rect x="24" y="21" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.25" />
        <text x="25" y="28" fontSize="7" fontWeight="800" fill="currentColor" opacity="0.5" fontFamily="system-ui">1200</text>
      </svg>
    ),
  },
  {
    title: '친구 추천 이벤트',
    desc: '친구 추천 시 양쪽 모두 혜택',
    icon: (
      /* 두 사람 + 하트 — 친구 추천 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <circle cx="13" cy="14" r="5" fill="currentColor" opacity="0.3" />
        <path d="M4 30c0-5 4-9 9-9s9 4 9 9" fill="currentColor" opacity="0.2" />
        <circle cx="27" cy="14" r="5" fill="currentColor" opacity="0.3" />
        <path d="M18 30c0-5 4-9 9-9s9 4 9 9" fill="currentColor" opacity="0.2" />
        <path d="M20 8l1.5 2.5L24 8c1.5-1.5 4 0 3 2.5-1 2.5-4 5-7 6.5-3-1.5-6-4-7-6.5-1-2.5 1.5-4 3-2.5l2 2.5z" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    title: '합격자 리얼 후기',
    desc: '합격생들의 생생한 후기 확인',
    icon: (
      /* 말풍선 두 개 겹침 — 후기/대화 */
      <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none">
        <rect x="4" y="6" width="22" height="16" rx="3" fill="currentColor" opacity="0.25" />
        <path d="M10 22l-2 5 5-3" fill="currentColor" opacity="0.25" />
        <rect x="8" y="11" width="14" height="1.2" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="8" y="14.5" width="10" height="1.2" rx="0.5" fill="currentColor" opacity="0.2" />
        <rect x="14" y="16" width="22" height="14" rx="3" fill="currentColor" opacity="0.4" />
        <path d="M30 30l2 4.5-4.5-2.5" fill="currentColor" opacity="0.4" />
        <rect x="18" y="20.5" width="12" height="1.2" rx="0.5" fill="white" opacity="0.6" />
        <rect x="18" y="24" width="8" height="1.2" rx="0.5" fill="white" opacity="0.4" />
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

/* ─── 강점 데이터 (내용에 맞는 상세 SVG) ─── */
const strengths = [
  {
    title: '원본 대조 검증',
    desc: '인터넷 복사가 아닙니다. 실제 시험지 원본과 한 문제씩 대조하여 정답과 선택지를 검증합니다.',
    icon: (
      /* 두 장의 문서를 겹쳐놓고 체크마크 — 원본 대조 */
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" fill="currentColor" opacity="0.2" />
        <rect x="8" y="6" width="16" height="20" rx="2" fill="currentColor" opacity="0.35" />
        <rect x="11" y="10" width="4" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="11" y="14" width="8" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="11" y="18" width="6" height="1.5" rx="0.5" fill="currentColor" opacity="0.5" />
        <circle cx="24" cy="24" r="7" fill="currentColor" opacity="0.9" />
        <path d="M21 24l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: '실전 동일 환경',
    desc: '한국산업인력공단 CBT와 동일한 과목 구성, 문항 수, 제한 시간으로 실전 감각을 잡아드립니다.',
    icon: (
      /* 모니터 안에 시험 문제 보기가 보이는 CBT 화면 */
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="4" width="26" height="18" rx="2.5" fill="currentColor" opacity="0.2" />
        <rect x="5" y="6" width="22" height="14" rx="1" fill="currentColor" opacity="0.15" />
        <rect x="8" y="9" width="9" height="1.2" rx="0.5" fill="currentColor" opacity="0.6" />
        <circle cx="8.6" cy="13" r="1.2" fill="currentColor" opacity="0.4" />
        <rect x="11" y="12.2" width="7" height="1.2" rx="0.5" fill="currentColor" opacity="0.4" />
        <circle cx="8.6" cy="16.5" r="1.2" fill="currentColor" opacity="0.9" />
        <rect x="11" y="15.7" width="7" height="1.2" rx="0.5" fill="currentColor" opacity="0.6" />
        <rect x="20" y="9" width="5" height="9" rx="1" fill="currentColor" opacity="0.12" />
        <rect x="21" y="15" width="3" height="2" rx="0.5" fill="currentColor" opacity="0.8" />
        <rect x="11" y="24" width="10" height="2" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="13" y="22" width="6" height="2" fill="currentColor" opacity="0.2" />
      </svg>
    ),
  },
  {
    title: '자동 오답 분석',
    desc: '틀린 문제를 자동으로 분류하고 과목별 약점을 분석합니다. 같은 실수를 반복하지 않도록.',
    icon: (
      /* 막대 그래프 + 돋보기 — 분석 */
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="18" width="4" height="8" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="10" y="12" width="4" height="14" rx="1" fill="currentColor" opacity="0.5" />
        <rect x="16" y="8" width="4" height="18" rx="1" fill="currentColor" opacity="0.7" />
        <rect x="22" y="14" width="4" height="12" rx="1" fill="currentColor" opacity="0.4" />
        <rect x="3" y="26" width="24" height="1.5" rx="0.5" fill="currentColor" opacity="0.2" />
        <circle cx="24" cy="10" r="5" stroke="currentColor" strokeWidth="2" opacity="0.8" fill="none" />
        <line x1="27.5" y1="13.5" x2="30" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
      </svg>
    ),
  },
  {
    title: '24시간 오류 수정',
    desc: '오류가 발견되면 24시간 이내에 수정합니다. 규정 개정 사항도 실시간으로 반영합니다.',
    icon: (
      /* 시계 + 렌치(수리 도구) — 빠른 수정 */
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="14" cy="16" r="10" fill="currentColor" opacity="0.15" />
        <circle cx="14" cy="16" r="8" stroke="currentColor" strokeWidth="1.8" opacity="0.6" fill="none" />
        <line x1="14" y1="10" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <line x1="14" y1="16" x2="18.5" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M26 11l-3.5 3.5M22.5 14.5l1.5 1.5 5-5-1.5-1.5M22.5 14.5l-1.5-1.5" fill="currentColor" opacity="0.7" />
        <path d="M24 9.5l2.5-2.5c.5-.5 1.3-.5 1.8 0l.7.7c.5.5.5 1.3 0 1.8L26.5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" fill="none" />
        <rect x="21.5" y="13" width="2.5" height="5" rx="0.8" transform="rotate(-45 21.5 13)" fill="currentColor" opacity="0.6" />
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
            <div className="flex gap-0 bg-gray-100 dark:bg-gray-900 rounded-xl p-1 mb-8 overflow-x-auto scrollbar-hide max-w-fit">
              {grades.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 sm:px-6 py-2.5 text-sm font-semibold whitespace-nowrap rounded-lg transition-all
                    ${activeTab === i
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {g.label}
                  {g.count > 0 && (
                    <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${activeTab === i
                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
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
                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-900 border border-blue-100 dark:border-gray-800 rounded-2xl p-6 sm:p-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                        {/* 자격증 문서 + 체크 */}
                        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                          <rect x="3" y="1" width="11" height="15" rx="1.5" fill="white" opacity="0.3" />
                          <rect x="5" y="4" width="6" height="1" rx="0.5" fill="white" opacity="0.5" />
                          <rect x="5" y="7" width="4" height="1" rx="0.5" fill="white" opacity="0.4" />
                          <rect x="5" y="10" width="5" height="1" rx="0.5" fill="white" opacity="0.35" />
                          <circle cx="14" cy="14" r="5" fill="white" opacity="0.9" />
                          <path d="M11.5 14l1.5 1.5 3-3" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {grades[activeTab].label}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 ml-[52px]">
                      {grades[activeTab].count}개 자격증 필기/실기 준비
                    </p>
                  </div>
                  <Link
                    href={`/grade/${grades[activeTab].id}`}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors flex-shrink-0 shadow-lg shadow-blue-600/25"
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
              <Reveal key={ev.title} delay={i * 80}>
                <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 h-full transition-all hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/20 hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
                      {ev.icon}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5">
                      {ev.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {ev.desc}
                    </p>
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
      <section className="bg-amber-50 dark:bg-amber-950/20">
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
                  className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white dark:bg-gray-800 rounded-2xl p-6 border border-amber-100 dark:border-gray-700 shadow-sm"
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
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
          SECTION 5 -- CTA
         ════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
          <Reveal>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              지금 시작하면, 다음 시험이 마지막입니다
            </h3>
            <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              검증된 문제로 실전처럼 연습하세요. 회원가입 후 무료로 시작할 수 있습니다.
            </p>
            <a
              href="#exams"
              className="inline-block bg-white text-blue-600 font-bold px-8 py-3.5 rounded-xl text-sm sm:text-base hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/25"
            >
              무료로 시작하기
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
