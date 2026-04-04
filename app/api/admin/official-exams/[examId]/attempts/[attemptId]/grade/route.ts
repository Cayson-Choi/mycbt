import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
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

    const { examId, attemptId } = await params
    const examIdNum = parseInt(examId)
    const attemptIdNum = parseInt(attemptId)

    // attempt 확인
    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptIdNum, examId: examIdNum },
      select: { id: true, examId: true, status: true, totalQuestions: true },
    })

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.status !== "SUBMITTED") {
      return NextResponse.json({ error: "제출된 시험이 아닙니다" }, { status: 400 })
    }

    const body = await request.json()
    const { grades } = body as {
      grades: { question_id: number; awarded_points: number }[]
    }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return NextResponse.json({ error: "채점 데이터가 필요합니다" }, { status: 400 })
    }

    // 해당 문제의 배점 확인
    const questionIds = grades.map((g) => g.question_id)
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, points: true, questionType: true },
    })

    const questionsMap = new Map<number, (typeof questions)[0]>()
    questions.forEach((q) => questionsMap.set(q.id, q))

    // 각 주관식 문항 채점
    for (const grade of grades) {
      const q = questionsMap.get(grade.question_id)
      if (!q) continue
      if (q.questionType === "MULTIPLE_CHOICE") continue

      const maxPoints = q.points || 1
      const awardedPoints = Math.max(
        0,
        Math.min(grade.awarded_points, maxPoints)
      )

      await prisma.attemptItem.update({
        where: {
          attemptId_questionId: {
            attemptId: attemptIdNum,
            questionId: grade.question_id,
          },
        },
        data: {
          awardedPoints,
          isCorrect: awardedPoints > 0,
          gradingStatus: "MANUAL_GRADED",
        },
      })
    }

    // 모든 주관식 문항이 GRADED 되었는지 확인
    const pendingItems = await prisma.attemptItem.findMany({
      where: {
        attemptId: attemptIdNum,
        gradingStatus: "PENDING",
      },
      select: { questionId: true },
    })

    const allGraded = pendingItems.length === 0

    if (allGraded) {
      // 전체 점수 재계산
      const allItems = await prisma.attemptItem.findMany({
        where: { attemptId: attemptIdNum },
        select: { questionId: true, awardedPoints: true, isCorrect: true },
      })

      let totalPointsEarned = 0
      let totalCorrect = 0
      allItems.forEach((item) => {
        totalPointsEarned += item.awardedPoints || 0
        if (item.isCorrect) totalCorrect++
      })

      await prisma.attempt.update({
        where: { id: attemptIdNum },
        data: {
          totalScore: totalPointsEarned,
          totalCorrect,
          gradingStatus: "COMPLETED",
        },
      })

      // subject_scores 재계산
      const attemptQuestions = await prisma.attemptQuestion.findMany({
        where: { attemptId: attemptIdNum },
        include: {
          question: { select: { subjectId: true, points: true } },
        },
      })

      const itemsMap = new Map<number, (typeof allItems)[0]>()
      allItems.forEach((item) => itemsMap.set(item.questionId, item))

      const subjectStats = new Map<
        number,
        { correct: number; total: number; pointsEarned: number }
      >()
      for (const aq of attemptQuestions) {
        const subjectId = aq.question.subjectId
        if (!subjectStats.has(subjectId)) {
          subjectStats.set(subjectId, {
            correct: 0,
            total: 0,
            pointsEarned: 0,
          })
        }
        const stats = subjectStats.get(subjectId)!
        stats.total++

        const item = itemsMap.get(aq.questionId)
        if (item) {
          stats.pointsEarned += item.awardedPoints || 0
          if (item.isCorrect) stats.correct++
        }
      }

      // 기존 subject_scores 삭제 후 재생성
      await prisma.subjectScore.deleteMany({
        where: { attemptId: attemptIdNum },
      })

      for (const [subjectId, stats] of subjectStats.entries()) {
        await prisma.subjectScore.create({
          data: {
            attemptId: attemptIdNum,
            subjectId,
            subjectQuestions: stats.total,
            subjectCorrect: stats.correct,
            subjectScore: stats.pointsEarned,
          },
        })
      }

      return NextResponse.json({
        success: true,
        all_graded: true,
        total_score: totalPointsEarned,
        total_correct: totalCorrect,
      })
    }

    return NextResponse.json({
      success: true,
      all_graded: false,
      pending_count: pendingItems.length,
    })
  } catch (error) {
    console.error("Admin grade error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
