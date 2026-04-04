import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import {
  generateQuestionCode,
  getNextQuestionCode,
} from "@/lib/question-code-mapping"

// 시험명 → exam_id 매핑
const EXAM_NAME_TO_ID: Record<string, number> = {
  전기기초: 17,
  전기기능사: 1,
  전기산업기사: 2,
  전기기사: 3,
}

// 일괄 문제 추가
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

    const { questions } = await request.json()

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "문제 배열이 필요합니다" }, { status: 400 })
    }

    // 과목 목록 조회
    const allSubjects = await prisma.subject.findMany({
      select: { id: true, name: true, examId: true },
    })

    const results: any[] = []
    const errors: any[] = []

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]

      try {
        // 1. 시험명 → exam_id 변환
        const examId = EXAM_NAME_TO_ID[q.exam]
        if (!examId) {
          errors.push({
            index: i + 1,
            error: `잘못된 시험명: "${q.exam}" ("전기기초", "전기기능사", "전기산업기사", "전기기사" 중 하나여야 함)`,
          })
          continue
        }

        // 2. 과목명 → subject_id 변환
        const subject = allSubjects.find(
          (s) => s.name === q.subject && s.examId === examId
        )
        if (!subject) {
          errors.push({
            index: i + 1,
            error: `잘못된 과목명: "${q.subject}" (해당 시험에 존재하지 않는 과목)`,
          })
          continue
        }
        const subjectId = subject.id

        // 3. question_code 자동 생성
        let questionCode = q.question_code || ""

        if (!questionCode) {
          const lastQuestion = await prisma.question.findFirst({
            where: { examId, subjectId },
            orderBy: { questionCode: "desc" },
            select: { questionCode: true },
          })

          if (lastQuestion?.questionCode) {
            const nextCode = getNextQuestionCode(lastQuestion.questionCode)
            questionCode = nextCode || generateQuestionCode(q.exam, q.subject, 1)
          } else {
            questionCode = generateQuestionCode(q.exam, q.subject, 1)
          }
        }

        // 4. 중복 확인 (문제 코드)
        const existingCode = await prisma.question.findUnique({
          where: { questionCode: questionCode },
        })
        if (existingCode) {
          errors.push({ index: i + 1, error: `중복된 문제 코드: "${questionCode}"` })
          continue
        }

        // 4-1. 내용 중복 확인
        const existingContent = await prisma.question.findFirst({
          where: {
            examId,
            subjectId,
            questionText: q.question_text,
            choice1: q.choice_1,
            choice2: q.choice_2,
            choice3: q.choice_3,
            choice4: q.choice_4,
            answer: q.answer,
          },
          select: { id: true, questionCode: true },
        })
        if (existingContent) {
          errors.push({
            index: i + 1,
            error: `동일한 문제가 이미 존재합니다 (코드: ${existingContent.questionCode})`,
          })
          continue
        }

        // 5. 유효성 검사
        if (!q.question_text || !q.choice_1 || !q.choice_2 || !q.choice_3 || !q.choice_4) {
          errors.push({ index: i + 1, error: "문제 내용과 모든 선택지가 필요합니다" })
          continue
        }
        if (!q.answer || q.answer < 1 || q.answer > 4) {
          errors.push({ index: i + 1, error: "정답은 1~4 중 하나여야 합니다" })
          continue
        }

        // 6. 문제 추가
        await prisma.question.create({
          data: {
            questionCode: questionCode,
            examId,
            subjectId,
            questionText: q.question_text,
            questionType: "MULTIPLE_CHOICE",
            choice1: q.choice_1,
            choice2: q.choice_2,
            choice3: q.choice_3,
            choice4: q.choice_4,
            answer: q.answer,
            explanation: q.explanation || "",
            imageUrl: q.image_url || null,
          },
        })

        results.push({ index: i + 1, question_code: questionCode, success: true })
      } catch (err: any) {
        errors.push({ index: i + 1, error: err.message || "알 수 없는 오류" })
      }
    }

    return NextResponse.json({
      success: results.length,
      failed: errors.length,
      results,
      errors,
    })
  } catch (error) {
    console.error("Bulk questions POST error:", error)
    return NextResponse.json({ error: "서버 오류" }, { status: 500 })
  }
}
