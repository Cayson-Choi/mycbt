import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params
    const eid = Number(examId)

    const [totalCount, subjects] = await Promise.all([
      prisma.question.count({
        where: { examId: eid, isActive: true },
      }),
      prisma.subject.findMany({
        where: { examId: eid },
        orderBy: { orderNo: "asc" },
        select: { id: true },
      }),
    ])

    const bySubject: Record<number, number> = {}
    if (subjects.length > 0) {
      const counts = await Promise.all(
        subjects.map((s) =>
          prisma.question.count({
            where: { examId: eid, subjectId: s.id, isActive: true },
          })
        )
      )
      subjects.forEach((s, i) => {
        bySubject[s.id] = counts[i]
      })
    }

    const response = NextResponse.json({ count: totalCount, bySubject })
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
