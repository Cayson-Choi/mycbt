import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params
    const id = parseInt(categoryId)
    if (isNaN(id)) {
      return NextResponse.json({ error: "잘못된 카테고리 ID" }, { status: 400 })
    }

    const category = await prisma.examCategory.findUnique({
      where: { id, isActive: true },
      select: { id: true, name: true, description: true },
    })

    if (!category) {
      return NextResponse.json({ error: "카테고리를 찾을 수 없습니다" }, { status: 404 })
    }

    const exams = await prisma.exam.findMany({
      where: {
        categoryId: id,
        isPublished: true,
        examMode: "PRACTICE",
      },
      select: {
        id: true,
        name: true,
        year: true,
        round: true,
        durationMinutes: true,
        minTier: true,
        subjects: {
          select: {
            questionsPerAttempt: true,
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ year: "desc" }, { round: "asc" }],
    })

    const examList = exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      year: exam.year,
      round: exam.round,
      duration_minutes: exam.durationMinutes,
      min_tier: exam.minTier,
      total_questions: exam._count.questions,
      questions_per_attempt: exam.subjects.reduce(
        (sum, s) => sum + s.questionsPerAttempt,
        0
      ),
    }))

    const response = NextResponse.json({
      category,
      exams: examList,
    })
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=120"
    )
    return response
  } catch (error) {
    console.error("Category exams GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
