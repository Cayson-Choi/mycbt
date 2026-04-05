import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    // 이미 가입된 이메일 확인
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    if (existing) {
      if (existing.password) {
        return NextResponse.json(
          { error: "이미 가입된 이메일입니다. 로그인해주세요." },
          { status: 409 }
        )
      }
      // 소셜 로그인으로 가입된 계정에 비밀번호 추가
      const hashed = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashed },
      })
      return NextResponse.json({ message: "비밀번호가 설정되었습니다.", sendVerification: false })
    }

    // 신규 가입: 비밀번호 저장, 이메일 인증은 아직 안 함
    const hashed = await bcrypt.hash(password, 10)
    await prisma.user.create({
      data: {
        email,
        password: hashed,
        // emailVerified는 null → 인증 메일 클릭 후 설정됨
      },
    })

    return NextResponse.json({ message: "인증 메일을 발송합니다.", sendVerification: true })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
