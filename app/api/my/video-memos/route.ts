import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET: 본인의 모든 동영상 메모 (video 정보 포함)
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
  }

  try {
    const memos = await prisma.videoMemo.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        video: {
          include: {
            category: { select: { name: true } },
          },
        },
      },
    })

    const result = memos.map((m) => ({
      videoId: m.videoId,
      content: m.content,
      updatedAt: m.updatedAt,
      video: {
        id: m.video.id,
        title: m.video.title,
        thumbnailUrl: m.video.thumbnailUrl,
        categoryName: m.video.category?.name ?? null,
        ratingText: m.video.ratingText,
        durationText: m.video.durationText,
        videoUrl: m.video.videoUrl,
      },
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("video-memos list error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
