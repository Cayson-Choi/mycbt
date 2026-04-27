import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 회원 탈퇴
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const userId = session.user.id

    // 관리자는 탈퇴 불가
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    })

    if (user?.isAdmin) {
      return NextResponse.json(
        {
          error:
            "관리자는 회원탈퇴가 불가능합니다. 먼저 관리자 권한을 해제해주세요.",
        },
        { status: 403 }
      )
    }

    // 사용자 삭제 (Prisma onDelete: Cascade로 관련 데이터 자동 삭제)
    //    - accounts, sessions, attempts (-> attemptQuestions, attemptItems, subjectScores), payments, purchasedContents
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({
      success: true,
      message: "회원 탈퇴가 완료되었습니다",
    })
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
