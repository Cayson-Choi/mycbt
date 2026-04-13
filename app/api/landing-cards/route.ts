import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "landing_hidden_cards" },
    })
    const hiddenCards: string[] = setting ? JSON.parse(setting.value) : []
    const res = NextResponse.json({ hiddenCards })
    res.headers.set("Cache-Control", "no-store")
    return res
  } catch {
    return NextResponse.json({ hiddenCards: [] })
  }
}
