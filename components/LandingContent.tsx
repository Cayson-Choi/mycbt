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

/* ─── 등급 데이터 (engineerlab 이벤트 카드 스타일) ─── */
const grades = [
  {
    id: 'technician', label: '기능사', count: 4,
    badge: '4개 자격증',
    cta: '전기기능사 외 3개\n필기/실기 준비',
    cardBg: 'bg-[#e8f5e9]', badgeBg: 'bg-emerald-500',
    icon: <img src="/hero/deco/425117-achievement-reward-award.svg" alt="" className="w-full h-full" />,
  },
  {
    id: 'industrial', label: '산업기사', count: 6,
    badge: '6개 자격증',
    cta: '전기산업기사 외 5개\n현장 전문가 도약',
    cardBg: 'bg-[#f3e5f5]', badgeBg: 'bg-violet-500',
    icon: <img src="/hero/deco/429900-setting-configuration-gear.svg" alt="" className="w-full h-full" />,
  },
  {
    id: 'engineer', label: '기사', count: 4,
    badge: '4개 자격증',
    cta: '전기기사 외 3개\n체계적 합격 전략',
    cardBg: 'bg-[#e3f2fd]', badgeBg: 'bg-blue-500',
    icon: <img src="/hero/deco/382151-education-graduation-learning-school-study.svg" alt="" className="w-full h-full" />,
  },
  {
    id: 'master', label: '기능장', count: 1,
    badge: '최고 등급',
    cta: '전기기능장\n최고 등급에 도전',
    cardBg: 'bg-[#fff3e0]', badgeBg: 'bg-amber-500',
    icon: <img src="/hero/deco/475312-trophy.svg" alt="" className="w-full h-full" />,
  },
  {
    id: 'public', label: '공기업', count: 0,
    badge: '준비중',
    cta: '한국전력공사 등\n공기업 채용 대비',
    cardBg: 'bg-[#e0f7fa]', badgeBg: 'bg-gray-400',
    icon: <img src="/hero/deco/421954-apartment-block-building.svg" alt="" className="w-full h-full" />,
  },
  {
    id: 'ncs', label: '과정평가형', count: 0,
    badge: '준비중',
    cta: 'NCS 과정평가형\n교육훈련 자격 취득',
    cardBg: 'bg-[#fce4ec]', badgeBg: 'bg-gray-400',
    icon: <img src="/hero/deco/375339-certificate-authority-service.svg" alt="" className="w-full h-full" />,
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
      desc: '인터넷에 떠도는 문제를 그대로 복사하지 않습니다. 실제 시험지 원본과 정답, 선택지를 한 문제씩 대조하여 검증합니다.',
      accent: 'blue',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center gap-3 sm:gap-6 px-4">
            <div className="w-[42%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-700 transform -rotate-2 transition-transform duration-500 hover:rotate-0">
              <div className="h-2 w-16 bg-gray-200 dark:bg-gray-600 rounded mb-2" />
              <div className="h-2 w-12 bg-gray-100 dark:bg-gray-700 rounded mb-3" />
              <div className="space-y-1.5">{[1,2,3,4].map(n => <div key={n} className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-[8px] flex items-center justify-center text-gray-500 font-bold">{n}</span><div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded flex-1" /></div>)}</div>
              <p className="text-[8px] sm:text-[10px] text-gray-400 mt-2 text-center">원본 시험지</p>
            </div>
            <svg className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 transition-all duration-700 ${visible ? 'text-blue-500 scale-100 opacity-100' : 'text-gray-300 scale-50 opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className="w-[42%] bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 sm:p-4 border-2 border-blue-400 dark:border-blue-500 transform rotate-2 transition-transform duration-500 hover:rotate-0">
              <div className="h-2 w-16 bg-blue-200 dark:bg-blue-800 rounded mb-2" />
              <div className="h-2 w-12 bg-blue-100 dark:bg-blue-900 rounded mb-3" />
              <div className="space-y-1.5">{[1,2,3,4].map(n => <div key={n} className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white font-bold">{n}</span><div className="h-1.5 bg-blue-100 dark:bg-blue-900 rounded flex-1" /></div>)}</div>
              <p className="text-[8px] sm:text-[10px] text-blue-500 mt-2 text-center font-semibold">CAYSON 검증</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      tab: 'AI 이중 검증',
      title: 'AI + 수동 이중 검증 시스템',
      desc: 'AI가 전체 문제를 자동 검토한 후, 수동으로 한 번 더 확인합니다. 이중 검증을 통해 정답 오류를 원천 차단합니다.',
      accent: 'emerald',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <div className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 ${visible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">1차 AI 검토</div>
              <div className="w-8 sm:w-12 h-0.5 bg-emerald-300" />
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
            </div>
            <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
            <div className={`flex items-center gap-2 sm:gap-3 transition-all duration-700 delay-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">2차 수동 검증</div>
              <div className="w-8 sm:w-12 h-0.5 bg-emerald-300" />
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
            </div>
            <svg className="w-4 h-4 text-emerald-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>
            <div className={`bg-emerald-500 text-white rounded-lg shadow-lg px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-700 delay-500 ${visible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>검증 완료</div>
          </div>
        </div>
      ),
    },
    {
      tab: '즉시 수정',
      title: '오류 발견 즉시 수정, 방치 없음',
      desc: '오류를 발견하면 방치하지 않습니다. 확인 즉시 수정하고 규정 개정 사항도 실시간으로 반영합니다.',
      accent: 'amber',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl flex items-center justify-center overflow-hidden px-4">
          <div className="flex items-center gap-3 sm:gap-5 w-full max-w-xs sm:max-w-sm">
            <div className={`flex-1 bg-white dark:bg-gray-800 rounded-lg shadow border border-red-200 dark:border-red-800 p-3 sm:p-4 transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-1.5 mb-2"><div className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[9px] sm:text-[11px] text-red-500 font-semibold">오류 발견</span></div>
              <div className="h-1.5 bg-red-100 dark:bg-red-900/40 rounded w-full mb-1" />
              <div className="h-1.5 bg-red-100 dark:bg-red-900/40 rounded w-3/4" />
            </div>
            <svg className={`w-5 h-5 sm:w-7 sm:h-7 text-amber-500 flex-shrink-0 transition-all duration-700 delay-300 ${visible ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className={`flex-1 bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-emerald-400 dark:border-emerald-500 p-3 sm:p-4 transition-all duration-500 delay-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center gap-1.5 mb-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[9px] sm:text-[11px] text-emerald-600 font-semibold">수정 완료</span></div>
              <div className="h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded w-full mb-1" />
              <div className="h-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded w-3/4" />
            </div>
          </div>
        </div>
      ),
    },
    {
      tab: '실전 CBT',
      title: '한국산업인력공단 CBT 동일 구현',
      desc: '단순 문제풀이가 아닙니다. 실제 시험과 동일한 과목 구성, 문항 수, 제한 시간으로 실전 감각을 잡아드립니다.',
      accent: 'violet',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950/30 dark:to-violet-900/20 rounded-xl flex items-center justify-center overflow-hidden">
          <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-[85%] sm:w-[75%] p-3 sm:p-4 transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-300">전기기사 필기 CBT</span></div>
              <span className="text-[8px] sm:text-[10px] font-mono text-red-500 font-bold bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">02:29:45</span>
            </div>
            <div className="flex gap-1 mb-2">{['전기자기학','전력공학','전기기기','회로이론','전기설비'].map((s,i) => <span key={s} className={`text-[6px] sm:text-[8px] px-1 sm:px-1.5 py-0.5 rounded font-medium ${i===0 ? 'bg-violet-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>{s}</span>)}</div>
            <div className="space-y-1">{[1,2,3].map(n => <div key={n} className="flex items-start gap-2"><span className="text-[8px] sm:text-[10px] font-bold text-gray-400 mt-0.5">{n}.</span><div className="flex-1"><div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded w-full mb-1" /><div className="grid grid-cols-2 gap-1">{[1,2,3,4].map(c => <div key={c} className={`h-3 sm:h-4 rounded text-[6px] sm:text-[7px] flex items-center justify-center font-medium ${c===2 ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 ring-1 ring-violet-300' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'}`}>{c}</div>)}</div></div></div>)}</div>
          </div>
        </div>
      ),
    },
    {
      tab: '약점 분석',
      title: '과목별 약점을 자동으로 분석',
      desc: '시험 종료 즉시 과목별 정답률과 약점을 자동 분석합니다. 어디가 부족한지 한눈에 파악하고 집중 학습하세요.',
      accent: 'pink',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/20 rounded-xl flex items-center justify-center overflow-hidden px-4 sm:px-6">
          <div className="w-full max-w-xs sm:max-w-sm space-y-2 sm:space-y-2.5">
            {[
              { name: '전기자기학', pct: 95, color: 'bg-blue-500' },
              { name: '전력공학', pct: 72, color: 'bg-emerald-500' },
              { name: '전기기기', pct: 88, color: 'bg-violet-500' },
              { name: '회로이론', pct: 45, color: 'bg-pink-500' },
              { name: '전기설비', pct: 80, color: 'bg-amber-500' },
            ].map((sub, i) => (
              <div key={sub.name} className="flex items-center gap-2 sm:gap-3">
                <span className="text-[8px] sm:text-[10px] font-semibold text-gray-500 dark:text-gray-400 w-12 sm:w-16 text-right flex-shrink-0">{sub.name}</span>
                <div className="flex-1 h-3 sm:h-4 bg-white dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full ${sub.color} rounded-full transition-all duration-1000 ease-out`} style={{ width: visible ? `${sub.pct}%` : '0%', transitionDelay: `${i * 150}ms` }} />
                </div>
                <span className={`text-[9px] sm:text-xs font-bold tabular-nums ${sub.pct < 60 ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}>{visible ? sub.pct : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      tab: '실시간 반영',
      title: '규정 개정 사항 실시간 반영',
      desc: '전기 관련 법규와 규정이 바뀌면 즉시 문제에 반영합니다. 항상 최신 기준으로 학습할 수 있습니다.',
      accent: 'teal',
      visual: (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/20 rounded-xl flex items-center justify-center overflow-hidden">
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            {[
              { label: '규정 개정 감지', delay: '0ms' },
              { label: '문제 자동 업데이트', delay: '200ms' },
              { label: '최신 기준 적용 완료', delay: '400ms' },
            ].map((step, i) => (
              <div key={step.label} className={`flex items-center gap-2 sm:gap-3 transition-all duration-500 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: step.delay }}>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 2 ? 'bg-teal-500' : 'bg-teal-400'}`}>{i + 1}</div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow px-3 py-1.5 sm:px-4 sm:py-2 border border-gray-200 dark:border-gray-700 text-[10px] sm:text-xs font-semibold text-gray-700 dark:text-gray-300">{step.label}</div>
                {i < 2 && <svg className="w-3 h-3 text-teal-300 rotate-90 -ml-1 hidden sm:block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" /></svg>}
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ]

  const accentMap: Record<string, { tab: string; border: string; ring: string }> = {
    blue: { tab: 'bg-blue-600 text-white shadow-blue-600/25', border: 'border-blue-200 dark:border-blue-800', ring: 'ring-blue-500/20' },
    emerald: { tab: 'bg-emerald-600 text-white shadow-emerald-600/25', border: 'border-emerald-200 dark:border-emerald-800', ring: 'ring-emerald-500/20' },
    amber: { tab: 'bg-amber-500 text-white shadow-amber-500/25', border: 'border-amber-200 dark:border-amber-800', ring: 'ring-amber-500/20' },
    violet: { tab: 'bg-violet-600 text-white shadow-violet-600/25', border: 'border-violet-200 dark:border-violet-800', ring: 'ring-violet-500/20' },
    pink: { tab: 'bg-pink-500 text-white shadow-pink-500/25', border: 'border-pink-200 dark:border-pink-800', ring: 'ring-pink-500/20' },
    teal: { tab: 'bg-teal-600 text-white shadow-teal-600/25', border: 'border-teal-200 dark:border-teal-800', ring: 'ring-teal-500/20' },
  }

  const f = features[activeFeature]
  const a = accentMap[f.accent]

  return (
    <section className="bg-white dark:bg-gray-950 overflow-hidden">
      <div ref={triggerRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Reveal>
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase mb-2">Why CAYSON</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
              왜 {'CAYSON'.split('').map((ch, i) => (
                <span key={i} className="inline-block bg-gradient-to-b from-orange-500 to-amber-500 text-transparent bg-clip-text tracking-wide" style={{ animation: `caysonBounce 4s ease-in-out infinite`, animationDelay: `${i * 0.4}s`, marginRight: '0.04em' }}>{ch}</span>
              ))}이어야 할까요?
            </h2>
            <div className="w-12 h-1 bg-blue-600 mt-4 rounded-full mx-auto" />
          </div>
        </Reveal>

        {/* 탭 네비 */}
        <Reveal delay={100}>
          <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap mb-8 sm:mb-10">
            {features.map((ft, i) => (
              <button
                key={ft.tab}
                onClick={() => setActiveFeature(i)}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${
                  i === activeFeature
                    ? `${accentMap[ft.accent].tab} shadow-lg scale-105`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {ft.tab}
              </button>
            ))}
          </div>
        </Reveal>

        {/* 콘텐츠 카드 */}
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border-2 ${a.border} ring-4 ${a.ring} shadow-xl transition-all duration-500 overflow-hidden`}>
          <div className="grid lg:grid-cols-2 gap-0">
            {/* 좌: 비주얼 */}
            <div className="p-5 sm:p-8">
              <div className="transition-all duration-500" key={activeFeature}>
                {f.visual}
              </div>
            </div>
            {/* 우: 설명 */}
            <div className="p-5 sm:p-8 flex flex-col justify-center">
              <div key={activeFeature} className="transition-all duration-500">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-4">{f.title}</h3>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{f.desc}</p>
                {/* 프로그레스 인디케이터 */}
                <div className="flex gap-1.5">
                  {features.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${i === activeFeature ? `bg-${f.accent}-500` : i < activeFeature ? `bg-${f.accent}-300` : ''}`}
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
          <div className="mt-10 sm:mt-14 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">검증된 문제로 공부하면 합격이 가까워집니다</p>
            <Link
              href="/login"
              className="group/btn relative inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 text-white font-bold px-8 py-3.5 rounded-xl text-sm sm:text-base transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.03] active:scale-[0.97] overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ animation: 'ctaShimmer 2.5s ease-in-out infinite' }} />
              <span className="relative">지금 무료로 시작하기</span>
              <svg className="relative w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export default function LandingContent() {


  return (
    <>
      {/* ════════════════════════════════════════
          SECTION 1 -- 과정별 CBT (등급 탭 + 카드)
         ════════════════════════════════════════ */}
      <section id="exams" className="bg-gray-50 dark:bg-gray-900">
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

          {/* engineerlab 이벤트 카드 스타일 그리드 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {grades.map((g, i) => (
              <Reveal key={g.id} delay={i * 80}>
                {g.count > 0 ? (
                  <Link
                    href={`/grade/${g.id}`}
                    className={`group block relative overflow-hidden rounded-2xl ${g.cardBg} dark:bg-gray-800 p-4 sm:p-6 h-full min-h-[160px] sm:min-h-[200px] transition-all duration-300 hover:shadow-lg hover:shadow-gray-300/50 dark:hover:shadow-black/30 hover:-translate-y-0.5 cursor-pointer`}
                  >
                    {/* 좌상단: 제목 */}
                    <h3 className="text-base sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
                      {g.label}
                    </h3>
                    {/* 우상단: 뱃지 */}
                    <div className={`absolute top-3 right-3 sm:top-5 sm:right-5 ${g.badgeBg} text-white text-[8px] sm:text-[10px] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full`}>
                      {g.badge}
                    </div>
                    {/* 좌하단: CTA 설명 */}
                    <p className="absolute bottom-3 left-4 sm:bottom-5 sm:left-6 text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium leading-snug whitespace-pre-line max-w-[60%]">
                      {g.cta} <span className="inline-block ml-0.5 transition-transform group-hover:translate-x-0.5">&rarr;</span>
                    </p>
                    {/* 우하단: 일러스트 아이콘 */}
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] transition-transform duration-300 group-hover:scale-110 opacity-80 group-hover:opacity-100">
                      {g.icon}
                    </div>
                  </Link>
                ) : (
                  <div className={`relative overflow-hidden rounded-2xl ${g.cardBg} dark:bg-gray-800 p-4 sm:p-6 h-full min-h-[160px] sm:min-h-[200px] opacity-60`}>
                    <h3 className="text-base sm:text-2xl font-extrabold text-gray-500 dark:text-gray-400 leading-tight">
                      {g.label}
                    </h3>
                    <div className={`absolute top-3 right-3 sm:top-5 sm:right-5 ${g.badgeBg} text-white text-[8px] sm:text-[10px] font-bold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full`}>
                      {g.badge}
                    </div>
                    <p className="absolute bottom-3 left-4 sm:bottom-5 sm:left-6 text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium leading-snug whitespace-pre-line max-w-[60%]">
                      {g.cta}
                    </p>
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-[52px] h-[52px] sm:w-[72px] sm:h-[72px] opacity-30">
                      {g.icon}
                    </div>
                  </div>
                )}
              </Reveal>
            ))}
          </div>
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
                  <a href="mailto:cayson0127@gmail.com?subject=[오류신고]%20문제%20오류%20신고합니다" className="mt-5 block text-center border border-white/30 text-white font-semibold py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm">
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
