import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

function maskEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return email
  const visible = local.slice(0, 2)
  const masked = visible + "****"
  return `${masked}@${domain}`
}

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "전화번호를 입력해주세요" }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: { phone },
      select: { email: true },
    })

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "해당 전화번호로 가입된 계정을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    return NextResponse.json({ maskedEmail: maskEmail(user.email) })
  } catch (error) {
    console.error("Find email error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
