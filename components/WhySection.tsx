'use client'

import ScrollReveal, { CountUp, TypeWriter } from './ScrollReveal'

export default function WhySection() {
  return (
    <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">

        {/* 메인 카피 */}
        <ScrollReveal>
          <div className="max-w-2xl mb-8 sm:mb-12">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-2">
              Why CAYSON
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-2">
              기출문제 하나까지<br />
              직접 검증합니다.
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              인터넷에 떠도는 오류 투성이 문제를 그대로 가져다 쓰지 않습니다.
              현직 전문가가 모든 문제와 선택지를 정확하게 복원하고, 철저한 검증을 거친 문제만을 출제합니다.
            </p>
          </div>
        </ScrollReveal>

        {/* 3단 구성 */}
        <div className="grid md:grid-cols-12 gap-4 sm:gap-5 mb-8 sm:mb-12">
          <ScrollReveal className="md:col-span-7">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 sm:p-8 text-white relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="relative">
                <div className="text-5xl sm:text-7xl font-black text-blue-400 mb-1">
                  <CountUp target={100} suffix="%" />
                </div>
                <div className="text-lg sm:text-2xl font-bold mb-2">실전 동일 환경</div>
                <p className="text-gray-300 leading-relaxed text-xs sm:text-sm max-w-md">
                  실제 한국산업인력공단 CBT 시험과 동일한 과목 구성, 문항 수, 제한 시간.
                  시험장에서 당황하지 않도록 실전 감각을 미리 잡아드립니다.
                </p>
                <div className="mt-3 sm:mt-5 flex gap-2 flex-wrap">
                  <span className="text-[11px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-full">과목별 출제</span>
                  <span className="text-[11px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-full">시간 제한</span>
                  <span className="text-[11px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-full">즉시 채점</span>
                  <span className="text-[11px] sm:text-xs bg-white/10 px-2.5 py-1 rounded-full">과목별 성적</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
          <div className="md:col-span-5 flex flex-col gap-4">
            <ScrollReveal delay={150} className="flex-1">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-4 sm:p-6 h-full">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mb-0.5">매일</div>
                <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">문제 업데이트</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  최신 출제 경향을 반영해 문제를 지속적으로 추가하고,
                  오류가 발견되면 24시간 내 수정합니다.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300} className="flex-1">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-4 sm:p-6 h-full">
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mb-0.5">오답노트</div>
                <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1">약점만 골라서</div>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  맞은 문제를 백 번 푸는 것보다
                  틀린 문제 한 번 복습이 합격을 결정합니다.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* 비교 섹션 */}
        <ScrollReveal className="mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-5 text-center">
            같은 기출, 다른 품질
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 bg-gray-50 dark:bg-gray-800/50">
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2.5 uppercase tracking-wider">일반 CBT 사이트</div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600">-</span><span>출처 불명 문제 무분별 수집</span></li>
                <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600">-</span><span>정답 오류 방치</span></li>
                <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600">-</span><span>해설 없거나 부실</span></li>
                <li className="flex gap-2"><span className="text-gray-300 dark:text-gray-600">-</span><span>구버전 문제 그대로 방치</span></li>
              </ul>
            </div>
            <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-4 sm:p-5 bg-blue-50/50 dark:bg-blue-950/30 relative">
              <div className="absolute -top-3 left-6 bg-blue-600 text-white text-[11px] font-bold px-3 py-1 rounded-full">CAYSON</div>
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2.5 uppercase tracking-wider">CAYSON CBT</div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-2"><span className="text-blue-500">+</span><span>정확한 복원과 검증 후 수록</span></li>
                <li className="flex gap-2"><span className="text-blue-500">+</span><span>전문가 교차 검증, 오류 즉시 수정</span></li>
                <li className="flex gap-2"><span className="text-blue-500">+</span><span>모든 문제 해설 수록</span></li>
                <li className="flex gap-2"><span className="text-blue-500">+</span><span>최신 출제 경향 반영, 지속 업데이트</span></li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* 지원 자격증 요약 */}
        <ScrollReveal className="text-center mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5">
            기능사부터 기능장, 공기업까지
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
            15개 자격증 + 공기업 채용시험을 한 곳에서 준비하세요
          </p>
          <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-3xl mx-auto">
            {[
              { name: '기능사', count: '4종', color: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400' },
              { name: '산업기사', count: '6종', color: 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800/50 text-violet-700 dark:text-violet-400' },
              { name: '기사', count: '4종', color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50 text-blue-700 dark:text-blue-400' },
              { name: '기능장', count: '1종', color: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400' },
              { name: '공기업', count: '준비중', color: 'bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800/50 text-cyan-700 dark:text-cyan-400' },
            ].map((item) => (
              <div key={item.name} className={`border ${item.color} rounded-xl py-3 px-2 text-center`}>
                <div className="font-bold text-xs sm:text-sm">{item.name}</div>
                <div className="text-[10px] sm:text-[11px] opacity-70 mt-0.5">{item.count}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black rounded-2xl py-8 sm:py-10 px-5 border border-amber-500/20">
            <h3 className="text-xl sm:text-4xl font-black text-amber-400 mb-2 whitespace-nowrap">
              <TypeWriter text="합격! 운이 아니라 전략입니다." />
            </h3>
            <p className="text-gray-400 mb-4 text-xs sm:text-base">
              지금 바로 실전 모의고사를 풀어보세요. 회원가입 후 무료로 시작할 수 있습니다.
            </p>
            <a
              href="#exams"
              className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold px-8 py-3 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all text-sm sm:text-base"
            >
              시험 보러 가기
            </a>
          </div>
        </ScrollReveal>

      </div>
    </section>
  )
}
