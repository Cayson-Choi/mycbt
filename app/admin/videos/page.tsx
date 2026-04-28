import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import VideosClient from "@/components/admin/VideosClient"

export const dynamic = "force-dynamic"

export default async function AdminVideosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?redirect=/admin/videos")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) redirect("/")

  const [videos, categories] = await Promise.all([
    prisma.video.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { id: "desc" }],
    }),
    prisma.examCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, grade: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const initialVideos = videos.map((v) => ({
    id: v.id,
    title: v.title,
    videoUrl: v.videoUrl,
    thumbnailUrl: v.thumbnailUrl,
    categoryId: v.categoryId,
    categoryName: v.category?.name ?? null,
    durationText: v.durationText,
    ratingText: v.ratingText,
    price: v.price,
    sortOrder: v.sortOrder,
    isActive: v.isActive,
    minTier: v.minTier,
  }))

  return <VideosClient initialVideos={initialVideos} categories={categories} />
}
