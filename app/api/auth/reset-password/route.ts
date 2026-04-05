import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import crypto from "crypto"

function verifyResetToken(token: string): string {
  const secret = process.env.NEXTAUTH_SECRET!
  const decoded = Buffer.from(token, "base64url").toString()
  // email may contain colons (unlikely but safe), so split from the right
  const lastColon = decoded.lastIndexOf(":")
  const secondLastColon = decoded.lastIndexOf(":", lastColon - 1)
  if (secondLastColon <= 0 || lastColon <= secondLastColon) {
    throw new Error("유효하지 않은 토큰입니다")
  }
  const tokenEmail = decoded.substring(0, secondLastColon)
  const tokenExpiry = decoded.substring(secondLastColon + 1, lastColon)
  const tokenSig = decoded.substring(lastColon + 1)

  const data = `${tokenEmail}:${tokenExpiry}`
  const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("hex")

  if (
    tokenSig.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(tokenSig), Buffer.from(expectedSig))
  ) {
    throw new Error("유효하지 않은 토큰입니다")
  }
  if (Date.now() > Number(tokenExpiry)) {
    throw new Error("만료된 링크입니다. 비밀번호 재설정을 다시 요청해주세요.")
  }

  return tokenEmail
}

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "토큰과 새 비밀번호를 입력해주세요" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 6자 이상이어야 합니다" },
        { status: 400 }
      )
    }

    let email: string
    try {
      email = verifyResetToken(token)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "유효하지 않은 토큰입니다" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "비밀번호가 변경되었습니다" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
