import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const [setting, gradeCountsRaw] = await Promise.all([
      prisma.siteSetting.findUnique({
        where: { key: "landing_hidden_cards" },
      }),
      prisma.examCategory.findMany({
        where: { isActive: true },
        select: {
          grade: true,
          _count: { select: { exams: { where: { isPublished: true } } } },
        },
      }),
    ])

    const hiddenCards: string[] = setting ? JSON.parse(setting.value) : []

    const gradeCounts: Record<string, number> = {}
    for (const gc of gradeCountsRaw) {
      const g = gc.grade || '기타'
      gradeCounts[g] = (gradeCounts[g] || 0) + gc._count.exams
    }

    const res = NextResponse.json({ hiddenCards, gradeCounts })
    res.headers.set("Cache-Control", "no-store")
    return res
  } catch {
    return NextResponse.json({ hiddenCards: [], gradeCounts: {} })
  }
}
