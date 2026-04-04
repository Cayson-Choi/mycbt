import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { name, phone } = await request.json()

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "이름과 전화번호를 입력해주세요" }, { status: 400 })
    }

    if (!/^010-\d{4}-\d{4}$/.test(phone.trim())) {
      return NextResponse.json({ error: "전화번호 형식이 올바르지 않습니다" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
        phone: phone.trim(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete profile error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
