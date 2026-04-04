import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 프로필 조회
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "프로필 조회 실패" }, { status: 500 })
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        phone: user.phone,
        created_at: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 프로필 수정 (전화번호만)
export async function PUT(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { phone } = await request.json()

    // 유효성 검사
    if (!phone) {
      return NextResponse.json(
        { error: "전화번호를 입력해주세요" },
        { status: 400 }
      )
    }

    // 프로필 업데이트 (이름과 이메일은 수정 불가)
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      profile: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        created_at: updatedUser.createdAt,
      },
    })
  } catch (error) {
    console.error("Profile PUT error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
