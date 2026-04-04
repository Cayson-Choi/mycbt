import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { gradeSubjectiveAnswer } from "@/lib/openrouter"
import { NextResponse } from "next/server"

// Vercel 서버리스 함수 타임아웃 설정
export const maxDuration = 300

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
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

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "AI 채점 API 키가 설정되지 않았습니다" },
        { status: 500 }
      )
    }

    const { examId } = await params
    const examIdNum = parseInt(examId)

    // attempt_id 파라미터가 있으면 1명만 처리
    const url = new URL(request.url)
    const singleAttemptId = url.searchParams.get("attempt_id")

    // PENDING 상태의 attempts 조회
    const where: any = {
      examId: examIdNum,
      status: "SUBMITTED",
      gradingStatus: "PENDING",
    }
    if (singleAttemptId) {
      where.id = parseInt(singleAttemptId)
    }

    const attempts = await prisma.attempt.findMany({
      where,
      select: { id: true, userId: true, totalQuestions: true },
    })

    if (!attempts || attempts.length === 0) {
      return NextResponse.json(
        { error: "채점 대기 중인 시험이 없습니다" },
        { status: 400 }
      )
    }

    console.log(`[AI-GRADE] Found ${attempts.length} PENDING attempts`)

    let totalGraded = 0
    let totalFailed = 0
    let studentsGraded = 0

    for (const attempt of attempts) {
      console.log(`[AI-GRADE] Processing attempt ${attempt.id}`)

      const allItems = await prisma.attemptItem.findMany({
        where: { attemptId: attempt.id },
        select: {
          attemptId: true,
          questionId: true,
          answerText: true,
          gradingStatus: true,
          awardedPoints: true,
        },
      })

      if (!allItems || allItems.length === 0) continue

      // 문제 정보 조회
      const questionIds = allItems.map((item) => item.questionId)
      const questions = await prisma.question.findMany({
        where: { id: { in: questionIds } },
        select: {
          id: true,
          questionText: true,
          answerText: true,
          points: true,
          questionType: true,
        },
      })

      const questionsMap = new Map<number, (typeof questions)[0]>()
      questions.forEach((q) => questionsMap.set(q.id, q))

      // 주관식이면서 아직 채점 안 된 항목 필터링
      const ungradedSubjective = allItems.filter((item) => {
        const q = questionsMap.get(item.questionId)
        if (!q) return false
        if (q.questionType === "MULTIPLE_CHOICE") return false
        if (
          item.gradingStatus === "MANUAL_GRADED" ||
          item.gradingStatus === "AI_GRADED"
        )
          return false
        return true
      })

      if (ungradedSubjective.length === 0) continue

      for (const item of ungradedSubjective) {
        const question = questionsMap.get(item.questionId)
        if (!question) continue

        const studentAnswer = item.answerText?.trim()

        // 빈 답안은 0점 처리
        if (!studentAnswer) {
          await prisma.attemptItem.update({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId: item.questionId,
              },
            },
            data: {
              awardedPoints: 0,
              isCorrect: false,
              gradingStatus: "AI_GRADED",
            },
          })
          totalGraded++
          continue
        }

        // AI 채점 호출
        const result = await gradeSubjectiveAnswer({
          questionText: question.questionText,
          answerText: question.answerText || "",
          studentAnswer,
          points: question.points || 1,
          questionType:
            question.questionType === "SHORT_ANSWER"
              ? "SHORT_ANSWER"
              : "ESSAY",
        })

        if (result !== null) {
          const updateData: any = {
            awardedPoints: result.score,
            isCorrect: result.score > 0,
            gradingStatus: "AI_GRADED" as const,
          }
          if (result.feedback) {
            updateData.aiFeedback = result.feedback
          }

          await prisma.attemptItem.update({
            where: {
              attemptId_questionId: {
                attemptId: attempt.id,
                questionId: item.questionId,
              },
            },
            data: updateData,
          })
          totalGraded++
        } else {
          totalFailed++
        }

        // rate limit 대비 딜레이
        await delay(500)
      }

      // 모든 주관식 채점 완료 확인
      const afterItems = await prisma.attemptItem.findMany({
        where: { attemptId: attempt.id },
        select: { questionId: true, gradingStatus: true },
      })

      const stillUngraded = afterItems.filter((item) => {
        const q = questionsMap.get(item.questionId)
        if (!q || q.questionType === "MULTIPLE_CHOICE") return false
        return (
          item.gradingStatus !== "MANUAL_GRADED" &&
          item.gradingStatus !== "AI_GRADED"
        )
      })

      const allDone = stillUngraded.length === 0

      if (allDone) {
        // 전체 점수 재계산
        const finalItems = await prisma.attemptItem.findMany({
          where: { attemptId: attempt.id },
          select: { questionId: true, awardedPoints: true, isCorrect: true },
        })

        let totalPointsEarned = 0
        let totalCorrect = 0
        finalItems.forEach((fi) => {
          totalPointsEarned += fi.awardedPoints || 0
          if (fi.isCorrect) totalCorrect++
        })

        await prisma.attempt.update({
          where: { id: attempt.id },
          data: {
            totalScore: totalPointsEarned,
            totalCorrect,
            gradingStatus: "COMPLETED",
          },
        })

        // subject_scores 재계산
        const attemptQuestions = await prisma.attemptQuestion.findMany({
          where: { attemptId: attempt.id },
          include: {
            question: { select: { subjectId: true, points: true } },
          },
        })

        const itemsMap = new Map<number, (typeof finalItems)[0]>()
        finalItems.forEach((fi) => itemsMap.set(fi.questionId, fi))

        const subjectStats = new Map<
          number,
          { correct: number; total: number; pointsEarned: number }
        >()
        for (const aq of attemptQuestions) {
          const subjectId = aq.question.subjectId
          if (!subjectStats.has(subjectId)) {
            subjectStats.set(subjectId, { correct: 0, total: 0, pointsEarned: 0 })
          }
          const stats = subjectStats.get(subjectId)!
          stats.total++

          const fi = itemsMap.get(aq.questionId)
          if (fi) {
            stats.pointsEarned += fi.awardedPoints || 0
            if (fi.isCorrect) stats.correct++
          }
        }

        // 기존 subject_scores 삭제 후 재생성
        await prisma.subjectScore.deleteMany({
          where: { attemptId: attempt.id },
        })

        for (const [subjectId, stats] of subjectStats.entries()) {
          await prisma.subjectScore.create({
            data: {
              attemptId: attempt.id,
              subjectId,
              subjectQuestions: stats.total,
              subjectCorrect: stats.correct,
              subjectScore: stats.pointsEarned,
            },
          })
        }

        studentsGraded++
      }
    }

    return NextResponse.json({
      success: true,
      totalGraded,
      totalFailed,
      studentsGraded,
      totalAttempts: attempts.length,
    })
  } catch (error) {
    console.error("[AI-GRADE] Unexpected error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
