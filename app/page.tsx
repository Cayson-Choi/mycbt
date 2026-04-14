import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"
import CertifiedBanner from "@/components/CertifiedBanner"
import { prisma } from "@/lib/prisma"

// gradeCounts는 관리자 삭제/생성 즉시 반영되어야 해서 캐시하지 않음
// (카드 깜빡임 방지) — 쿼리가 가벼워서 성능 영향 미미
export const dynamic = 'force-dynamic'

export default async function Home() {
  const [gradeCountsRaw, hiddenSetting] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      select: {
        grade: true,
        _count: { select: { exams: { where: { isPublished: true } } } },
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: 'landing_hidden_cards' } }),
  ])

  const countByGrade: Record<string, number> = {}
  for (const gc of gradeCountsRaw) {
    const g = gc.grade || '기타'
    countByGrade[g] = (countByGrade[g] || 0) + gc._count.exams
  }

  const initialHiddenCards: string[] = hiddenSetting ? JSON.parse(hiddenSetting.value) : []

  return (
    <div>
      <ProfileGuard />
      <CertifiedBanner />
      <section>
        <HeroSection />
      </section>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <LandingContent gradeCounts={countByGrade} initialHiddenCards={initialHiddenCards} />
    </div>
  )
}
