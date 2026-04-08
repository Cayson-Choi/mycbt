import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  return user?.isAdmin ? session.user.id : null
}

// 시험 목록 (카테고리별)
export async function GET(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const categoryId = request.nextUrl.searchParams.get("categoryId")

    const where = categoryId ? { categoryId: parseInt(categoryId) } : {}

    const exams = await prisma.exam.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, grade: true } },
        subjects: {
          select: {
            id: true,
            name: true,
            questionsPerAttempt: true,
            orderNo: true,
          },
          orderBy: { orderNo: "asc" },
        },
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: [
        { categoryId: "asc" },
        { year: "desc" },
        { round: "asc" },
        { sortOrder: "asc" },
      ],
    })

    return NextResponse.json(
      exams.map((e) => ({
        id: e.id,
        category_id: e.categoryId,
        category_name: e.category.name,
        category_grade: e.category.grade || "기타",
        name: e.name,
        year: e.year,
        round: e.round,
        exam_mode: e.examMode,
        exam_type: e.examType,
        duration_minutes: e.durationMinutes,
        is_published: e.isPublished,
        min_tier: e.minTier,
        sort_order: e.sortOrder,
        subjects: e.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          questions_per_attempt: s.questionsPerAttempt,
          order_no: s.orderNo,
        })),
        question_count: e._count.questions,
        attempt_count: e._count.attempts,
      }))
    )
  } catch (error) {
    console.error("Admin exams GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 시험 생성
export async function POST(request: NextRequest) {
  try {
    const adminId = await checkAdmin()
    if (!adminId)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const body = await request.json()
    const { category_id, year, round, exam_type, duration_minutes, subjects } = body as {
      category_id: number
      year: number
      round: number
      exam_type?: string
      duration_minutes?: number
      subjects?: { name: string; questions_per_attempt: number }[]
    }
    const examType = exam_type === "PRACTICAL" ? "PRACTICAL" as const : "WRITTEN" as const

    if (!category_id || !year || !round) {
      return NextResponse.json(
        { error: "카테고리, 년도, 회차는 필수입니다" },
        { status: 400 }
      )
    }

    if (year < 2000 || year > 2100) {
      return NextResponse.json(
        { error: "년도는 2000~2100 사이여야 합니다" },
        { status: 400 }
      )
    }

    if (round < 1 || round > 10) {
      return NextResponse.json(
        { error: "회차는 1~10 사이여야 합니다" },
        { status: 400 }
      )
    }

    // 카테고리 확인
    const category = await prisma.examCategory.findUnique({
      where: { id: category_id },
    })
    if (!category) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 중복 확인
    const existing = await prisma.exam.findUnique({
      where: {
        categoryId_year_round_examType: {
          categoryId: category_id,
          year,
          round,
          examType,
        },
      },
    })
    if (existing) {
      return NextResponse.json(
        { error: `${year}년 ${round}회차 ${examType === "PRACTICAL" ? "실기" : "필기"} 시험이 이미 존재합니다` },
        { status: 400 }
      )
    }

    // 과목 결정: 직접 지정 or 같은 카테고리 기존 시험에서 복사
    let subjectsToCreate = subjects

    if (!subjectsToCreate || subjectsToCreate.length === 0) {
      // 기존 시험에서 과목 복사
      const existingExam = await prisma.exam.findFirst({
        where: { categoryId: category_id },
        include: {
          subjects: {
            select: { name: true, questionsPerAttempt: true, orderNo: true },
            orderBy: { orderNo: "asc" },
          },
        },
      })

      if (existingExam && existingExam.subjects.length > 0) {
        subjectsToCreate = existingExam.subjects.map((s) => ({
          name: s.name,
          questions_per_attempt: s.questionsPerAttempt,
        }))
      }
    }

    // 시험 생성
    const typeLabel = examType === "PRACTICAL" ? "실기" : ""
    const exam = await prisma.exam.create({
      data: {
        categoryId: category_id,
        name: `${category.name} ${typeLabel ? typeLabel + " " : ""}${year}년 ${round}회`,
        year,
        round,
        examType,
        durationMinutes: duration_minutes || 60,
        isPublished: true,
        subjects: subjectsToCreate
          ? {
              create: subjectsToCreate.map((s, idx) => ({
                name: s.name,
                questionsPerAttempt: s.questions_per_attempt,
                orderNo: idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        subjects: true,
      },
    })

    // 감사 로그
    await prisma.auditLog.create({
      data: {
        adminUserId: adminId,
        actionType: "CREATE",
        targetTable: "exams",
        targetId: String(exam.id),
        newData: { year, round, categoryId: category_id },
      },
    })

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        name: exam.name,
        year: exam.year,
        round: exam.round,
        subjects: exam.subjects.length,
      },
    })
  } catch (error) {
    console.error("Admin exams POST error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
