import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { uploadImage } from "@/lib/cloudinary"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    // 관리자 확인
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 })
    }

    // 이미지 타입 확인
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "PNG, JPG, WEBP 이미지만 업로드 가능합니다" },
        { status: 400 }
      )
    }

    // 5MB 제한
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다" },
        { status: 400 }
      )
    }

    // Buffer로 변환 후 Cloudinary 업로드
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const url = await uploadImage(buffer, file.name)

    return NextResponse.json({ url })
  } catch (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: "이미지 업로드에 실패했습니다" }, { status: 500 })
  }
}
