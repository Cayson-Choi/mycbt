import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 회원 관리자 권한 토글
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!adminUser?.isAdmin)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const { id } = await params

    // 자기 자신의 권한은 변경 불가
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "자신의 권한은 변경할 수 없습니다" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { is_admin, tier } = body

    const updateData: Record<string, unknown> = {}
    if (is_admin !== undefined) updateData.isAdmin = is_admin
    if (tier !== undefined) updateData.tier = tier

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        is_admin: updated.isAdmin,
        tier: updated.tier,
      },
    })
  } catch (error) {
    console.error("Admin user PATCH error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 회원 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!adminUser?.isAdmin)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const { id } = await params

    // 자기 자신은 삭제 불가
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "자신의 계정은 삭제할 수 없습니다" },
        { status: 400 }
      )
    }

    // Prisma cascade로 관련 데이터도 삭제됨
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin user DELETE error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
