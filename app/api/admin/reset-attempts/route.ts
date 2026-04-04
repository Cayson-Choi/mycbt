import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { scope, exam_id, user_id } = body as {
      scope: "all" | "exam" | "user"
      exam_id?: number
      user_id?: string
    }

    if (!scope || !["all", "exam", "user"].includes(scope)) {
      return NextResponse.json({ error: "유효하지 않은 scope입니다" }, { status: 400 })
    }
    if (scope === "exam" && !exam_id) {
      return NextResponse.json({ error: "exam_id가 필요합니다" }, { status: 400 })
    }
    if (scope === "user" && !user_id) {
      return NextResponse.json({ error: "user_id가 필요합니다" }, { status: 400 })
    }

    if (scope === "all") {
      // 전체 초기화: Prisma cascade 활용하여 attempts 삭제 시 관련 테이블도 삭제
      await prisma.dailyLeaderboardSnapshot.deleteMany({})
      await prisma.dailyBestScore.deleteMany({})
      await prisma.subjectScore.deleteMany({})
      await prisma.attemptItem.deleteMany({})
      await prisma.attemptQuestion.deleteMany({})
      await prisma.attempt.deleteMany({})

      return NextResponse.json({
        message: "전체 응시 기록이 초기화되었습니다",
        scope: "all",
      })
    }

    // exam 또는 user scope: attempt_id 목록 조회 후 관련 데이터 삭제
    const where: any = {}
    if (scope === "exam") {
      where.examId = exam_id!
    } else {
      where.userId = user_id!
      if (exam_id) where.examId = exam_id
    }

    const attempts = await prisma.attempt.findMany({
      where,
      select: { id: true },
    })

    const attemptIds = attempts.map((a) => a.id)

    if (attemptIds.length === 0) {
      return NextResponse.json({
        message: "삭제할 응시 기록이 없습니다",
        scope,
        deleted_count: 0,
      })
    }

    // FK 순서대로 삭제
    if (scope === "user") {
      const snapshotWhere: any = { userId: user_id! }
      if (exam_id) snapshotWhere.examId = exam_id
      await prisma.dailyLeaderboardSnapshot.deleteMany({ where: snapshotWhere })

      const bestWhere: any = { userId: user_id! }
      if (exam_id) bestWhere.examId = exam_id
      await prisma.dailyBestScore.deleteMany({ where: bestWhere })
    } else if (scope === "exam") {
      await prisma.dailyLeaderboardSnapshot.deleteMany({
        where: { examId: exam_id! },
      })
      await prisma.dailyBestScore.deleteMany({
        where: { examId: exam_id! },
      })
    }

    await prisma.subjectScore.deleteMany({
      where: { attemptId: { in: attemptIds } },
    })
    await prisma.attemptItem.deleteMany({
      where: { attemptId: { in: attemptIds } },
    })
    await prisma.attemptQuestion.deleteMany({
      where: { attemptId: { in: attemptIds } },
    })
    await prisma.attempt.deleteMany({
      where: { id: { in: attemptIds } },
    })

    const label =
      scope === "exam"
        ? "시험별"
        : exam_id
        ? "사용자+시험별"
        : "사용자별"

    return NextResponse.json({
      message: `${label} 응시 기록이 초기화되었습니다 (${attemptIds.length}건)`,
      scope,
      deleted_count: attemptIds.length,
    })
  } catch (error) {
    console.error("Reset attempts error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
