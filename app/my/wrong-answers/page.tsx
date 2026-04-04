import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import WrongAnswersContent from "./WrongAnswersContent"

export default async function WrongAnswersPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/my/wrong-answers')
  }

  const userId = session.user.id

  // 1. 사용자의 모든 제출된 시도 조회
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      status: "SUBMITTED",
    },
    select: {
      id: true,
      examId: true,
      submittedAt: true,
    },
    orderBy: { submittedAt: "desc" },
  })

  if (attempts.length === 0) {
    return (
      <WrongAnswersContent
        data={{ wrong_answers: [], total_count: 0, subject_stats: [] }}
      />
    )
  }

  const attemptIds = attempts.map((a) => a.id)

  // 2. 모든 attempt_questions 한번에 조회
  const allAttemptQuestions = await prisma.attemptQuestion.findMany({
    where: { attemptId: { in: attemptIds } },
    select: { attemptId: true, questionId: true },
  })

  // 3. 모든 answers 한번에 조회 (attempt_items)
  const allAnswers = await prisma.attemptItem.findMany({
    where: { attemptId: { in: attemptIds } },
    select: {
      attemptId: true,
      questionId: true,
      selected: true,
      isCorrect: true,
    },
  })

  // attempt별로 그룹화
  const questionsByAttempt = new Map<number, number[]>()
  for (const aq of allAttemptQuestions) {
    if (!questionsByAttempt.has(aq.attemptId)) {
      questionsByAttempt.set(aq.attemptId, [])
    }
    questionsByAttempt.get(aq.attemptId)!.push(aq.questionId)
  }

  const answersByAttempt = new Map<number, Map<number, number>>()
  for (const ans of allAnswers) {
    if (!answersByAttempt.has(ans.attemptId)) {
      answersByAttempt.set(ans.attemptId, new Map())
    }
    if (ans.selected !== null) {
      answersByAttempt.get(ans.attemptId)!.set(ans.questionId, ans.selected)
    }
  }

  // 모든 고유 questionId 수집
  const allQuestionIds = Array.from(
    new Set(allAttemptQuestions.map((aq) => aq.questionId))
  )

  if (allQuestionIds.length === 0) {
    return (
      <WrongAnswersContent
        data={{ wrong_answers: [], total_count: 0, subject_stats: [] }}
      />
    )
  }

  // 4. 모든 questions 한번에 조회
  const questions = await prisma.question.findMany({
    where: { id: { in: allQuestionIds } },
    select: {
      id: true,
      questionCode: true,
      examId: true,
      subjectId: true,
      questionText: true,
      choice1: true,
      choice2: true,
      choice3: true,
      choice4: true,
      answer: true,
      explanation: true,
    },
  })

  const questionsMap = new Map(questions.map((q) => [q.id, q]))

  // 고유 subjectId, examId 수집
  const subjectIds = Array.from(new Set(questions.map((q) => q.subjectId)))
  const examIds = Array.from(new Set(questions.map((q) => q.examId)))

  // 5. 모든 subjects 한번에 조회
  const subjects = await prisma.subject.findMany({
    where: { id: { in: subjectIds } },
    select: { id: true, name: true },
  })
  const subjectsMap = new Map(subjects.map((s) => [s.id, s.name]))

  // 6. 모든 exams 한번에 조회
  const exams = await prisma.exam.findMany({
    where: { id: { in: examIds } },
    select: { id: true, name: true },
  })
  const examsMap = new Map(exams.map((e) => [e.id, e.name]))

  // 7. 데이터 병합 및 틀린 문제 필터링
  const wrongAnswers: any[] = []

  for (const attempt of attempts) {
    const questionIds = questionsByAttempt.get(attempt.id) || []
    const answersMap = answersByAttempt.get(attempt.id) || new Map()

    for (const questionId of questionIds) {
      const question = questionsMap.get(questionId)
      if (!question) continue

      const studentAnswer = answersMap.get(questionId)
      const correctAnswer = question.answer

      // 틀린 문제만 추가
      if (
        studentAnswer !== undefined &&
        studentAnswer !== correctAnswer
      ) {
        wrongAnswers.push({
          attempt_id: attempt.id,
          attempt_date: attempt.submittedAt?.toISOString() ?? '',
          exam_id: question.examId,
          exam_name: examsMap.get(question.examId) || "알 수 없음",
          subject_id: question.subjectId,
          subject_name: subjectsMap.get(question.subjectId) || "알 수 없음",
          question_id: question.id,
          question_code: question.questionCode,
          question_text: question.questionText,
          choice_1: question.choice1,
          choice_2: question.choice2,
          choice_3: question.choice3,
          choice_4: question.choice4,
          correct_answer: correctAnswer,
          student_answer: studentAnswer,
          explanation: question.explanation,
        })
      }
    }
  }

  // 8. 중복 제거 (같은 문제를 여러 번 틀린 경우 가장 최근 것만)
  const uniqueWrongAnswers: typeof wrongAnswers = Array.from(
    wrongAnswers
      .reduce((map, item) => {
        const existing = map.get(item.question_id)
        if (
          !existing ||
          new Date(item.attempt_date) > new Date(existing.attempt_date)
        ) {
          map.set(item.question_id, item)
        }
        return map
      }, new Map())
      .values()
  )

  // 9. 과목별 통계
  const subjectStats: Record<string, { subject_id: number; subject_name: string; count: number }> = {}
  for (const item of uniqueWrongAnswers) {
    const key = String(item.subject_id)
    if (!subjectStats[key]) {
      subjectStats[key] = {
        subject_id: item.subject_id,
        subject_name: item.subject_name,
        count: 0,
      }
    }
    subjectStats[key].count++
  }

  const data = {
    wrong_answers: uniqueWrongAnswers,
    total_count: uniqueWrongAnswers.length,
    subject_stats: Object.values(subjectStats),
  }

  return <WrongAnswersContent data={data} />
}
