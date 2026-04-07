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
    gradient: 'from-teal-50 to-cyan-100 dark:from-teal-950/50 dark:to-cyan-900/30',
    icon: <img src="/hero/deco/425117-achievement-reward-award.svg" alt="" className="w-8 h-8" />,
  },
  {
    id: 'industrial', label: '산업기사', count: 6,
    gradient: 'from-pink-50 to-fuchsia-100 dark:from-pink-950/50 dark:to-fuchsia-900/30',
    icon: <img src="/hero/deco/429900-setting-configuration-gear.svg" alt="" className="w-8 h-8" />,
  },
  {
    id: 'engineer', label: '기사', count: 4,
    gradient: 'from-indigo-50 to-purple-100 dark:from-indigo-950/50 dark:to-purple-900/30',
    icon: <img src="/hero/deco/382151-education-graduation-learning-school-study.svg" alt="" className="w-8 h-8" />,
  },
  {
    id: 'master', label: '기능장', count: 1,
    gradient: 'from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/30',
    icon: <img src="/hero/deco/475312-trophy.svg" alt="" className="w-8 h-8" />,
  },
  {
    id: 'public', label: '공기업', count: 0,
    gradient: 'from-amber-50 to-yellow-100 dark:from-amber-950/50 dark:to-yellow-900/30',
    icon: <img src="/hero/deco/421954-apartment-block-building.svg" alt="" className="w-8 h-8" />,
  },
  {
    id: 'ncs', label: '과정평가형', count: 0,
    gradient: 'from-blue-50 to-sky-100 dark:from-blue-950/50 dark:to-sky-900/30',
    icon: <img src="/hero/deco/375339-certificate-authority-service.svg" alt="" className="w-8 h-8" />,
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
/* ─── 카운터 애니메이션 훅 ─── */
function useCountUp(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOnView || !ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.3 }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView, started])

  useEffect(() => {
    if (!started) return
    let frame: number
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return { count, ref }
}

/* ─── CAYSON이 다른 이유 — 인터랙티브 섹션 ─── */
function WhyCaysonSection() {
  const stat1 = useCountUp(2100)
  const stat2 = useCountUp(100)
  const stat3 = useCountUp(58)
  const stat4 = useCountUp(21)

  const compareRows = [
    { label: '문제 출처', others: '인터넷 복사', cayson: '시험지 원본 대조', icon: '1' },
    { label: '정답 검증', others: '검증 없음', cayson: 'AI + 수동 이중 검증', icon: '2' },
    { label: '오류 수정', others: '미수정 방치', cayson: '발견 즉시 수정 (58건)', icon: '3' },
    { label: '시험 환경', others: '단순 문제풀이', cayson: '실제 CBT 동일 구현', icon: '4' },
    { label: '오답 분석', others: '정답만 표시', cayson: '과목별 자동 약점 분석', icon: '5' },
    { label: '규정 반영', others: '업데이트 없음', cayson: '개정 사항 실시간 반영', icon: '6' },
  ]

  return (
    <section className="bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* 헤더 */}
        <Reveal>
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
              Why CAYSON
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
              왜 <span className="text-blue-600">CAYSON</span>이어야 할까요?
            </h2>
            <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full mx-auto" />
          </div>
        </Reveal>

        {/* 숫자 스탯 리본 */}
        <Reveal delay={100}>
          <div ref={stat1.ref} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            {[
              { val: stat1.count, suffix: '+', label: '검증된 문제', color: 'from-blue-600 to-blue-400' },
              { val: stat2.count, suffix: '%', label: '원본 일치율', color: 'from-emerald-600 to-emerald-400' },
              { val: stat3.count, suffix: '건', label: '오류 수정 완료', color: 'from-amber-600 to-amber-400' },
              { val: stat4.count, suffix: '개', label: '시험 종류', color: 'from-violet-600 to-violet-400' },
            ].map((s) => (
              <div key={s.label} className="relative group text-center bg-gray-50 dark:bg-gray-900 rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${s.color} transition-all duration-700`} style={{ width: `${stat1.count > 0 ? 100 : 0}%` }} />
                <p className={`text-3xl sm:text-4xl lg:text-5xl font-black tabular-nums bg-gradient-to-r ${s.color} text-transparent bg-clip-text`}>
                  {s.val.toLocaleString()}<span className="text-xl sm:text-2xl">{s.suffix}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* 비교 테이블 */}
        <Reveal delay={200}>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[1.5fr_1fr_1fr] text-center">
              <div className="p-3 sm:p-4" />
              <div className="p-3 sm:p-4 bg-gray-100 dark:bg-gray-800/50">
                <p className="text-xs sm:text-sm font-bold text-gray-400 dark:text-gray-500">다른 CBT 사이트</p>
              </div>
              <div className="p-3 sm:p-4 bg-blue-600">
                <p className="text-xs sm:text-sm font-bold text-white">CAYSON</p>
              </div>
            </div>
            {/* 비교 행 */}
            {compareRows.map((row, i) => (
              <Reveal key={row.label} delay={250 + i * 60}>
                <div className="grid grid-cols-[1fr_1fr_1fr] sm:grid-cols-[1.5fr_1fr_1fr] items-center border-t border-gray-200 dark:border-gray-800 group hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                  {/* 항목명 */}
                  <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold flex items-center justify-center">
                      {row.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{row.label}</span>
                  </div>
                  {/* 다른 사이트 */}
                  <div className="p-3 sm:p-4 text-center bg-gray-100/50 dark:bg-gray-800/30">
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                      <span className="text-[10px] sm:text-xs text-gray-400 leading-tight">{row.others}</span>
                    </div>
                  </div>
                  {/* CAYSON */}
                  <div className="p-3 sm:p-4 text-center bg-blue-50/60 dark:bg-blue-950/30">
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      <span className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-semibold leading-tight">{row.cayson}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* 하단 CTA */}
        <Reveal delay={600}>
          <div className="mt-10 sm:mt-14 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">검증된 문제로 공부하면 합격이 가까워집니다</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl text-sm sm:text-base transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              지금 무료로 시작하기
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function LandingContent() {
  const [activeTab, setActiveTab] = useState(0)


  return (
    <>
      {/* ════════════════════════════════════════
          SECTION 1 -- 과정별 CBT (등급 탭 + 카드)
         ════════════════════════════════════════ */}
      <section id="exams" className="bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
                CBT Practice
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                과정별 CBT
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
          SECTION 2 -- 동영상 강의 (airklass 스타일)
         ════════════════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <Reveal>
            <div className="mb-10 sm:mb-14">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">
                Video Lectures
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                동영상 강의
              </h2>
              <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full" />
            </div>
          </Reveal>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Y 프로모 배너 카드 — 전기기사 */}
            <Reveal>
              <div className="rounded-xl overflow-hidden h-full bg-gradient-to-br from-orange-400 to-amber-500 p-5 sm:p-6 flex flex-col justify-between min-h-[220px] sm:min-h-[280px] relative cursor-pointer group">
                {/* 배경 큰 Y 글자 */}
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] sm:text-[220px] font-black text-orange-300/40 select-none leading-none transition-transform duration-500 group-hover:scale-110">
                  Y
                </span>
                <div className="relative z-10">
                  <p className="text-[10px] sm:text-xs font-bold text-white/70 tracking-wider uppercase mb-1">Engineer</p>
                  <h3 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                    전기기사<br />동영상 강의
                  </h3>
                </div>
                <p className="relative z-10 text-xs sm:text-sm text-white/80 font-medium mt-4">
                  더 보러 가기 <span className="ml-0.5 inline-block transition-transform group-hover:translate-x-1">&rsaquo;</span>
                </p>
              </div>
            </Reveal>

            {[
              { title: '전기자기학 핵심 이론 완성', stars: '4.8(52)', hours: '32시간' },
              { title: '전력공학 핵심 공식 마스터', stars: '4.7(29)', hours: '28시간' },
              { title: '전기기기 구조와 원리 총정리', stars: '4.9(67)', hours: '26시간' },
              { title: '회로이론 및 제어공학 집중반', stars: '4.5(41)', hours: '30시간' },
              { title: '전기설비기술기준 조문 해설', stars: '4.8(33)', hours: '18시간' },
              { title: '전기기사 필기 실전 모의고사', stars: '4.6(38)', hours: '24시간' },
              { title: '전기기사 과목별 오답 분석 특강', stars: '4.9(45)', hours: '16시간' },
            ].map((lec, i) => (
              <Reveal key={lec.title} delay={(i + 1) * 80}>
                <div className="group rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden h-full bg-white dark:bg-gray-900 hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 dark:text-gray-600 mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">준비중</span>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-1">{lec.title}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-2">CAYSON</p>
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500">
                      <span className="text-amber-500">&#9733;</span>
                      <span>{lec.stars}</span>
                      <span className="text-gray-300">|</span>
                      <span>{lec.hours}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mt-2 text-right">무료</p>
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
          SECTION 4 -- CAYSON이 다른 이유 (인터랙티브)
         ════════════════════════════════════════ */}
      <WhyCaysonSection />

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
                  여러분의 <span className="text-amber-400">합격</span>만을 위해<br />노력하겠습니다
                </h3>
              </div>
            </Reveal>

            {/* 우측: 3개 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 flex-1 w-full">
              <Reveal delay={100}>
                <div className="bg-slate-700/80 backdrop-blur rounded-xl p-5 sm:p-6 h-full flex flex-col">
                  <h4 className="text-white font-bold text-base sm:text-lg mb-1">CAYSON</h4>
                  <h4 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">고객센터</h4>
                  <div className="text-sm text-gray-300 space-y-1 mb-auto">
                    <p>평일: 10:00~18:00</p>
                    <p>점심시간: 12:30~13:30</p>
                    <p className="text-yellow-400">주말, 공휴일 휴무</p>
                  </div>
                  <a href="https://open.kakao.com/o/smarimpi" target="_blank" rel="noopener noreferrer" className="mt-5 block text-center border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
                    카카오톡 문의하기
                  </a>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="bg-[#3d5a96] backdrop-blur rounded-xl p-5 sm:p-6 h-full flex flex-col">
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
