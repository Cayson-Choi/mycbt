import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params

    const subjects = await prisma.subject.findMany({
      where: { examId: Number(examId) },
      orderBy: { orderNo: "asc" },
    })

    // snake_case 변환 (프론트 호환)
    const mapped = subjects.map((s) => ({
      id: s.id,
      exam_id: s.examId,
      name: s.name,
      questions_per_attempt: s.questionsPerAttempt,
      order_no: s.orderNo,
    }))

    const response = NextResponse.json(mapped)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
