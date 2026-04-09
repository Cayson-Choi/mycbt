import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"
import CertifiedBanner from "@/components/CertifiedBanner"

export default function Home() {
  return (
    <div>
      <ProfileGuard />
      <CertifiedBanner />
      <section>
        <HeroSection />
      </section>
      <LandingContent />
    </div>
  )
}
