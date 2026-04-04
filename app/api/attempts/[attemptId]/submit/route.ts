import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
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

    const attempt = await prisma.attempt.findUnique({
      where: { id: aid },
      include: { exam: { select: { examMode: true } } },
    })

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "이미 제출되었거나 만료된 시험입니다" }, { status: 400 })
    }
    if (new Date() >= attempt.expiresAt) {
      return NextResponse.json({ error: "시험 시간이 만료되었습니다" }, { status: 400 })
    }

    // 시험지 문제 + 정답 조회
    const attemptQuestions = await prisma.attemptQuestion.findMany({
      where: { attemptId: aid },
      include: {
        question: {
          select: { id: true, answer: true, questionType: true, subjectId: true, points: true },
        },
      },
    })

    // 학생 답안 조회
    const studentAnswers = await prisma.attemptItem.findMany({
      where: { attemptId: aid },
    })
    const answersMap = new Map(studentAnswers.map((a) => [a.questionId, a]))

    const isOfficial = attempt.exam.examMode === "OFFICIAL"
    let totalCorrect = 0
    let totalPointsEarned = 0
    let hasSubjective = false
    const subjectStats = new Map<number, { correct: number; total: number; pointsEarned: number; pointsTotal: number }>()

    // 채점 결과를 메모리에서 계산 (DB 호출 없음)
    const itemsToCreate: Array<{
      attemptId: number
      questionId: number
      selected: number | null
      answerText: string | null
      isCorrect: boolean | null
      awardedPoints: number | null
      gradingStatus: "AI_GRADED" | "PENDING"
    }> = []
    const itemsToUpdate: Array<{
      questionId: number
      isCorrect: boolean | null
      awardedPoints: number | null
      gradingStatus: "AI_GRADED" | "PENDING"
    }> = []

    for (const aq of attemptQuestions) {
      const q = aq.question
      const subjectId = q.subjectId
      const questionPoints = q.points || 1
      const studentItem = answersMap.get(q.id)

      if (!subjectStats.has(subjectId)) {
        subjectStats.set(subjectId, { correct: 0, total: 0, pointsEarned: 0, pointsTotal: 0 })
      }
      const stats = subjectStats.get(subjectId)!
      stats.total++
      stats.pointsTotal += questionPoints

      if (q.questionType === "MULTIPLE_CHOICE") {
        const isCorrect = studentItem?.selected === q.answer
        if (isCorrect) {
          totalCorrect++
          totalPointsEarned += questionPoints
          stats.correct++
          stats.pointsEarned += questionPoints
        }

        if (studentItem) {
          itemsToUpdate.push({
            questionId: q.id,
            isCorrect,
            awardedPoints: isCorrect ? questionPoints : 0,
            gradingStatus: "AI_GRADED",
          })
        } else {
          itemsToCreate.push({
            attemptId: aid,
            questionId: q.id,
            selected: null,
            answerText: null,
            isCorrect,
            awardedPoints: isCorrect ? questionPoints : 0,
            gradingStatus: "AI_GRADED",
          })
        }
      } else {
        hasSubjective = true

        if (studentItem) {
          itemsToUpdate.push({
            questionId: q.id,
            isCorrect: null,
            awardedPoints: null,
            gradingStatus: "PENDING",
          })
        } else {
          itemsToCreate.push({
            attemptId: aid,
            questionId: q.id,
            selected: null,
            answerText: null,
            isCorrect: null,
            awardedPoints: null,
            gradingStatus: "PENDING",
          })
        }
      }
    }

    // 배치 처리: 새 항목은 createMany, 기존 항목은 개별 update를 Promise.all로 병렬 실행
    const dbOps: Promise<unknown>[] = []

    if (itemsToCreate.length > 0) {
      dbOps.push(prisma.attemptItem.createMany({ data: itemsToCreate }))
    }

    if (itemsToUpdate.length > 0) {
      dbOps.push(
        ...itemsToUpdate.map((item) =>
          prisma.attemptItem.update({
            where: { attemptId_questionId: { attemptId: aid, questionId: item.questionId } },
            data: {
              isCorrect: item.isCorrect,
              awardedPoints: item.awardedPoints,
              gradingStatus: item.gradingStatus,
            },
          })
        )
      )
    }

    await Promise.all(dbOps)

    const totalScore = isOfficial
      ? totalPointsEarned
      : Math.round((totalCorrect / attempt.totalQuestions) * 100)

    // 과목별 점수 일괄 저장
    const subjectScoreData = Array.from(subjectStats.entries()).map(([subjectId, stats]) => ({
      attemptId: aid,
      subjectId,
      subjectQuestions: stats.total,
      subjectCorrect: stats.correct,
      subjectScore: isOfficial
        ? stats.pointsEarned
        : Math.round((stats.correct / stats.total) * 100),
    }))

    await prisma.subjectScore.createMany({ data: subjectScoreData })

    // attempt 업데이트
    const submittedAt = new Date()
    await prisma.attempt.update({
      where: { id: aid },
      data: {
        status: "SUBMITTED",
        submittedAt,
        totalCorrect,
        totalScore,
        gradingStatus: hasSubjective ? "PENDING" : "COMPLETED",
      },
    })

    // daily_best_scores 업데이트 (PRACTICE만)
    if (!isOfficial) {
      const kstDate = new Date(submittedAt.getTime() + 9 * 60 * 60 * 1000)
      const kstDateOnly = new Date(kstDate.toISOString().split("T")[0])

      const existingBest = await prisma.dailyBestScore.findUnique({
        where: {
          kstDate_examId_userId: {
            kstDate: kstDateOnly,
            examId: attempt.examId,
            userId: session.user.id,
          },
        },
      })

      if (!existingBest || totalScore > existingBest.bestScore) {
        await prisma.dailyBestScore.upsert({
          where: {
            kstDate_examId_userId: {
              kstDate: kstDateOnly,
              examId: attempt.examId,
              userId: session.user.id,
            },
          },
          update: { bestScore: totalScore, bestSubmittedAt: submittedAt, attemptId: aid },
          create: {
            kstDate: kstDateOnly,
            examId: attempt.examId,
            userId: session.user.id,
            bestScore: totalScore,
            bestSubmittedAt: submittedAt,
            attemptId: aid,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      attempt_id: aid,
      total_questions: attempt.totalQuestions,
      total_correct: totalCorrect,
      total_score: totalScore,
      submitted_at: submittedAt.toISOString(),
    })
  } catch (error) {
    console.error("Submit attempt error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
