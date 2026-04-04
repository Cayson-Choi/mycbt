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

    const attempt = await prisma.attempt.findUnique({
      where: { id: aid },
      include: { exam: { select: { name: true, examMode: true } } },
    })

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }
    if (attempt.status !== "SUBMITTED") {
      return NextResponse.json({ error: "제출된 시험이 아닙니다" }, { status: 400 })
    }

    // 과목별 점수
    const subjectScores = await prisma.subjectScore.findMany({
      where: { attemptId: aid },
      include: { subject: { select: { name: true, orderNo: true } } },
      orderBy: { subject: { orderNo: "asc" } },
    })

    // 문제별 정답/오답 (정답 포함 - 제출 후이므로)
    const attemptQuestions = await prisma.attemptQuestion.findMany({
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
            answer: true,
            explanation: true,
            imageUrl: true,
            subjectId: true,
            points: true,
            subject: { select: { name: true } },
          },
        },
      },
    })

    // 학생 답안
    const studentAnswers = await prisma.attemptItem.findMany({
      where: { attemptId: aid },
    })
    const answersMap = new Map(studentAnswers.map((a) => [a.questionId, a]))

    const questionsWithAnswers = attemptQuestions.map((aq) => {
      const sa = answersMap.get(aq.question.id)
      return {
        seq: aq.seq,
        question_id: aq.question.id,
        question_text: aq.question.questionText,
        question_type: aq.question.questionType,
        choice_1: aq.question.choice1,
        choice_2: aq.question.choice2,
        choice_3: aq.question.choice3,
        choice_4: aq.question.choice4,
        correct_answer: aq.question.answer,
        explanation: aq.question.explanation,
        image_url: aq.question.imageUrl,
        subject_name: aq.question.subject.name,
        points: aq.question.points,
        student_answer: sa?.selected ?? null,
        student_answer_text: sa?.answerText ?? null,
        is_correct: sa?.isCorrect ?? null,
        awarded_points: sa?.awardedPoints ?? null,
        grading_status: sa?.gradingStatus ?? "AI_GRADED",
        ai_feedback: sa?.aiFeedback ?? null,
      }
    })

    return NextResponse.json({
      attempt_id: attempt.id,
      exam_id: attempt.examId,
      exam_name: attempt.exam.name,
      exam_mode: attempt.exam.examMode,
      grading_status: attempt.gradingStatus,
      status: attempt.status,
      started_at: attempt.startedAt.toISOString(),
      submitted_at: attempt.submittedAt?.toISOString(),
      total_questions: attempt.totalQuestions,
      total_correct: attempt.totalCorrect,
      total_score: attempt.totalScore,
      subject_scores: subjectScores,
      questions: questionsWithAnswers,
    })
  } catch (error) {
    console.error("Get result error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
