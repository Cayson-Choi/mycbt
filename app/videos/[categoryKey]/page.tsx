import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import VideosListClient, { type VideoListItem } from "@/components/VideosListClient"

export const revalidate = 30

const CATEGORY_PRESETS: Record<
  string,
  {
    nameMatch: (n: string) => boolean
    title: string
    subtitle: string
    bg: string
    accent: string
  }
> = {
  engineer: {
    nameMatch: (n) => n.includes("전기기사") && !n.includes("산업기사") && !n.includes("기능사"),
    title: "전기기사 동영상 강의",
    subtitle: "ENGINEER",
    bg: "from-[#1B2A4A] to-[#2A3F6A]",
    accent: "text-[#C9A84C]",
  },
  technician: {
    nameMatch: (n) => n.includes("전기기능사"),
    title: "전기기능사 동영상 강의",
    subtitle: "TECHNICIAN",
    bg: "from-[#0d3d33] to-[#1f5d4f]",
    accent: "text-emerald-300",
  },
  elevator: {
    nameMatch: (n) => n.includes("승강기"),
    title: "승강기기능사 동영상 강의",
    subtitle: "ELEVATOR",
    bg: "from-[#3d2d5c] to-[#5a4485]",
    accent: "text-violet-300",
  },
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_PRESETS).map((categoryKey) => ({ categoryKey }))
}

export default async function VideosCategoryPage({
  params,
}: {
  params: Promise<{ categoryKey: string }>
}) {
  const { categoryKey } = await params
  const preset = CATEGORY_PRESETS[categoryKey]
  if (!preset) notFound()

  const videosRaw = await prisma.video.findMany({
    where: { isActive: true },
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ sortOrder: "asc" }, { id: "desc" }],
  })

  const videos: VideoListItem[] = videosRaw
    .filter((v) => v.category && preset.nameMatch(v.category.name))
    .map((v) => ({
      id: v.id,
      title: v.title,
      videoUrl: v.videoUrl,
      thumbnailUrl: v.thumbnailUrl,
      categoryName: v.category?.name ?? null,
      durationText: v.durationText,
      ratingText: v.ratingText,
      price: v.price,
      minTier: v.minTier,
    }))

  return (
    <div className="min-h-screen bg-[#FEFDF5] dark:bg-gray-900">
      {/* 헤더 — 카테고리별 다크 그라데이션 */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${preset.bg} text-white`}>
        {/* CAYSON 워터마크 */}
        <span
          className="absolute top-1/2 left-1/2 text-[120px] sm:text-[180px] lg:text-[220px] font-black text-white/[0.05] select-none leading-none tracking-tight whitespace-nowrap"
          style={{ transform: "translate(-50%, -50%) rotate(-15deg)" }}
        >
          CAYSON
        </span>
        <div
          className="absolute inset-0 opacity-[0.5] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='nf'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23nf)'/></svg>\")",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs sm:text-sm text-white/70 hover:text-white mb-4 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
          <p className={`text-[10px] sm:text-xs font-semibold ${preset.accent} tracking-[0.25em] uppercase mb-2`}>
            {preset.subtitle} · Video Lectures
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight mb-3">
            {preset.title}
          </h1>
          <p className="text-sm sm:text-base text-white/70">
            전체 <span className="font-bold text-white">{videos.length}</span>개 강의
          </p>
        </div>
      </section>

      {/* 본문 — 강의 그리드 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {videos.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-[#C9A84C]/15 dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h2 className="text-lg font-bold text-[#1B2A4A] dark:text-white mb-2">
              아직 등록된 강의가 없습니다
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              새로운 강의가 곧 업로드될 예정입니다.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-5 py-2.5 bg-[#1B2A4A] text-white text-sm font-semibold rounded-lg hover:bg-[#2A3F6A] transition"
            >
              홈으로 돌아가기
            </Link>
          </div>
        ) : (
          <VideosListClient videos={videos} />
        )}
      </section>
    </div>
  )
}
