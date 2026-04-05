import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ exists: false, hasPassword: false })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    })

    return NextResponse.json({
      exists: !!user,
      hasPassword: !!user?.password,
    })
  } catch {
    return NextResponse.json({ exists: false, hasPassword: false })
  }
}
