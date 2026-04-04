import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  return user?.isAdmin ? session.user.id : null
}

// 시험 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const { examId } = await params
    const id = parseInt(examId)
    if (isNaN(id))
      return NextResponse.json({ error: "잘못된 시험 ID" }, { status: 400 })

    const body = await request.json()
    const { is_published, duration_minutes } = body

    const data: any = {}
    if (typeof is_published === "boolean") data.isPublished = is_published
    if (typeof duration_minutes === "number") {
      if (duration_minutes < 1 || duration_minutes > 300) {
        return NextResponse.json(
          { error: "시험 시간은 1~300분이어야 합니다" },
          { status: 400 }
        )
      }
      data.durationMinutes = duration_minutes
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "수정할 항목이 없습니다" },
        { status: 400 }
      )
    }

    const exam = await prisma.exam.update({
      where: { id },
      data,
    })

    await prisma.auditLog.create({
      data: {
        adminUserId: adminId,
        actionType: "UPDATE",
        targetTable: "exams",
        targetId: String(id),
        changedFields: data,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin exam PUT error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 시험 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const adminId = await checkAdmin()
    if (!adminId)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

    const { examId } = await params
    const id = parseInt(examId)
    if (isNaN(id))
      return NextResponse.json({ error: "잘못된 시험 ID" }, { status: 400 })

    // 응시 기록 확인
    const attemptCount = await prisma.attempt.count({
      where: { examId: id },
    })

    if (attemptCount > 0) {
      return NextResponse.json(
        {
          error: `이 시험에 ${attemptCount}건의 응시 기록이 있습니다. 먼저 응시 기록을 초기화해주세요.`,
        },
        { status: 400 }
      )
    }

    // 시험 정보 저장 (감사 로그용)
    const exam = await prisma.exam.findUnique({
      where: { id },
      select: { name: true, year: true, round: true, categoryId: true },
    })

    if (!exam) {
      return NextResponse.json(
        { error: "시험을 찾을 수 없습니다" },
        { status: 404 }
      )
    }

    // 삭제 (cascade로 subjects, questions도 삭제)
    await prisma.exam.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        adminUserId: adminId,
        actionType: "DELETE",
        targetTable: "exams",
        targetId: String(id),
        oldData: exam,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin exam DELETE error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
