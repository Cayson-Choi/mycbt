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

        await prisma.attemptItem.upsert({
          where: { attemptId_questionId: { attemptId: aid, questionId: q.id } },
          update: { isCorrect, awardedPoints: isCorrect ? questionPoints : 0, gradingStatus: "AI_GRADED" },
          create: {
            attemptId: aid,
            questionId: q.id,
            selected: studentItem?.selected ?? null,
            isCorrect,
            awardedPoints: isCorrect ? questionPoints : 0,
            gradingStatus: "AI_GRADED",
          },
        })
      } else {
        hasSubjective = true
        await prisma.attemptItem.upsert({
          where: { attemptId_questionId: { attemptId: aid, questionId: q.id } },
          update: { isCorrect: null, awardedPoints: null, gradingStatus: "PENDING" },
          create: {
            attemptId: aid,
            questionId: q.id,
            answerText: studentItem?.answerText ?? null,
            isCorrect: null,
            awardedPoints: null,
            gradingStatus: "PENDING",
          },
        })
      }
    }

    const totalScore = isOfficial
      ? totalPointsEarned
      : Math.round((totalCorrect / attempt.totalQuestions) * 100)

    // 과목별 점수 저장
    for (const [subjectId, stats] of subjectStats.entries()) {
      const subjectScore = isOfficial
        ? stats.pointsEarned
        : Math.round((stats.correct / stats.total) * 100)

      await prisma.subjectScore.create({
        data: {
          attemptId: aid,
          subjectId,
          subjectQuestions: stats.total,
          subjectCorrect: stats.correct,
          subjectScore,
        },
      })
    }

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
