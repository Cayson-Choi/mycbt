import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

const SETTING_KEY = "landing_hidden_cards"

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

    const setting = await prisma.siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })

    const hiddenCards: string[] = setting ? JSON.parse(setting.value) : []

    const cards: Record<string, boolean> = {
      basic: !hiddenCards.includes("basic"),
      technician: !hiddenCards.includes("technician"),
      industrial: !hiddenCards.includes("industrial"),
      engineer: !hiddenCards.includes("engineer"),
      master: !hiddenCards.includes("master"),
      ncs: !hiddenCards.includes("ncs"),
      etc: !hiddenCards.includes("etc"),
    }

    return NextResponse.json({ cards })
  } catch (error) {
    console.error("Landing config GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { cardId, visible } = body as { cardId: string; visible: boolean }

    const validIds = ["basic", "technician", "industrial", "engineer", "master", "ncs", "etc"]
    if (!validIds.includes(cardId) || typeof visible !== "boolean") {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 })
    }

    // 현재 숨김 목록 조회
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SETTING_KEY },
    })
    const hiddenCards: string[] = setting ? JSON.parse(setting.value) : []

    // 토글 반영
    let updated: string[]
    if (visible) {
      updated = hiddenCards.filter((id) => id !== cardId)
    } else {
      updated = hiddenCards.includes(cardId) ? hiddenCards : [...hiddenCards, cardId]
    }

    // DB 저장 (upsert)
    await prisma.siteSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value: JSON.stringify(updated) },
      create: { key: SETTING_KEY, value: JSON.stringify(updated) },
    })

    // 모든 페이지 캐시 즉시 무효화
    revalidatePath('/', 'layout')

    return NextResponse.json({ message: "저장 완료", hiddenCards: updated })
  } catch (error) {
    console.error("Landing config POST error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
