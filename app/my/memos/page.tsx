import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import MyMemosClient from "@/components/MyMemosClient"

export const dynamic = 'force-dynamic'

export default async function MyMemosPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/my/memos')
  }

  const userId = session.user.id

  const memos = await prisma.videoMemo.findMany({
    where: { userId },
    include: {
      video: {
        include: { category: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const initialMemos = memos.map((m) => ({
    videoId: m.videoId,
    content: m.content,
    updatedAt: m.updatedAt.toISOString(),
    video: {
      id: m.video.id,
      title: m.video.title,
      thumbnailUrl: m.video.thumbnailUrl,
      categoryName: m.video.category?.name ?? null,
      videoUrl: m.video.videoUrl,
      ratingText: m.video.ratingText,
      durationText: m.video.durationText,
    },
  }))

  return <MyMemosClient initialMemos={initialMemos} />
}
