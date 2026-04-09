import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"
import CertifiedBanner from "@/components/CertifiedBanner"
import PremiumSection from "@/components/PremiumSection"

export default function Home() {
  return (
    <div>
      <ProfileGuard />
      <CertifiedBanner />
      <section>
        <HeroSection />
      </section>
      <div className="h-12 md:h-16 bg-white dark:bg-gray-900" />
      <PremiumSection />
      <LandingContent />
    </div>
  )
}
