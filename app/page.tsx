import HeroSection from "@/components/HeroSection"
import HomeExamCards from "@/components/HomeExamCards"
import ProfileGuard from "@/components/ProfileGuard"

export const revalidate = 60

export default function Home() {
  return (
    <div>
      <ProfileGuard />
      {/* Hero */}
      <section>
        <HeroSection />
      </section>

      {/* Exam cards */}
      <section
        id="exams"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 pb-10"
      >
        <HomeExamCards />
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
              전기 분야 현직 전문가가 모든 문제와 선택지를 정확하게 복원하고, 철저한 검증을 거친 문제만을 출제합니다.
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
                    <span>정확한 복원과 검증 후 수록</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>전문가 교차 검증, 오류 즉시 수정</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-500">+</span>
                    <span>모든 문제 해설 수록</span>
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
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4 text-center">
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기초</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">입문자용</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4 text-center">
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기능사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">3과목 60문항</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4 text-center">
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기산업기사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">5과목 100문항</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-5 px-4 text-center">
                <div className="font-bold text-gray-900 dark:text-white text-sm">전기기사</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">5과목 100문항</div>
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
