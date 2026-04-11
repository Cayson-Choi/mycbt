import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
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
        data={{
          wrong_answers: [],
          total_count: 0,
          total_attempted: 0,
          subject_stats: [],
          trend_data: [],
        }}
      />
    )
  }

  const attemptIds = attempts.map((a) => a.id)

  // 2+3. attempt_questions와 answers를 병렬 조회
  const [allAttemptQuestions, allAnswers] = await Promise.all([
    prisma.attemptQuestion.findMany({
      where: { attemptId: { in: attemptIds } },
      select: { attemptId: true, questionId: true },
    }),
    prisma.attemptItem.findMany({
      where: { attemptId: { in: attemptIds } },
      select: {
        attemptId: true,
        questionId: true,
        selected: true,
        isCorrect: true,
      },
    }),
  ])

  // attempt_id -> submittedAt 매핑
  const attemptDateMap = new Map(attempts.map((a) => [a.id, a.submittedAt]))

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
        data={{
          wrong_answers: [],
          total_count: 0,
          total_attempted: 0,
          subject_stats: [],
          trend_data: [],
        }}
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
      choice1Image: true,
      choice2Image: true,
      choice3Image: true,
      choice4Image: true,
      answer: true,
      explanation: true,
    },
  })

  const questionsMap = new Map(questions.map((q) => [q.id, q]))

  // 고유 subjectId, examId 수집
  const subjectIds = Array.from(new Set(questions.map((q) => q.subjectId)))
  const examIds = Array.from(new Set(questions.map((q) => q.examId)))

  // 5+6+7. subjects, exams, wrongNoteItems 병렬 조회
  const [subjects, exams, wrongNoteItems] = await Promise.all([
    prisma.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { id: true, name: true },
    }),
    prisma.exam.findMany({
      where: { id: { in: examIds } },
      select: { id: true, name: true, examType: true },
    }),
    prisma.wrongNoteItem.findMany({
      where: { userId, questionId: { in: allQuestionIds } },
      select: {
        questionId: true,
        bookmarked: true,
        userMemo: true,
        wrongCount: true,
      },
    }),
  ])

  const subjectsMap = new Map(subjects.map((s) => [s.id, s.name]))
  const examsMap = new Map(exams.map((e) => [e.id, e.name]))
  const examTypeMap = new Map(exams.map((e) => [e.id, e.examType]))
  const wrongNoteMap = new Map(
    wrongNoteItems.map((w) => [w.questionId, w])
  )

  // 8. 과목별 전체 풀이/오답 카운트 (과목명 기준 집계)
  const subjectAttemptedCount = new Map<string, number>() // 과목명 → 풀이한 문제 수
  const subjectWrongCount = new Map<string, number>() // 과목명 → 오답 수

  // 문제별 오답 횟수 (같은 문제를 여러 번 풀었는지 추적)
  const questionWrongCount = new Map<number, number>()

  // 9. 데이터 병합 및 틀린 문제 집계
  const wrongAnswersRaw: {
    attempt_id: number
    attempt_date: string
    question_id: number
    student_answer: number
  }[] = []

  for (const attempt of attempts) {
    const questionIds = questionsByAttempt.get(attempt.id) || []
    const answersMap = answersByAttempt.get(attempt.id) || new Map()

    for (const questionId of questionIds) {
      const question = questionsMap.get(questionId)
      if (!question) continue

      const subjectName = subjectsMap.get(question.subjectId) || "알 수 없음"
      const studentAnswer = answersMap.get(questionId)
      const correctAnswer = question.answer

      // 답안 기록이 있는 경우만 집계 (풀이한 문제)
      if (studentAnswer !== undefined) {
        subjectAttemptedCount.set(
          subjectName,
          (subjectAttemptedCount.get(subjectName) || 0) + 1
        )

        if (studentAnswer !== correctAnswer) {
          subjectWrongCount.set(
            subjectName,
            (subjectWrongCount.get(subjectName) || 0) + 1
          )
          questionWrongCount.set(
            questionId,
            (questionWrongCount.get(questionId) || 0) + 1
          )
          wrongAnswersRaw.push({
            attempt_id: attempt.id,
            attempt_date: attemptDateMap.get(attempt.id)?.toISOString() ?? '',
            question_id: questionId,
            student_answer: studentAnswer,
          })
        }
      }
    }
  }

  // 10. 중복 제거 (같은 문제를 여러 번 틀린 경우 가장 최근 것만) + 보강 필드
  const uniqueMap = new Map<number, typeof wrongAnswersRaw[0]>()
  for (const item of wrongAnswersRaw) {
    const existing = uniqueMap.get(item.question_id)
    if (!existing || new Date(item.attempt_date) > new Date(existing.attempt_date)) {
      uniqueMap.set(item.question_id, item)
    }
  }

  const uniqueWrongAnswers = Array.from(uniqueMap.values()).map((item) => {
    const q = questionsMap.get(item.question_id)!
    const note = wrongNoteMap.get(item.question_id)
    return {
      attempt_id: item.attempt_id,
      attempt_date: item.attempt_date,
      exam_id: q.examId,
      exam_name: examsMap.get(q.examId) || "알 수 없음",
      exam_type: examTypeMap.get(q.examId) || "WRITTEN",
      subject_id: q.subjectId,
      subject_name: subjectsMap.get(q.subjectId) || "알 수 없음",
      question_id: q.id,
      question_code: q.questionCode,
      question_text: q.questionText,
      choice_1: q.choice1,
      choice_2: q.choice2,
      choice_3: q.choice3,
      choice_4: q.choice4,
      choice_1_image: q.choice1Image,
      choice_2_image: q.choice2Image,
      choice_3_image: q.choice3Image,
      choice_4_image: q.choice4Image,
      correct_answer: q.answer ?? 0,
      student_answer: item.student_answer,
      explanation: q.explanation,
      wrong_count: questionWrongCount.get(q.id) || 1,
      bookmarked: note?.bookmarked ?? false,
      user_memo: note?.userMemo ?? null,
    }
  })

  // 정렬: 반복 오답 → 최근 순
  uniqueWrongAnswers.sort((a, b) => {
    if (b.wrong_count !== a.wrong_count) return b.wrong_count - a.wrong_count
    return new Date(b.attempt_date).getTime() - new Date(a.attempt_date).getTime()
  })

  // 11. 과목별 통계 (과목명 기준 집계)
  const subjectStats = Array.from(subjectAttemptedCount.entries()).map(
    ([name, attempted]) => {
      const wrong = subjectWrongCount.get(name) || 0
      return {
        subject_name: name,
        attempted,
        wrong,
        error_rate: attempted > 0 ? Math.round((wrong / attempted) * 1000) / 10 : 0,
      }
    }
  )
  // 오답률 높은 순
  subjectStats.sort((a, b) => b.error_rate - a.error_rate)

  // 12. 최근 30일 오답 트렌드 (일자별)
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const trendMap = new Map<string, number>()
  for (const raw of wrongAnswersRaw) {
    const d = new Date(raw.attempt_date)
    if (d < thirtyDaysAgo) continue
    const key = d.toISOString().slice(0, 10) // YYYY-MM-DD
    trendMap.set(key, (trendMap.get(key) || 0) + 1)
  }
  const trendData: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    trendData.push({ date: key, count: trendMap.get(key) || 0 })
  }

  // 총 풀이 문제 수
  const totalAttempted = Array.from(subjectAttemptedCount.values()).reduce(
    (a, b) => a + b,
    0
  )

  const data = {
    wrong_answers: uniqueWrongAnswers,
    total_count: uniqueWrongAnswers.length,
    total_attempted: totalAttempted,
    subject_stats: subjectStats,
    trend_data: trendData,
  }

  return <WrongAnswersContent data={data} />
}
