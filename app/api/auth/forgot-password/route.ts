import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createTransport } from "nodemailer"
import crypto from "crypto"

function createResetToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET!
  const expiry = Date.now() + 3600000 // 1 hour
  const data = `${email}:${expiry}`
  const signature = crypto.createHmac("sha256", secret).update(data).digest("hex")
  return Buffer.from(`${data}:${signature}`).toString("base64url")
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해주세요" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    // 사용자가 없거나 비밀번호가 없으면 동일한 성공 응답 (보안상 이유로)
    if (!user || !user.password) {
      return NextResponse.json({ message: "메일을 발송했습니다" })
    }

    const token = createResetToken(email)
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    const transport = createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER!,
        pass: process.env.EMAIL_SERVER_PASSWORD!,
      },
    })

    await transport.sendMail({
      to: email,
      from: process.env.EMAIL_FROM!,
      subject: "[CAYSON] 비밀번호 재설정",
      text: `CAYSON 비밀번호 재설정\n\n아래 링크를 클릭하면 비밀번호를 재설정할 수 있습니다.\n${resetUrl}\n\n링크는 1시간 후 만료됩니다.\n본인이 요청하지 않았다면 이 메일을 무시하세요.`,
      html: `
        <div style="max-width:480px;margin:0 auto;padding:32px 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
          <div style="text-align:center;margin-bottom:32px">
            <h1 style="font-size:28px;font-weight:bold;color:#1a1a1a;margin:0">CAYSON</h1>
            <p style="font-size:14px;color:#666;margin:8px 0 0">전기 자격시험 CBT</p>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px 24px;text-align:center">
            <p style="font-size:16px;color:#334155;margin:0 0 8px;font-weight:600">비밀번호 재설정</p>
            <p style="font-size:14px;color:#64748b;margin:0 0 24px">아래 버튼을 클릭하면 비밀번호를 재설정할 수 있습니다.<br>링크는 1시간 후 만료됩니다.</p>
            <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 48px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-size:16px;font-weight:600">비밀번호 재설정하기</a>
          </div>
          <div style="margin-top:24px;text-align:center">
            <p style="font-size:12px;color:#94a3b8;margin:0">본인이 요청하지 않았다면 이 메일을 무시하세요.</p>
            <p style="font-size:12px;color:#94a3b8;margin:4px 0 0">버튼이 작동하지 않으면 아래 링크를 복사해 브라우저에 붙여넣으세요.</p>
            <p style="font-size:11px;color:#cbd5e1;margin:8px 0 0;word-break:break-all">${resetUrl}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ message: "메일을 발송했습니다" })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
