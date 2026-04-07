'use client'

import { useEffect, useRef, useState } from 'react'
import ScrollReveal, { CountUp, TypeWriter } from './ScrollReveal'

function AnimatedBar({ width, delay = 0 }: { width: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{
          width: visible ? width : '0%',
          background: 'linear-gradient(90deg, #3b82f6, #6366f1)',
        }}
      />
    </div>
  )
}

function NumberTicker({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let frame = 0
    const totalFrames = 60
    const step = () => {
      frame++
      const progress = Math.min(frame / totalFrames, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * value))
      if (frame < totalFrames) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [started, value])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function WhySection() {
  return (
    <section className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">

      {/* 풀 와이드 다크 섹션 - 핵심 메시지 */}
      <div className="bg-gray-950 dark:bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* 좌측 - 타이포 */}
            <ScrollReveal>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-500 mb-4">
                Why CAYSON
              </p>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight">
                다른 곳에서<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  틀린 답을 외우고
                </span><br />
                있진 않습니까
              </h2>
              <div className="w-12 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 mb-6" />
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-lg">
                출처 불명의 문제, 방치된 오답, 엉터리 해설.
                시간을 투자할수록 오히려 멀어지는 합격.
                CAYSON은 현직 전문가가 원본 시험지와 대조하여
                한 문제, 한 선택지까지 직접 검증합니다.
              </p>
            </ScrollReveal>

            {/* 우측 - 수치 */}
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <ScrollReveal delay={100}>
                <div className="border border-gray-800 rounded-2xl p-5 sm:p-6">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <NumberTicker value={2100} suffix="+" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">검증된 기출문제</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="border border-gray-800 rounded-2xl p-5 sm:p-6">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <NumberTicker value={58} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">발견 / 수정된 오류</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={300}>
                <div className="border border-gray-800 rounded-2xl p-5 sm:p-6">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    <CountUp target={100} suffix="%" />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">실전 동일 환경</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={400}>
                <div className="border border-gray-800 rounded-2xl p-5 sm:p-6">
                  <div className="text-3xl sm:text-4xl font-black text-white mb-1">
                    24h
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">오류 발견 시 수정</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>

      {/* 3단 기능 카드 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <ScrollReveal>
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 dark:text-gray-500 mb-3 text-center">
            Features
          </p>
          <h3 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white text-center mb-12 sm:mb-16 tracking-tight">
            합격을 만드는 시스템
          </h3>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {[
            {
              num: '01',
              title: '실전과 동일한\nCBT 환경',
              desc: '한국산업인력공단 시험과 같은 과목 구성, 문항 수, 제한 시간. 시험장에서 처음 보는 화면이 없도록.',
              tags: ['과목별 출제', '시간 제한', '자동 채점'],
              accent: 'from-blue-500 to-indigo-500',
              barWidth: '95%',
            },
            {
              num: '02',
              title: '틀린 문제만\n반복 학습',
              desc: '오답노트가 자동 생성됩니다. 약점 과목을 집중 공략하면 같은 시간으로 두 배의 효과.',
              tags: ['자동 오답노트', '과목별 분석', '약점 집중'],
              accent: 'from-violet-500 to-purple-500',
              barWidth: '88%',
            },
            {
              num: '03',
              title: '매일 업데이트되는\n최신 문제',
              desc: '규정 개정, 새 출제 경향을 실시간 반영. 작년 기출만 달달 외우다 떨어지는 일은 없습니다.',
              tags: ['실시간 반영', '규정 개정 추적', '신규 문제 추가'],
              accent: 'from-emerald-500 to-teal-500',
              barWidth: '82%',
            },
          ].map((card, i) => (
            <ScrollReveal key={card.num} delay={i * 150}>
              <div className="group h-full">
                <div className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 h-full transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/30">
                  {/* 넘버 */}
                  <div className={`text-xs font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r ${card.accent} mb-5`}>
                    {card.num}
                  </div>
                  {/* 제목 */}
                  <h4 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-snug mb-3 whitespace-pre-line">
                    {card.title}
                  </h4>
                  {/* 설명 */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
                    {card.desc}
                  </p>
                  {/* 프로그레스 바 */}
                  <AnimatedBar width={card.barWidth} delay={i * 200 + 300} />
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] sm:text-[11px] font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* 비교 섹션 - 미니멀 */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <ScrollReveal>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-400 dark:text-gray-500 mb-3 text-center">
              Comparison
            </p>
            <h3 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white text-center mb-12 sm:mb-16 tracking-tight">
              같은 기출, 다른 결과
            </h3>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-0 sm:gap-0 max-w-3xl mx-auto">
            {/* 타사 */}
            <ScrollReveal>
              <div className="border border-gray-200 dark:border-gray-800 sm:rounded-l-2xl sm:rounded-r-none rounded-t-2xl sm:rounded-tr-none p-6 sm:p-8 bg-gray-50/50 dark:bg-gray-900/50 h-full">
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-600 mb-5">
                  Other
                </div>
                <ul className="space-y-3">
                  {['출처 불명 문제 수집', '정답 오류 방치', '해설 없음 또는 부실', '구 규정 문제 그대로'].map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm text-gray-400 dark:text-gray-500">
                      <span className="w-4 h-4 mt-0.5 rounded-full border border-gray-300 dark:border-gray-700 flex-shrink-0 flex items-center justify-center">
                        <span className="block w-1.5 h-[1.5px] bg-gray-300 dark:bg-gray-600" />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* CAYSON */}
            <ScrollReveal delay={150}>
              <div className="border-2 border-gray-900 dark:border-white sm:rounded-r-2xl sm:rounded-l-none rounded-b-2xl sm:rounded-bl-none p-6 sm:p-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 h-full relative">
                <div className="absolute -top-3 left-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1 rounded">
                  CAYSON
                </div>
                <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-5">
                  CAYSON
                </div>
                <ul className="space-y-3">
                  {['원본 시험지 대조 검증', '전문가 교차 검증, 즉시 수정', '전 문제 해설 수록', '최신 규정 실시간 반영'].map((text) => (
                    <li key={text} className="flex items-start gap-2.5 text-sm">
                      <span className="w-4 h-4 mt-0.5 rounded-full bg-white dark:bg-gray-900 flex-shrink-0 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      {/* CTA - 풀 와이드 */}
      <div className="bg-gray-950 dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
              <TypeWriter text="합격은 운이 아닙니다." />
            </h3>
            <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-md mx-auto">
              검증된 문제로 실전처럼 연습하세요.
              지금 시작하면 다음 시험이 마지막 시험이 됩니다.
            </p>
            <a
              href="#exams"
              className="inline-block bg-white text-gray-900 font-bold px-10 py-4 rounded-full text-sm sm:text-base hover:bg-gray-100 transition-colors"
            >
              무료로 시작하기
            </a>
          </ScrollReveal>
        </div>
      </div>

    </section>
  )
}
