import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
      return NextResponse.json({ error: "문제 코드를 입력해주세요" }, { status: 400 })
    }

    const existing = await prisma.question.findUnique({
      where: { questionCode: code },
      select: { id: true },
    })

    return NextResponse.json({
      exists: !!existing,
      available: !existing,
    })
  } catch (error) {
    console.error("Code check error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
