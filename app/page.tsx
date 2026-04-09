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
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <PremiumSection />
      <LandingContent />
    </div>
  )
}
