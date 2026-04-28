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

// PUT: 비디오 수정 (활성 토글 포함, 부분 업데이트)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })

  const { id } = await params
  const videoId = parseInt(id, 10)
  if (Number.isNaN(videoId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 })

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}
    const fields = [
      "title", "videoUrl", "thumbnailUrl", "categoryId",
      "durationText", "ratingText", "price", "sortOrder", "isActive",
    ] as const
    for (const k of fields) {
      if (k in body) data[k] = body[k]
    }

    const video = await prisma.video.update({ where: { id: videoId }, data })
    revalidatePath("/", "layout")
    return NextResponse.json(video)
  } catch (error) {
    console.error("video update error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// DELETE: 비디오 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await checkAdmin()
  if (!user) return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })

  const { id } = await params
  const videoId = parseInt(id, 10)
  if (Number.isNaN(videoId)) return NextResponse.json({ error: "잘못된 ID" }, { status: 400 })

  try {
    await prisma.video.delete({ where: { id: videoId } })
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("video delete error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
