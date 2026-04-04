import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import {
  generateQuestionCode,
  getNextQuestionCode,
} from "@/lib/question-code-mapping"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("exam_id")
    const subjectId = searchParams.get("subject_id")

    if (!examId || !subjectId) {
      return NextResponse.json({ error: "시험과 과목을 선택해주세요" }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(examId) },
      select: { name: true },
    })
    if (!exam) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      select: { name: true },
    })
    if (!subject) {
      return NextResponse.json({ error: "과목을 찾을 수 없습니다" }, { status: 404 })
    }

    const lastQuestion = await prisma.question.findFirst({
      where: { examId: parseInt(examId), subjectId: parseInt(subjectId) },
      orderBy: { questionCode: "desc" },
      select: { questionCode: true },
    })

    let nextCode: string

    if (lastQuestion?.questionCode) {
      const generated = getNextQuestionCode(lastQuestion.questionCode)
      nextCode = generated || generateQuestionCode(exam.name, subject.name, 1)
    } else {
      nextCode = generateQuestionCode(exam.name, subject.name, 1)
    }

    return NextResponse.json({
      code: nextCode,
      lastCode: lastQuestion?.questionCode || null,
    })
  } catch (error) {
    console.error("Next code generation error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
