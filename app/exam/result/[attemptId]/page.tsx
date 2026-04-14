import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import ExamResultContent from "./ExamResultContent"

// 결과는 제출 후 변경되지 않으므로 ISR 사용 (제출 API에서 revalidate 호출)
export const revalidate = 0

export default async function ExamResultPage({
  params,
}: {
  params: Promise<{ attemptId: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { attemptId } = await params
  const aid = Number(attemptId)

  if (isNaN(aid)) {
    notFound()
  }

  const attempt = await prisma.attempt.findUnique({
    where: { id: aid },
    include: { exam: { select: { name: true, examMode: true, examType: true } } },
  })

  if (!attempt) {
    notFound()
  }

  if (attempt.userId !== session.user.id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 mb-4">권한이 없습니다</div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (attempt.status !== "SUBMITTED") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 mb-4">제출된 시험이 아닙니다</div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 과목별 점수, 문제별 정답/오답, 학생 답안을 병렬 조회
  const [subjectScores, attemptQuestions, studentAnswers] = await Promise.all([
    prisma.subjectScore.findMany({
      where: { attemptId: aid },
      include: { subject: { select: { name: true, orderNo: true } } },
      orderBy: { subject: { orderNo: "asc" } },
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
            answer: true,
            explanation: true,
            explanationImage: true,
            imageUrl: true,
            subjectId: true,
            points: true,
            subject: { select: { name: true } },
          },
        },
      },
    }),
    prisma.attemptItem.findMany({
      where: { attemptId: aid },
    }),
  ])
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
      choice_1_image: aq.question.choice1Image,
      choice_2_image: aq.question.choice2Image,
      choice_3_image: aq.question.choice3Image,
      choice_4_image: aq.question.choice4Image,
      correct_answer: aq.question.answer,
      explanation: aq.question.explanation,
      explanation_image: aq.question.explanationImage,
      image_url: aq.question.imageUrl,
      subject_name: aq.question.subject.name,
      points: aq.question.points,
      student_answer: sa?.selected ?? null,
      student_answer_text: sa?.answerText ?? null,
      student_answer_image: sa?.answerImage ?? null,
      is_correct: sa?.isCorrect ?? null,
      awarded_points: sa?.awardedPoints ?? null,
      grading_status: sa?.gradingStatus ?? "AI_GRADED",
      ai_feedback: sa?.aiFeedback ?? null,
    }
  })

  const result = {
    attempt_id: attempt.id,
    exam_id: attempt.examId,
    exam_name: attempt.exam.name,
    exam_mode: attempt.exam.examMode,
    exam_type: attempt.exam.examType,
    grading_status: attempt.gradingStatus,
    status: attempt.status,
    started_at: attempt.startedAt.toISOString(),
    submitted_at: attempt.submittedAt?.toISOString() ?? null,
    total_questions: attempt.totalQuestions,
    total_correct: attempt.totalCorrect,
    total_score: attempt.totalScore,
    subject_scores: subjectScores.map((ss) => ({
      subject_id: ss.subjectId,
      subject_name: ss.subject.name,
      subject_questions: ss.subjectQuestions,
      subject_correct: ss.subjectCorrect,
      subject_score: ss.subjectScore,
    })),
    questions: questionsWithAnswers,
  }

  return <ExamResultContent result={result} />
}
