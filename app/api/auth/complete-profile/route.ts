import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { nickname, phone } = await request.json()

    if (!nickname?.trim() || nickname.trim().length < 2) {
      return NextResponse.json({ error: "ID는 2자 이상이어야 합니다" }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9가-힣_]+$/.test(nickname.trim())) {
      return NextResponse.json({ error: "ID는 영문, 한글, 숫자, _만 사용 가능합니다" }, { status: 400 })
    }

    if (!phone?.trim() || !/^010-\d{4}-\d{4}$/.test(phone.trim())) {
      return NextResponse.json({ error: "전화번호 형식이 올바르지 않습니다" }, { status: 400 })
    }

    // 이미 nickname이 설정된 사용자는 변경 불가
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { nickname: true },
    })
    if (currentUser?.nickname) {
      return NextResponse.json({ error: "ID는 한 번만 설정할 수 있습니다" }, { status: 400 })
    }

    // 중복 확인
    const existing = await prisma.user.findUnique({
      where: { nickname: nickname.trim() },
    })
    if (existing) {
      return NextResponse.json({ error: "이미 사용 중인 ID입니다" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nickname: nickname.trim(),
        phone: phone.trim(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Complete profile error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
