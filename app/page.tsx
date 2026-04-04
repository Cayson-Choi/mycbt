import { Suspense } from "react"
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

export default function Home() {
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

      {/* Features */}
      <section className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              주요 기능
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              효율적인 시험 준비를 위한 핵심 기능들
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">CBT 모의고사</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">제한 시간 내<br />객관식 문제 풀이</p>
            </div>

            <div className="text-center p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">자동 채점</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">제출 즉시 점수와<br />과목별 성적 확인</p>
            </div>

            <div className="text-center p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">오답 노트</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">틀린 문제와 해설로<br />약점 집중 학습</p>
            </div>

            <div className="text-center p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">동영상 강의</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">등급별 강의로<br />체계적 학습</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
