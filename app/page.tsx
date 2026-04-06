import HeroSection from "@/components/HeroSection"
import HomeExamCards from "@/components/HomeExamCards"
import ProfileGuard from "@/components/ProfileGuard"
import WhySection from "@/components/WhySection"

export const revalidate = 60

export default function Home() {
  return (
    <div>
      <ProfileGuard />
      {/* Hero */}
      <section>
        <HeroSection />
      </section>

      {/* 등급별 자격증 */}
      <section
        id="exams"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 relative z-10 pb-2"
      >
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2">
            자격증을 선택하세요
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            기능사부터 기능장까지, 필기·실기 모두 지원합니다
          </p>
        </div>
        <HomeExamCards />
      </section>

      {/* 왜 CAYSON인가 */}
      <WhySection />
    </div>
  )
}
