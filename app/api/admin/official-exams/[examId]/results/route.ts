import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
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

    const { examId } = await params
    const examIdNum = parseInt(examId)

    // 시험 정보 조회
    const exam = await prisma.exam.findUnique({
      where: { id: examIdNum },
      select: { id: true, name: true, examMode: true, durationMinutes: true },
    })
    if (!exam) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }

    // 제출된 attempts 조회
    const attempts = await prisma.attempt.findMany({
      where: { examId: examIdNum, status: "SUBMITTED" },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        totalQuestions: true,
        totalCorrect: true,
        totalScore: true,
        gradingStatus: true,
      },
      orderBy: { totalScore: "desc" },
    })

    // 사용자 정보 조회
    const userIds = attempts.map((a) => a.userId)
    const profiles = userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, studentId: true },
        })
      : []

    const profilesMap: Record<string, any> = {}
    for (const p of profiles) {
      profilesMap[p.id] = p
    }

    const results = attempts.map((a) => {
      const p = profilesMap[a.userId]
      return {
        attempt_id: a.id,
        user_id: a.userId,
        student_id: p?.studentId || "",
        name: p?.name || "",
        affiliation: "",
        total_questions: a.totalQuestions,
        total_correct: a.totalCorrect,
        total_score: a.totalScore,
        grading_status: a.gradingStatus === "PENDING" ? "PENDING_MANUAL" : a.gradingStatus,
        started_at: a.startedAt?.toISOString(),
        submitted_at: a.submittedAt?.toISOString(),
      }
    })

    return NextResponse.json({
      exam: {
        id: exam.id,
        name: exam.name,
        exam_mode: exam.examMode,
        duration_minutes: exam.durationMinutes,
      },
      results,
    })
  } catch (error) {
    console.error("Official exam results error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
