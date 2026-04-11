import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import RetryClient from "./RetryClient"

export default async function RetryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/my/wrong-answers')
  }

  const { filter = 'all' } = await searchParams
  const userId = session.user.id

  // 사용자의 모든 제출된 시도에서 오답 추출 (page.tsx와 동일한 로직)
  const attempts = await prisma.attempt.findMany({
    where: { userId, status: "SUBMITTED" },
    select: { id: true, submittedAt: true },
    orderBy: { submittedAt: "desc" },
  })

  if (attempts.length === 0) {
    redirect('/my/wrong-answers')
  }

  const attemptIds = attempts.map((a) => a.id)

  const [allAttemptQuestions, allAnswers] = await Promise.all([
    prisma.attemptQuestion.findMany({
      where: { attemptId: { in: attemptIds } },
      select: { attemptId: true, questionId: true },
    }),
    prisma.attemptItem.findMany({
      where: { attemptId: { in: attemptIds } },
      select: { attemptId: true, questionId: true, selected: true },
    }),
  ])

  const attemptDateMap = new Map(attempts.map((a) => [a.id, a.submittedAt]))
  const questionsByAttempt = new Map<number, number[]>()
  for (const aq of allAttemptQuestions) {
    if (!questionsByAttempt.has(aq.attemptId)) questionsByAttempt.set(aq.attemptId, [])
    questionsByAttempt.get(aq.attemptId)!.push(aq.questionId)
  }
  const answersByAttempt = new Map<number, Map<number, number>>()
  for (const ans of allAnswers) {
    if (!answersByAttempt.has(ans.attemptId)) answersByAttempt.set(ans.attemptId, new Map())
    if (ans.selected !== null) answersByAttempt.get(ans.attemptId)!.set(ans.questionId, ans.selected)
  }

  const allQuestionIds = Array.from(new Set(allAttemptQuestions.map((aq) => aq.questionId)))
  if (allQuestionIds.length === 0) redirect('/my/wrong-answers')

  const questions = await prisma.question.findMany({
    where: { id: { in: allQuestionIds } },
    select: {
      id: true, questionCode: true, subjectId: true, questionText: true,
      choice1: true, choice2: true, choice3: true, choice4: true,
      choice1Image: true, choice2Image: true, choice3Image: true, choice4Image: true,
      answer: true, explanation: true,
    },
  })
  const questionsMap = new Map(questions.map((q) => [q.id, q]))
  const subjectIds = Array.from(new Set(questions.map((q) => q.subjectId)))
  const [subjects, wrongNoteItems] = await Promise.all([
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } }),
    prisma.wrongNoteItem.findMany({
      where: { userId, questionId: { in: allQuestionIds } },
      select: { questionId: true, bookmarked: true },
    }),
  ])
  const subjectsMap = new Map(subjects.map((s) => [s.id, s.name]))
  const bookmarkedSet = new Set(wrongNoteItems.filter((w) => w.bookmarked).map((w) => w.questionId))

  // 오답 집계 (question_id 기준 중복 제거)
  const wrongByQuestion = new Map<number, { questionId: number; subjectName: string; wrongCount: number; lastDate: Date | null }>()

  for (const attempt of attempts) {
    const qIds = questionsByAttempt.get(attempt.id) || []
    const ansMap = answersByAttempt.get(attempt.id) || new Map()
    const attemptDate = attemptDateMap.get(attempt.id)
    for (const qId of qIds) {
      const q = questionsMap.get(qId)
      if (!q) continue
      const selected = ansMap.get(qId)
      if (selected === undefined || selected === q.answer) continue
      const subjectName = subjectsMap.get(q.subjectId) || "알 수 없음"
      const prev = wrongByQuestion.get(qId)
      if (prev) {
        prev.wrongCount++
        if (attemptDate && (!prev.lastDate || attemptDate > prev.lastDate)) prev.lastDate = attemptDate
      } else {
        wrongByQuestion.set(qId, { questionId: qId, subjectName, wrongCount: 1, lastDate: attemptDate ?? null })
      }
    }
  }

  // 필터 적용
  let selectedQuestions = Array.from(wrongByQuestion.values())
  if (filter === 'bookmarked') {
    selectedQuestions = selectedQuestions.filter((w) => bookmarkedSet.has(w.questionId))
  } else if (filter === 'repeated') {
    selectedQuestions = selectedQuestions.filter((w) => w.wrongCount >= 2)
  } else if (filter !== 'all') {
    selectedQuestions = selectedQuestions.filter((w) => w.subjectName === filter)
  }

  if (selectedQuestions.length === 0) {
    redirect('/my/wrong-answers')
  }

  // 랜덤 섞기
  selectedQuestions.sort(() => Math.random() - 0.5)

  const retryQuestions = selectedQuestions.map((w) => {
    const q = questionsMap.get(w.questionId)!
    return {
      question_id: q.id,
      question_code: q.questionCode,
      question_text: q.questionText,
      subject_name: w.subjectName,
      choice_1: q.choice1,
      choice_2: q.choice2,
      choice_3: q.choice3,
      choice_4: q.choice4,
      choice_1_image: q.choice1Image,
      choice_2_image: q.choice2Image,
      choice_3_image: q.choice3Image,
      choice_4_image: q.choice4Image,
      correct_answer: q.answer ?? 0,
      explanation: q.explanation,
      wrong_count: w.wrongCount,
    }
  })

  return <RetryClient questions={retryQuestions} filter={filter} />
}
