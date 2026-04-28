import HeroSection from "@/components/HeroSection"
import LandingContent from "@/components/LandingContent"
import ProfileGuard from "@/components/ProfileGuard"
import CertifiedBanner from "@/components/CertifiedBanner"
import { prisma } from "@/lib/prisma"

// 10초 캐시: 관리자 변경 시 최대 10초 후 반영, 일반 사용자는 캐시 히트로 빠름
export const revalidate = 10

export default async function Home() {
  const [gradeCountsRaw, hiddenSetting, videosRaw] = await Promise.all([
    prisma.examCategory.findMany({
      where: { isActive: true },
      select: {
        grade: true,
        _count: { select: { exams: { where: { isPublished: true } } } },
      },
    }),
    prisma.siteSetting.findUnique({ where: { key: 'landing_hidden_cards' } }),
    prisma.video.findMany({
      where: { isActive: true },
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }, { id: 'desc' }],
    }),
  ])

  const countByGrade: Record<string, number> = {}
  for (const gc of gradeCountsRaw) {
    const g = gc.grade || '기타'
    countByGrade[g] = (countByGrade[g] || 0) + gc._count.exams
  }

  const initialHiddenCards: string[] = hiddenSetting ? JSON.parse(hiddenSetting.value) : []

  const videos = videosRaw.map((v) => ({
    id: v.id,
    title: v.title,
    videoUrl: v.videoUrl,
    thumbnailUrl: v.thumbnailUrl,
    categoryId: v.categoryId,
    categoryName: v.category?.name ?? null,
    durationText: v.durationText,
    ratingText: v.ratingText,
    price: v.price,
    minTier: v.minTier,
  }))

  return (
    <div>
      <ProfileGuard />
      <CertifiedBanner />
      <section>
        <HeroSection />
      </section>
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
      <LandingContent gradeCounts={countByGrade} initialHiddenCards={initialHiddenCards} videos={videos} />
    </div>
  )
}
