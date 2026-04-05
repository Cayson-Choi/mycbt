import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "새 비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
    }

    // 기존 비밀번호가 있는 경우 현재 비밀번호 확인
    if (user.password) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "현재 비밀번호를 입력해주세요" },
          { status: 400 }
        )
      }
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json(
          { error: "현재 비밀번호가 올바르지 않습니다" },
          { status: 400 }
        )
      }
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "비밀번호가 변경되었습니다" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
