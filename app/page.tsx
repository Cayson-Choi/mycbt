import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"
import CertifiedBanner from "@/components/CertifiedBanner"
import { prisma } from "@/lib/prisma"

export default async function Home() {
  // 등급별 시험 수 + 숨김 카드 설정을 병렬 조회
  const [gradeCounts, hiddenSetting] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      select: {
        grade: true,
        _count: { select: { exams: { where: { isPublished: true } } } },
      },
    }),
    prisma.siteSetting.findUnique({
      where: { key: "landing_hidden_cards" },
    }),
  ])

  const countByGrade: Record<string, number> = {}
  for (const gc of gradeCounts) {
    const g = gc.grade || '기타'
    countByGrade[g] = (countByGrade[g] || 0) + gc._count.exams
  }

  const hiddenCards: string[] = hiddenSetting ? JSON.parse(hiddenSetting.value) : []

  return (
    <div>
      <ProfileGuard />
      <CertifiedBanner />
      <section>
        <HeroSection />
      </section>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <LandingContent gradeCounts={countByGrade} hiddenCards={hiddenCards} />
    </div>
  )
}
