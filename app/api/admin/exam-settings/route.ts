import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

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

    // 시험 목록
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        examMode: true,
        durationMinutes: true,
        sortOrder: true,
        category: { select: { name: true } },
      },
      orderBy: { sortOrder: "asc" },
    })

    // 과목 목록
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        examId: true,
        name: true,
        questionsPerAttempt: true,
        orderNo: true,
      },
      orderBy: { orderNo: "asc" },
    })

    // 과목별 문제 수 집계
    const questionCounts = await prisma.question.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    })

    const subjectQuestionCounts: Record<number, number> = {}
    for (const row of questionCounts) {
      subjectQuestionCounts[row.subjectId] = row._count.id
    }

    return NextResponse.json({
      exams: exams.map((e) => ({
        id: e.id,
        name: e.category?.name || e.name,
        exam_mode: e.examMode,
        duration_minutes: e.durationMinutes,
        sort_order: e.sortOrder,
      })),
      subjects: subjects.map((s) => ({
        id: s.id,
        exam_id: s.examId,
        name: s.name,
        questions_per_attempt: s.questionsPerAttempt,
        order_no: s.orderNo,
        total_questions: subjectQuestionCounts[s.id] || 0,
      })),
    })
  } catch (error) {
    console.error("Exam settings GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { subjects, exams: examUpdates } = body as {
      subjects?: { id: number; questions_per_attempt: number }[]
      exams?: { id: number; duration_minutes: number }[]
    }

    if (
      (!Array.isArray(subjects) || subjects.length === 0) &&
      (!Array.isArray(examUpdates) || examUpdates.length === 0)
    ) {
      return NextResponse.json({ error: "수정할 정보가 없습니다" }, { status: 400 })
    }

    // 과목 유효성 검사
    if (subjects && subjects.length > 0) {
      for (const s of subjects) {
        if (typeof s.id !== "number" || typeof s.questions_per_attempt !== "number") {
          return NextResponse.json({ error: "잘못된 데이터 형식입니다" }, { status: 400 })
        }
        if (!Number.isInteger(s.questions_per_attempt) || s.questions_per_attempt < 0) {
          return NextResponse.json(
            { error: "출제 문항 수는 0 이상의 정수여야 합니다" },
            { status: 400 }
          )
        }
      }
    }

    // 시험 시간 유효성 검사
    if (examUpdates && examUpdates.length > 0) {
      for (const e of examUpdates) {
        if (typeof e.id !== "number" || typeof e.duration_minutes !== "number") {
          return NextResponse.json({ error: "잘못된 데이터 형식입니다" }, { status: 400 })
        }
        if (
          !Number.isInteger(e.duration_minutes) ||
          e.duration_minutes < 1 ||
          e.duration_minutes > 300
        ) {
          return NextResponse.json(
            { error: "시험 시간은 1~300분이어야 합니다" },
            { status: 400 }
          )
        }
      }
    }

    // 각 과목 업데이트
    if (subjects && subjects.length > 0) {
      for (const s of subjects) {
        await prisma.subject.update({
          where: { id: s.id },
          data: { questionsPerAttempt: s.questions_per_attempt },
        })
      }
    }

    // 시험 시간 업데이트
    if (examUpdates && examUpdates.length > 0) {
      for (const e of examUpdates) {
        await prisma.exam.update({
          where: { id: e.id },
          data: { durationMinutes: e.duration_minutes },
        })
      }
    }

    return NextResponse.json({
      message: "설정이 저장되었습니다",
      updated_count: (subjects?.length || 0) + (examUpdates?.length || 0),
    })
  } catch (error) {
    console.error("Exam settings PUT error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
