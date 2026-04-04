import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 회원 목록 조회
export async function GET() {
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

    // 모든 회원 + 응시 횟수 조회
    const profiles = await prisma.user.findMany({
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        tier: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const usersWithStats = profiles.map((p) => ({
      id: p.id,
      nickname: p.nickname || "",
      name: p.name || "",
      email: p.email || "",
      phone: p.phone,
      is_admin: p.isAdmin,
      tier: p.tier,
      created_at: p.createdAt.toISOString(),
    }))

    return NextResponse.json({ users: usersWithStats })
  } catch (error) {
    console.error("Admin users GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
