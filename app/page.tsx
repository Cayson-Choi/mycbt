import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import HeroSection from "@/components/HeroSection"
import HomeExamCards from "@/components/HomeExamCards"

function ExamCardsSkeleton() {
  return (
    <div className="grid gap-4 max-w-5xl mx-auto grid-cols-2 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg lg:rounded-xl p-1.5 lg:p-4 animate-pulse"
        >
          <div className="h-4 w-12 bg-white/20 rounded-full mb-2 ml-auto" />
          <div className="h-5 w-24 bg-white/20 rounded mb-1" />
          <div className="h-3 w-16 bg-white/20 rounded mb-2" />
          <div className="h-3 w-20 bg-white/20 rounded" />
        </div>
      ))}
    </div>
  )
}

export default async function Home() {
  // 로그인된 사용자인데 전화번호가 없으면 → 추가정보기입 페이지로
  const session = await auth()
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { nickname: true, phone: true },
    })
    if (!user?.nickname || !user?.phone) {
      redirect("/complete-profile")
    }
  }

  return (
    <div>
      {/* Hero */}
      <section>
        <HeroSection />
      </section>

      {/* Exam cards */}
      <section
        id="exams"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 pb-10"
      >
        <Suspense fallback={<ExamCardsSkeleton />}>
          <HomeExamCards />
        </Suspense>
      </section>

      {/* 왜 전기짱인가 */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">

          {/* 메인 카피 */}
          <div className="max-w-2xl mb-16 sm:mb-20">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-3">
              Why 전기짱
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight mb-4">
              기출문제 하나까지<br />
              직접 검증합니다.
            </h2>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
              인터넷에 떠도는 오류 투성이 문제를 그대로 가져다 쓰지 않습니다.
              전기 분야 현직 전문가가 매 문제, 매 선지, 매 해설을
              원본 기출과 대조하고 교차 검증한 문제만 출제합니다.
            </p>
          </div>

          {/* 3단 구성 - 비대칭 레이아웃 */}
          <div className="grid md:grid-cols-12 gap-6 sm:gap-8 mb-16 sm:mb-20">

            {/* 좌측 큰 카드 */}
            <div className="md:col-span-7 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 sm:p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="relative">
                <div className="text-6xl sm:text-7xl font-black text-blue-400 mb-2">100%</div>
                <div className="text-xl sm:text-2xl font-bold mb-3">실전 동일 환경</div>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base max-w-md">
                  실제 한국산업인력공단 CBT 시험과 동일한 과목 구성, 문항 수, 제한 시간.
                  시험장에서 당황하지 않도록 실전 감각을 미리 잡아드립니다.
                </p>
                <div className="mt-6 flex gap-3 flex-wrap">
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full">과목별 출제</span>
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full">시간 제한</span>
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full">즉시 채점</span>
                  <span className="text-xs bg-white/10 px-3 py-1.5 rounded-full">과목별 성적</span>
                </div>
              </div>
            </div>

            {/* 우측 2단 카드 */}
            <div className="md:col-span-5 flex flex-col gap-6 sm:gap-8">
              <div className="flex-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 mb-1">매일</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">문제 업데이트</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  최신 출제 경향을 반영해 문제를 지속적으로 추가하고,
                  오류가 발견되면 24시간 내 수정합니다.
                </p>
              </div>
              <div className="flex-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-2xl p-6 sm:p-8">
                <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 mb-1">오답노트</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">약점만 골라서</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  맞은 문제를 백 번 푸는 것보다
                  틀린 문제 한 번 복습이 합격을 결정합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 비교 섹션 */}
          <div className="mb-16 sm:mb-20">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              같은 기출, 다른 품질
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {/* 타사 */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-sm font-bold text-gray-400 dark:text-gray-500 mb-4 uppercase tracking-wider">일반 CBT 사이트</div>
                <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
                  <li className="flex gap-2">
                    <span className="text-gray-300 dark:text-gray-600">-</span>
                    <span>출처 불명 문제 무분별 수집</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-300 dark:text-gray-600">-</span>
                    <span>정답 오류 방치</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-300 dark:text-gray-600">-</span>
                    <span>해설 없거나 부실</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gray-300 dark:text-gray-600">-</span>
                    <span>구버전 문제 그대로 방치</span>
                  </li>
                </ul>
              </div>
              {/* 전기짱 */}
              <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-6 bg-blue-50/50 dark:bg-blue-950/30 relative">
                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  전기짱
                </div>
                <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wider">전기짱 CBT</div>
                <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>원본 기출 대조 후 수록</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>전문가 교차 검증, 오류 즉시 수정</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>모든 문제에 상세 해설 수록</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>최신 출제 경향 반영, 지속 업데이트</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 지원 자격증 */}
          <div className="text-center mb-16 sm:mb-20">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              전기 분야 자격증, 한 곳에서 끝.
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              기능사부터 기사까지, 전기 자격증 전 종목을 지원합니다.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기초</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">입문자용</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기능사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">3과목 60문항</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기산업기사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">5과목 100문항</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/40 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                </div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">5과목 100문항</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl py-12 px-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              합격, 운이 아니라 전략입니다.
            </h3>
            <p className="text-blue-100 mb-6 text-sm sm:text-base">
              지금 바로 실전 모의고사를 풀어보세요. 회원가입 후 무료로 시작할 수 있습니다.
            </p>
            <a
              href="#exams"
              className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm sm:text-base"
            >
              시험 보러 가기
            </a>
          </div>

        </div>
      </section>
    </div>
  )
}
