import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// 중복 문제 조회
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    // 모든 문제 조회
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        questionCode: true,
        examId: true,
        subjectId: true,
        questionText: true,
        choice1: true,
        choice2: true,
        choice3: true,
        choice4: true,
        answer: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    })

    // 시험+과목+문제텍스트+선택지+정답 모두 동일한 경우만 중복
    const groupMap = new Map<string, typeof questions>()
    for (const q of questions) {
      const key = `${q.examId}:${q.subjectId}:${q.questionText}:${q.choice1}:${q.choice2}:${q.choice3}:${q.choice4}:${q.answer}`
      if (!groupMap.has(key)) {
        groupMap.set(key, [])
      }
      groupMap.get(key)!.push(q)
    }

    const duplicateGroups: {
      original: { id: number; question_code: string; created_at: string }
      duplicates: { id: number; question_code: string; created_at: string }[]
    }[] = []

    for (const group of groupMap.values()) {
      if (group.length > 1) {
        const [original, ...dupes] = group
        duplicateGroups.push({
          original: {
            id: original.id,
            question_code: original.questionCode,
            created_at: original.createdAt.toISOString(),
          },
          duplicates: dupes.map((d) => ({
            id: d.id,
            question_code: d.questionCode,
            created_at: d.createdAt.toISOString(),
          })),
        })
      }
    }

    const totalDuplicates = duplicateGroups.reduce(
      (sum, g) => sum + g.duplicates.length,
      0
    )

    return NextResponse.json({
      groups: duplicateGroups.length,
      total_duplicates: totalDuplicates,
      duplicateGroups,
    })
  } catch (error) {
    console.error("Duplicates GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 중복 문제 삭제
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const { ids } = (await request.json()) as { ids: number[] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "삭제할 문제 ID가 필요합니다" }, { status: 400 })
    }

    // 응시에 사용된 문제인지 확인
    const usedQuestions = await prisma.attemptQuestion.findMany({
      where: { questionId: { in: ids } },
      select: { questionId: true },
    })

    const usedIds = new Set(usedQuestions.map((q) => q.questionId))
    const safeIds = ids.filter((id) => !usedIds.has(id))
    const skippedCount = ids.length - safeIds.length

    let deletedCount = 0
    if (safeIds.length > 0) {
      const result = await prisma.question.deleteMany({
        where: { id: { in: safeIds } },
      })
      deletedCount = result.count
    }

    return NextResponse.json({
      deleted: deletedCount,
      skipped: skippedCount,
      message:
        skippedCount > 0
          ? `${deletedCount}개 삭제, ${skippedCount}개는 응시에 사용되어 건너뜀`
          : `${deletedCount}개 중복 문제가 삭제되었습니다`,
    })
  } catch (error) {
    console.error("Duplicates DELETE error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
