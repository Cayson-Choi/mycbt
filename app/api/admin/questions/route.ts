import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 문제 목록 조회
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

    // 쿼리 파라미터
    const { searchParams } = new URL(request.url)
    const examId = searchParams.get("exam_id")
    const examIds = searchParams.get("exam_ids")
    const subjectId = searchParams.get("subject_id")
    const hasImage = searchParams.get("has_image")

    const where: any = {}
    if (examId) {
      where.examId = parseInt(examId)
    } else if (examIds) {
      where.examId = { in: examIds.split(",").map(Number).filter((n) => !isNaN(n)) }
    }
    if (subjectId) where.subjectId = parseInt(subjectId)
    if (hasImage === 'with') {
      where.OR = [
        { imageUrl: { not: null } },
        { choice1Image: { not: null } },
        { choice2Image: { not: null } },
        { choice3Image: { not: null } },
        { choice4Image: { not: null } },
      ]
    } else if (hasImage === 'without') {
      where.imageUrl = null
      where.choice1Image = null
      where.choice2Image = null
      where.choice3Image = null
      where.choice4Image = null
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        exam: { select: { name: true, category: { select: { name: true } } } },
        subject: { select: { name: true } },
      },
      orderBy: [{ examId: "asc" }, { id: "asc" }],
    })

    // 문항번호(questionCode 끝 숫자) 기준으로 추가 정렬
    const extractNum = (code: string) => {
      const m = code.match(/-(\d+)$/)
      return m ? parseInt(m[1]) : Number.MAX_SAFE_INTEGER
    }
    questions.sort((a, b) => {
      if (a.examId !== b.examId) return a.examId - b.examId
      return extractNum(a.questionCode) - extractNum(b.questionCode)
    })

    // snake_case 형태로 변환 (프론트 호환)
    const mapped = questions.map((q) => ({
      id: q.id,
      question_code: q.questionCode,
      exam_id: q.examId,
      subject_id: q.subjectId,
      question_text: q.questionText,
      question_type: q.questionType === "MULTIPLE_CHOICE" ? "CHOICE" : q.questionType,
      choice_1: q.choice1,
      choice_2: q.choice2,
      choice_3: q.choice3,
      choice_4: q.choice4,
      choice_1_image: q.choice1Image,
      choice_2_image: q.choice2Image,
      choice_3_image: q.choice3Image,
      choice_4_image: q.choice4Image,
      answer: q.answer,
      answer_text: q.answerText,
      answer_text_image: q.answerTextImage,
      explanation: q.explanation,
      explanation_image: q.explanationImage,
      image_url: q.imageUrl,
      points: q.points,
      exams: q.exam ? { name: q.exam.category?.name || q.exam.name } : null,
      subjects: q.subject ? { name: q.subject.name } : null,
    }))

    return NextResponse.json({ questions: mapped })
  } catch (error) {
    console.error("Admin questions GET error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}

// 문제 추가
export async function POST(request: Request) {
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
      answer_text_image,
      explanation,
      explanation_image,
      image_url,
      points,
    } = body

    const qType = question_type || "CHOICE"

    // 유효성 검사
    if (!question_code || !exam_id || !subject_id || !question_text) {
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

    // 문제 코드 중복 확인
    const existing = await prisma.question.findUnique({
      where: { questionCode: question_code },
    })
    if (existing) {
      return NextResponse.json({ error: "이미 존재하는 문제 코드입니다" }, { status: 400 })
    }

    // Prisma QuestionType 매핑
    const prismaType =
      qType === "CHOICE"
        ? "MULTIPLE_CHOICE"
        : qType === "SHORT_ANSWER"
        ? "SHORT_ANSWER"
        : "ESSAY"

    // 공식시험이면 기본 배점 10점, 그 외 1점
    const exam = await prisma.exam.findUnique({
      where: { id: exam_id },
      select: { examMode: true },
    })
    const defaultPoints = exam?.examMode === "OFFICIAL" ? 10 : 1

    const newQuestion = await prisma.question.create({
      data: {
        questionCode: question_code,
        examId: exam_id,
        subjectId: subject_id,
        questionText: question_text,
        questionType: prismaType,
        choice1: qType === "CHOICE" ? choice_1 : choice_1 || "",
        choice2: qType === "CHOICE" ? choice_2 : choice_2 || "",
        choice3: qType === "CHOICE" ? choice_3 : choice_3 || "",
        choice4: qType === "CHOICE" ? choice_4 : choice_4 || "",
        choice1Image: choice_1_image || null,
        choice2Image: choice_2_image || null,
        choice3Image: choice_3_image || null,
        choice4Image: choice_4_image || null,
        answer: qType === "CHOICE" ? answer : answer || null,
        answerText: answer_text || null,
        answerTextImage: answer_text_image || null,
        explanation: explanation || "",
        explanationImage: explanation_image || null,
        imageUrl: image_url || null,
        points: points || defaultPoints,
      },
    })

    // 프론트 호환 응답
    return NextResponse.json({
      question: {
        id: newQuestion.id,
        question_code: newQuestion.questionCode,
        exam_id: newQuestion.examId,
        subject_id: newQuestion.subjectId,
        question_text: newQuestion.questionText,
        question_type: qType,
      },
    })
  } catch (error) {
    console.error("Admin questions POST error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
