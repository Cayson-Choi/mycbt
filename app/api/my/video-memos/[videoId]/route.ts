import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

async function requireAuthAndVideoId(
  params: Promise<{ videoId: string }>
): Promise<
  | { error: NextResponse }
  | { userId: string; videoId: number }
> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        { error: "로그인이 필요합니다" },
        { status: 401 }
      ),
    }
  }

  const { videoId: videoIdStr } = await params
  const videoId = parseInt(videoIdStr, 10)
  if (Number.isNaN(videoId)) {
    return {
      error: NextResponse.json({ error: "잘못된 videoId" }, { status: 400 }),
    }
  }

  return { userId: session.user.id, videoId }
}

// GET: 특정 강의의 본인 메모
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const result = await requireAuthAndVideoId(params)
  if ("error" in result) return result.error
  const { userId, videoId } = result

  try {
    const memo = await prisma.videoMemo.findUnique({
      where: { userId_videoId: { userId, videoId } },
      select: { content: true, updatedAt: true },
    })

    if (!memo) {
      return NextResponse.json({ content: "", updatedAt: null })
    }

    return NextResponse.json(memo)
  } catch (error) {
    console.error("video-memo get error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// PUT: 메모 upsert (빈 문자열도 저장 허용)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const result = await requireAuthAndVideoId(params)
  if ("error" in result) return result.error
  const { userId, videoId } = result

  try {
    const body = await request.json()
    const content = typeof body?.content === "string" ? body.content : ""

    const memo = await prisma.videoMemo.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: { userId, videoId, content },
      update: { content },
      select: { content: true, updatedAt: true },
    })

    return NextResponse.json(memo)
  } catch (error) {
    console.error("video-memo upsert error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// DELETE: 메모 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const result = await requireAuthAndVideoId(params)
  if ("error" in result) return result.error
  const { userId, videoId } = result

  try {
    await prisma.videoMemo.deleteMany({
      where: { userId, videoId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("video-memo delete error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
