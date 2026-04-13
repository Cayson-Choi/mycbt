import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 문제 수정
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const questionId = parseInt(id)

    const body = await request.json()
    const {
      question_code,
      exam_id,
      subject_id,
      question_text,
      question_type,
      choice_1,
      choice_2,
      choice_3,
      choice_4,
      choice_1_image,
      choice_2_image,
      choice_3_image,
      choice_4_image,
      answer,
      answer_text,
      explanation,
      image_url,
      points,
    } = body

    const qType = question_type || "CHOICE"

    // 유효성 검사
    if (!question_text) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 })
    }

    if (qType === "CHOICE") {
      if (!choice_1 || !choice_2 || !choice_3 || !choice_4) {
        return NextResponse.json({ error: "모든 선택지를 입력해주세요" }, { status: 400 })
      }
      if (!answer || answer < 1 || answer > 4) {
        return NextResponse.json({ error: "정답은 1~4 중 하나여야 합니다" }, { status: 400 })
      }
    }

    // 문제 코드 중복 체크 (변경된 경우)
    if (question_code) {
      const existing = await prisma.question.findFirst({
        where: {
          questionCode: question_code,
          NOT: { id: questionId },
        },
      })
      if (existing) {
        return NextResponse.json({ error: "이미 존재하는 문제 코드입니다" }, { status: 400 })
      }
    }

    const prismaType =
      qType === "CHOICE"
        ? "MULTIPLE_CHOICE"
        : qType === "SHORT_ANSWER"
        ? "SHORT_ANSWER"
        : "ESSAY"

    const updateData: any = {
      questionText: question_text,
      questionType: prismaType,
      choice1: qType === "CHOICE" ? choice_1 : choice_1 || "",
      choice2: qType === "CHOICE" ? choice_2 : choice_2 || "",
      choice3: qType === "CHOICE" ? choice_3 : choice_3 || "",
      choice4: qType === "CHOICE" ? choice_4 : choice_4 || "",
      choice1Image: choice_1_image ?? undefined,
      choice2Image: choice_2_image ?? undefined,
      choice3Image: choice_3_image ?? undefined,
      choice4Image: choice_4_image ?? undefined,
      answer: qType === "CHOICE" ? answer : answer || null,
      answerText: answer_text || null,
      explanation: explanation || "",
      imageUrl: image_url || null,
      points: points || 1,
    }

    if (question_code) updateData.questionCode = question_code
    if (exam_id) updateData.examId = exam_id
    if (subject_id) updateData.subjectId = subject_id

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updateData,
    })

    return NextResponse.json({
      question: {
        id: updatedQuestion.id,
        question_code: updatedQuestion.questionCode,
        question_type: qType,
      },
    })
  } catch (error) {
    console.error("Admin question PUT error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 문제 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const questionId = parseInt(id)

    // 문제가 시험에 사용 중인지 확인
    const usageCount = await prisma.attemptQuestion.count({
      where: { questionId },
    })

    if (usageCount > 0) {
      return NextResponse.json(
        { error: "이미 시험에 사용된 문제는 삭제할 수 없습니다" },
        { status: 400 }
      )
    }

    await prisma.question.delete({
      where: { id: questionId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin question DELETE error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
