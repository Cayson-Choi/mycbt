import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { attemptId } = await params
    const aid = Number(attemptId)
    const { question_id, selected, answer_text, answer_image } = await request.json()

    if (!question_id || (selected === undefined && answer_text === undefined && answer_image === undefined)) {
      return NextResponse.json({ error: "question_id와 답안이 필요합니다" }, { status: 400 })
    }

    const attempt = await prisma.attempt.findUnique({
      where: { id: aid },
      select: { userId: true, status: true, expiresAt: true },
    })

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "진행 중인 시험이 아닙니다" }, { status: 400 })
    }
    if (new Date() >= attempt.expiresAt) {
      return NextResponse.json({ error: "시험 시간이 만료되었습니다" }, { status: 400 })
    }

    const upsertData: any = {}
    if (selected !== undefined) upsertData.selected = selected
    if (answer_text !== undefined) upsertData.answerText = answer_text
    if (answer_image !== undefined) upsertData.answerImage = answer_image || null

    await prisma.attemptItem.upsert({
      where: {
        attemptId_questionId: { attemptId: aid, questionId: Number(question_id) },
      },
      update: upsertData,
      create: {
        attemptId: aid,
        questionId: Number(question_id),
        selected: selected ?? null,
        answerText: answer_text ?? null,
        answerImage: answer_image ?? null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Save answer error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
