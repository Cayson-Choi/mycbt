import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const categories = await prisma.examCategory.findMany({
      where: { isActive: true },
      include: {
        exams: {
          where: { isPublished: true },
          orderBy: [{ year: "desc" }, { round: "desc" }, { sortOrder: "asc" }],
          select: {
            id: true,
            name: true,
            year: true,
            round: true,
            examMode: true,
            durationMinutes: true,
            minTier: true,
            price: true,
            sortOrder: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    })

    const response = NextResponse.json(categories)
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120")
    return response
  } catch {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
