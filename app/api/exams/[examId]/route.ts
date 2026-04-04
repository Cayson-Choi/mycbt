import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params

    const exam = await prisma.exam.findUnique({
      where: { id: Number(examId) },
      include: { category: true },
    })

    if (!exam) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }

    const response = NextResponse.json(exam)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
