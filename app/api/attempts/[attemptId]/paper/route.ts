import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { attemptId } = await params
    const aid = Number(attemptId)

    // 시험 정보, 시험지 문제(정답 제외), 기존 답안을 병렬 조회
    const [attempt, attemptQuestions, savedAnswers] = await Promise.all([
      prisma.attempt.findUnique({
        where: { id: aid },
        include: { exam: { select: { name: true, examMode: true, durationMinutes: true } } },
      }),
      prisma.attemptQuestion.findMany({
        where: { attemptId: aid },
        orderBy: { seq: "asc" },
        include: {
          question: {
            select: {
              id: true,
              questionCode: true,
              questionText: true,
              questionType: true,
              choice1: true,
              choice2: true,
              choice3: true,
              choice4: true,
              choice1Image: true,
              choice2Image: true,
              choice3Image: true,
              choice4Image: true,
              imageUrl: true,
              subjectId: true,
              subject: { select: { name: true } },
            },
          },
        },
      }),
      prisma.attemptItem.findMany({
        where: { attemptId: aid },
        select: { questionId: true, selected: true, answerText: true },
      }),
    ])

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }
    const answersMap = new Map(savedAnswers.map((a) => [a.questionId, a]))

    const questions = attemptQuestions.map((aq) => {
      const saved = answersMap.get(aq.question.id)
      return {
        seq: aq.seq,
        question_id: aq.question.id,
        question_code: aq.question.questionCode,
        question_text: aq.question.questionText,
        question_type: aq.question.questionType || "MULTIPLE_CHOICE",
        choice_1: aq.question.choice1,
        choice_2: aq.question.choice2,
        choice_3: aq.question.choice3,
        choice_4: aq.question.choice4,
        image_url: aq.question.imageUrl,
        choice_1_image: aq.question.choice1Image,
        choice_2_image: aq.question.choice2Image,
        choice_3_image: aq.question.choice3Image,
        choice_4_image: aq.question.choice4Image,
        subject_name: aq.question.subject.name,
        selected: saved?.selected ?? null,
        answer_text: saved?.answerText ?? null,
      }
    })

    return NextResponse.json({
      attempt_id: attempt.id,
      exam_id: attempt.examId,
      exam_name: attempt.exam.name,
      exam_mode: attempt.exam.examMode,
      duration_minutes: attempt.exam.durationMinutes,
      status: attempt.status,
      started_at: attempt.startedAt.toISOString(),
      expires_at: attempt.expiresAt.toISOString(),
      total_questions: attempt.totalQuestions,
      questions,
    })
  } catch (error) {
    console.error("Get paper error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
