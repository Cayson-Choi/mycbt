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

      {/* Exam cards */}
      <section
        id="exams"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10 pb-6"
      >
        <HomeExamCards />
      </section>

      {/* 왜 전기짱인가 */}
      <WhySection />
    </div>
  )
}
