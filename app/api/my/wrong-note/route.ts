import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * 오답노트 북마크/메모 토글 및 저장
 * Body: { questionId, bookmarked?, userMemo? }
 */
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const { questionId, bookmarked, userMemo } = body

    if (typeof questionId !== "number") {
      return NextResponse.json({ error: "questionId 필수" }, { status: 400 })
    }

    // upsert
    const existing = await prisma.wrongNoteItem.findUnique({
      where: { userId_questionId: { userId, questionId } },
    })

    const updateData: { bookmarked?: boolean; userMemo?: string | null } = {}
    if (typeof bookmarked === "boolean") updateData.bookmarked = bookmarked
    if (typeof userMemo === "string" || userMemo === null) updateData.userMemo = userMemo

    if (existing) {
      await prisma.wrongNoteItem.update({
        where: { userId_questionId: { userId, questionId } },
        data: updateData,
      })
    } else {
      await prisma.wrongNoteItem.create({
        data: {
          userId,
          questionId,
          bookmarked: updateData.bookmarked ?? false,
          userMemo: updateData.userMemo ?? null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Wrong-note update error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
