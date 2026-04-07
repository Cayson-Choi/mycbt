import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"

export default function Home() {
  return (
    <div>
      <ProfileGuard />
      <section>
        <HeroSection />
      </section>
      <LandingContent />
    </div>
  )
}
