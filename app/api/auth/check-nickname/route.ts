import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const nickname = searchParams.get("nickname")

    if (!nickname?.trim()) {
      return NextResponse.json({ available: false })
    }

    const existing = await prisma.user.findUnique({
      where: { nickname: nickname.trim() },
    })

    return NextResponse.json({ available: !existing })
  } catch {
    return NextResponse.json({ available: false })
  }
}
