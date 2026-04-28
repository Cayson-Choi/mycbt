import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  return user?.isAdmin ? session.user : null
}

// GET: 비디오 목록 (전체, 비활성 포함)
export async function GET() {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })

  const videos = await prisma.video.findMany({
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }, { id: "desc" }],
  })
  return NextResponse.json(videos)
}

// POST: 비디오 생성
export async function POST(request: Request) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })

  try {
    const body = await request.json()
    const {
      title,
      videoUrl,
      thumbnailUrl,
      categoryId,
      durationText,
      ratingText,
      price,
      sortOrder,
      isActive,
      minTier,
    } = body

    if (!title || !videoUrl) {
      return NextResponse.json({ error: "제목과 영상 URL은 필수입니다" }, { status: 400 })
    }

    const video = await prisma.video.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        categoryId: categoryId ?? null,
        durationText: durationText || null,
        ratingText: ratingText || null,
        price: price ?? null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        minTier: minTier || "FREE",
      },
    })

    revalidatePath("/", "layout")
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error("video create error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
