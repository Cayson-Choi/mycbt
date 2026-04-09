import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import ExamAttemptClient from "./ExamAttemptClient"
import type { PaperData } from "./ExamAttemptClient"

export default async function ExamAttemptPage({
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

  // 시험 정보, 시험지 문제(정답 제외), 기존 답안을 병렬 조회
  const [attempt, attemptQuestions, savedAnswers] = await Promise.all([
    prisma.attempt.findUnique({
      where: { id: aid },
      include: {
        exam: {
          select: {
            name: true,
            examMode: true,
            examType: true,
            durationMinutes: true,
            year: true,
            round: true,
            category: { select: { name: true, grade: true } },
          },
        },
      },
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

  // exam 이름: year가 있으면 "카테고리 YYYY년 N회" 형식
  const examName = attempt.exam.year
    ? `${attempt.exam.category.name} ${attempt.exam.year}년 ${attempt.exam.round}회`
    : attempt.exam.name

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
      choice_1_image: aq.question.choice1Image,
      choice_2_image: aq.question.choice2Image,
      choice_3_image: aq.question.choice3Image,
      choice_4_image: aq.question.choice4Image,
      image_url: aq.question.imageUrl,
      subject_name: aq.question.subject.name,
      selected: saved?.selected ?? null,
      answer_text: saved?.answerText ?? null,
    }
  })

  const paper: PaperData = {
    attempt_id: attempt.id,
    exam_name: examName,
    exam_mode: attempt.exam.examMode,
    exam_grade: attempt.exam.category?.grade ?? null,
    exam_type: attempt.exam.examType,
    expires_at: attempt.expiresAt.toISOString(),
    total_questions: attempt.totalQuestions,
    questions,
  }

  return <ExamAttemptClient attemptId={attemptId} paper={paper} />
}
