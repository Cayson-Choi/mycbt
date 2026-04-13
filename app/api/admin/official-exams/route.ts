import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// 관리자 권한 확인 헬퍼
async function checkAdmin() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) return null

  return session.user
}

// GET: 공식 시험 목록 조회
export async function GET() {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })
    }

    const exams = await prisma.exam.findMany({
      where: { examMode: "OFFICIAL" },
      include: {
        subjects: {
          select: { id: true, name: true, orderNo: true },
          orderBy: { orderNo: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // 각 시험의 문제 수와 응시자 수 추가
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const [questionCount, attemptCount] = await Promise.all([
          prisma.question.count({
            where: { examId: exam.id, isActive: true },
          }),
          prisma.attempt.count({
            where: { examId: exam.id, status: "SUBMITTED" },
          }),
        ])

        return {
          id: exam.id,
          name: exam.name,
          exam_mode: exam.examMode,
          password: exam.password,
          duration_minutes: exam.durationMinutes,
          created_at: exam.createdAt.toISOString(),
          is_published: exam.isPublished,
          subjects: exam.subjects.map((s) => ({
            id: s.id,
            name: s.name,
            order_no: s.orderNo,
          })),
          question_count: questionCount,
          attempt_count: attemptCount,
        }
      })
    )

    return NextResponse.json(examsWithStats)
  } catch (error) {
    console.error("Official exams error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// POST: 새 공식 시험 생성
export async function POST(request: Request) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })
    }

    const { name, password, duration_minutes } = await request.json()

    if (!name || !password) {
      return NextResponse.json(
        { error: "시험 이름과 비밀번호가 필요합니다" },
        { status: 400 }
      )
    }

    // categoryId가 필요함 - 기본 카테고리 찾거나 생성 (비활성 상태면 재활성화)
    let category = await prisma.examCategory.findFirst({
      where: { name: "공식시험" },
    })
    if (!category) {
      category = await prisma.examCategory.create({
        data: { name: "공식시험", description: "공식 시험 카테고리", grade: "기타" },
      })
    } else if (!category.isActive) {
      category = await prisma.examCategory.update({
        where: { id: category.id },
        data: { isActive: true },
      })
    }

    // 1. exams 테이블에 삽입
    const newExam = await prisma.exam.create({
      data: {
        categoryId: category.id,
        name,
        examMode: "OFFICIAL",
        password,
        durationMinutes: duration_minutes || 60,
      },
      select: { id: true },
    })

    // 2. 과목 1개 자동 생성
    await prisma.subject.create({
      data: {
        examId: newExam.id,
        name,
        questionsPerAttempt: 1,
        orderNo: 1,
      },
    })

    // 모든 페이지 캐시 즉시 무효화 (홈, 카테고리, 시험 시작 페이지 등)
    revalidatePath("/", "layout")

    return NextResponse.json({
      success: true,
      exam_id: newExam.id,
      message: "공식 시험이 생성되었습니다",
    })
  } catch (error) {
    console.error("Create official exam error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// PUT: 공식 시험 수정
export async function PUT(request: Request) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })
    }

    const { exam_id, name, password, duration_minutes, is_published } =
      await request.json()

    if (!exam_id) {
      return NextResponse.json({ error: "exam_id가 필요합니다" }, { status: 400 })
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (password !== undefined) updateData.password = password
    if (duration_minutes !== undefined) updateData.durationMinutes = duration_minutes
    if (is_published !== undefined) updateData.isPublished = is_published

    await prisma.exam.update({
      where: { id: exam_id },
      data: updateData,
    })

    if (is_published !== undefined) {
      revalidatePath("/", "layout")
    }

    return NextResponse.json({ success: true, message: "수정되었습니다" })
  } catch (error) {
    console.error("Update official exam error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

// DELETE: 공식 시험 삭제
export async function DELETE(request: Request) {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 })
    }

    const { exam_id } = await request.json()

    if (!exam_id) {
      return NextResponse.json({ error: "exam_id가 필요합니다" }, { status: 400 })
    }

    // 응시 기록이 있는지 확인
    const attemptCount = await prisma.attempt.count({
      where: { examId: exam_id },
    })

    if (attemptCount > 0) {
      return NextResponse.json(
        { error: `이미 ${attemptCount}명이 응시한 시험은 삭제할 수 없습니다` },
        { status: 400 }
      )
    }

    // 삭제 전에 카테고리 ID 저장 — 이미 삭제된 시험이면 404 반환
    const examToDelete = await prisma.exam.findUnique({
      where: { id: exam_id },
      select: { categoryId: true },
    })

    if (!examToDelete) {
      return NextResponse.json(
        { error: "시험을 찾을 수 없습니다 (이미 삭제되었을 수 있습니다)" },
        { status: 404 }
      )
    }

    // FK 참조 순서에 따라 안전하게 삭제
    const questionIds = (await prisma.question.findMany({
      where: { examId: exam_id }, select: { id: true }
    })).map(q => q.id)

    if (questionIds.length > 0) {
      // 문제를 참조하는 모든 테이블 먼저 삭제
      await prisma.wrongNoteItem.deleteMany({ where: { questionId: { in: questionIds } } })
      await prisma.attemptItem.deleteMany({ where: { questionId: { in: questionIds } } })
      await prisma.attemptQuestion.deleteMany({ where: { questionId: { in: questionIds } } })
    }

    await prisma.question.deleteMany({ where: { examId: exam_id } })
    await prisma.subject.deleteMany({ where: { examId: exam_id } })
    await prisma.exam.delete({ where: { id: exam_id } })

    // 빈 카테고리 정리: 해당 카테고리에 시험이 0개면 비활성화
    if (examToDelete.categoryId) {
      const remainingExams = await prisma.exam.count({
        where: { categoryId: examToDelete.categoryId },
      })
      if (remainingExams === 0) {
        await prisma.examCategory.update({
          where: { id: examToDelete.categoryId },
          data: { isActive: false },
        })
      }
    }

    // 모든 페이지 캐시 즉시 무효화 (홈, 카테고리, 시험 시작 페이지 등)
    revalidatePath("/", "layout")

    return NextResponse.json({ success: true, message: "삭제되었습니다" })
  } catch (error) {
    console.error("Delete official exam error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
