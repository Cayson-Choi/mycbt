import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const userId = session.user.id

    // 1. 사용자의 모든 응시 기록 조회 (제출된 것만)
    const attempts = await prisma.attempt.findMany({
      where: {
        userId,
        status: "SUBMITTED",
      },
      select: {
        id: true,
        examId: true,
        startedAt: true,
        submittedAt: true,
        totalScore: true,
        gradingStatus: true,
        exam: {
          select: { name: true },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    // 2. 모든 응시의 과목별 점수를 한번에 조회 (N+1 방지)
    const attemptIds = attempts.map((a) => a.id)
    let allSubjectScores: any[] = []

    if (attemptIds.length > 0) {
      allSubjectScores = await prisma.subjectScore.findMany({
        where: { attemptId: { in: attemptIds } },
        select: {
          attemptId: true,
          subjectId: true,
          subjectScore: true,
          subjectCorrect: true,
          subjectQuestions: true,
          subject: {
            select: { name: true },
          },
        },
        orderBy: { subjectId: "asc" },
      })
    }

    // attemptId별로 그룹핑
    const scoresByAttempt = new Map<number, any[]>()
    for (const score of allSubjectScores) {
      const list = scoresByAttempt.get(score.attemptId) || []
      list.push({
        attempt_id: score.attemptId,
        subject_id: score.subjectId,
        subject_score: score.subjectScore,
        subject_correct: score.subjectCorrect,
        subject_questions: score.subjectQuestions,
        subjects: { name: score.subject.name },
      })
      scoresByAttempt.set(score.attemptId, list)
    }

    const attemptsWithSubjects = attempts.map((attempt) => ({
      id: attempt.id,
      exam_id: attempt.examId,
      started_at: attempt.startedAt,
      submitted_at: attempt.submittedAt,
      total_score: attempt.totalScore,
      grading_status: attempt.gradingStatus,
      exam_name: attempt.exam?.name || "알 수 없음",
      subject_scores: scoresByAttempt.get(attempt.id) || [],
    }))

    // 3. 통계 계산
    const totalAttempts = attempts.length
    const scores = attempts
      .map((a) => a.totalScore)
      .filter((s): s is number => s !== null)
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0
    const passCount = scores.filter((s) => s >= 60).length

    // 4. 시험별 통계
    const examStats = attempts.reduce((acc: any, attempt) => {
      const examId = attempt.examId
      const examName = attempt.exam?.name || "알 수 없음"

      if (!acc[examId]) {
        acc[examId] = {
          exam_id: examId,
          exam_name: examName,
          count: 0,
          scores: [] as number[],
        }
      }

      acc[examId].count++
      if (attempt.totalScore !== null) {
        acc[examId].scores.push(attempt.totalScore)
      }

      return acc
    }, {})

    const examStatsArray = Object.values(examStats).map((stat: any) => ({
      exam_id: stat.exam_id,
      exam_name: stat.exam_name,
      attempt_count: stat.count,
      avg_score:
        stat.scores.length > 0
          ? Math.round(
              stat.scores.reduce((a: number, b: number) => a + b, 0) /
                stat.scores.length
            )
          : 0,
      max_score: stat.scores.length > 0 ? Math.max(...stat.scores) : 0,
    }))

    return NextResponse.json({
      attempts: attemptsWithSubjects,
      stats: {
        total_attempts: totalAttempts,
        avg_score: avgScore,
        max_score: maxScore,
        pass_count: passCount,
        pass_rate:
          totalAttempts > 0
            ? Math.round((passCount / totalAttempts) * 100)
            : 0,
      },
      exam_stats: examStatsArray,
    })
  } catch (error) {
    console.error("My history error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
