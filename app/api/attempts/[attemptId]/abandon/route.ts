import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { attemptId } = await params
    const aid = Number(attemptId)

    const attempt = await prisma.attempt.findFirst({
      where: { id: aid, userId: session.user.id, status: "IN_PROGRESS" },
    })

    if (!attempt) {
      return NextResponse.json({ error: "삭제할 시험이 없습니다" }, { status: 404 })
    }

    // Cascade가 설정되어 있으므로 attempt 삭제 시 관련 데이터 자동 삭제
    await prisma.attemptItem.deleteMany({ where: { attemptId: aid } })
    await prisma.subjectScore.deleteMany({ where: { attemptId: aid } })
    await prisma.attemptQuestion.deleteMany({ where: { attemptId: aid } })
    await prisma.attempt.delete({ where: { id: aid } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Abandon attempt error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
