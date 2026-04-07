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

/* ─── 강점 데이터 ─── */
const strengths = [
  {
    title: '원본 대조 검증',
    desc: '인터넷 복사가 아닙니다. 실제 시험지 원본과 한 문제씩 대조하여 정답과 선택지를 검증합니다.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: '실전 동일 환경',
    desc: '한국산업인력공단 CBT와 동일한 과목 구성, 문항 수, 제한 시간으로 실전 감각을 잡아드립니다.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
      </svg>
    ),
  },
  {
    title: '자동 오답 분석',
    desc: '틀린 문제를 자동으로 분류하고 과목별 약점을 분석합니다. 같은 실수를 반복하지 않도록.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    title: '24시간 오류 수정',
    desc: '오류가 발견되면 24시간 이내에 수정합니다. 규정 개정 사항도 실시간으로 반영합니다.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

/* ─── 비교 데이터 ─── */
const comparisons = [
  { label: '문제 출처', other: '인터넷 복사', cayson: '원본 시험지 대조' },
  { label: '정답 검증', other: '미검증', cayson: '전문가 교차 검증' },
  { label: '오류 대응', other: '방치', cayson: '24시간 내 수정' },
  { label: '해설', other: '없음 또는 부실', cayson: '전 문제 수록' },
  { label: '규정 반영', other: '구 규정 방치', cayson: '실시간 업데이트' },
]

export default function LandingContent() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <>
      {/* ════════════════════════════════════════
          SECTION 1 — 교육과정 (등급 탭 + 카드)
         ════════════════════════════════════════ */}
      <section id="exams" className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <Reveal>
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                교육과정
              </h2>
              <div className="w-10 h-[3px] bg-blue-600 mt-3" />
            </div>
          </Reveal>

          {/* 탭 */}
          <Reveal delay={100}>
            <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-8 overflow-x-auto scrollbar-hide">
              {grades.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors
                    ${activeTab === i
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  {g.label}
                  {g.count > 0 && (
                    <span className="ml-1.5 text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                      {g.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Reveal>

          {/* 탭 콘텐츠 */}
          <div className="min-h-[120px]">
            {grades[activeTab].count > 0 ? (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 sm:p-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {grades[activeTab].label}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {grades[activeTab].count}개 자격증 필기/실기 준비
                  </p>
                </div>
                <Link
                  href={`/grade/${grades[activeTab].id}`}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors flex-shrink-0"
                >
                  자격증 선택
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 text-center">
                <p className="text-sm text-gray-400 dark:text-gray-500">준비 중입니다. 곧 서비스가 시작됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — 핵심 강점
         ════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <Reveal>
            <div className="mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                CAYSON이 다른 이유
              </h2>
              <div className="w-10 h-[3px] bg-blue-600 mt-3" />
            </div>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {strengths.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="group border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 h-full transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-950/30">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-600 transition-colors">
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
          SECTION 4 — 비교표
         ════════════════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <Reveal>
            <div className="mb-8 sm:mb-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                같은 기출, 다른 결과
              </h2>
              <div className="w-10 h-[3px] bg-blue-600 mt-3 mx-auto" />
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* 헤더 */}
              <div className="grid grid-cols-3 text-xs sm:text-sm font-bold border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 sm:p-4 text-gray-500 dark:text-gray-400" />
                <div className="p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900/50">타 사이트</div>
                <div className="p-3 sm:p-4 text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30">CAYSON</div>
              </div>
              {/* 행 */}
              {comparisons.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-3 text-xs sm:text-sm ${
                    i < comparisons.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''
                  }`}
                >
                  <div className="p-3 sm:p-4 font-semibold text-gray-700 dark:text-gray-300">{row.label}</div>
                  <div className="p-3 sm:p-4 text-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/30">{row.other}</div>
                  <div className="p-3 sm:p-4 text-center text-gray-900 dark:text-white font-medium bg-blue-50/50 dark:bg-blue-950/20">{row.cayson}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 — CTA
         ════════════════════════════════════════ */}
      <section className="bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <Reveal>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              지금 시작하면, 다음 시험이 마지막입니다
            </h3>
            <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-lg mx-auto">
              검증된 문제로 실전처럼 연습하세요. 회원가입 후 무료로 시작할 수 있습니다.
            </p>
            <a
              href="#exams"
              className="inline-block bg-white text-blue-600 font-bold px-8 py-3.5 rounded-lg text-sm sm:text-base hover:bg-blue-50 transition-colors"
            >
              무료로 시작하기
            </a>
          </Reveal>
        </div>
      </section>
    </>
  )
}
