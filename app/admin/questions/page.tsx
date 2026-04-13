import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import QuestionsClient from "./QuestionsClient"

export const dynamic = 'force-dynamic'

export default async function AdminQuestionsPage() {
  // 서버에서 시험 목록 + 초기 문제 20건을 프리페치
  const [examsRaw, questionsRaw] = await Promise.all([
    prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        year: true,
        round: true,
        examMode: true,
        examType: true,
        durationMinutes: true,
        sortOrder: true,
        category: { select: { name: true, grade: true } },
      },
      orderBy: [{ categoryId: "asc" }, { year: "desc" }, { round: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.question.findMany({
      include: {
        exam: { select: { name: true, category: { select: { name: true } } } },
        subject: { select: { name: true } },
      },
      orderBy: [{ examId: "asc" }, { subjectId: "asc" }, { questionCode: "asc" }],
      take: 20,
    }),
  ])

  const initialExams = examsRaw.map((e) => ({
    id: e.id,
    name: e.year
      ? `${e.category?.name} ${e.examType === 'PRACTICAL' ? '실기 ' : ''}${e.year}년 ${e.round}회`
      : e.name,
    category_name: e.category?.name || "",
    category_grade: e.category?.grade || "기타",
    exam_mode: e.examMode,
    exam_type: e.examType,
    duration_minutes: e.durationMinutes,
    sort_order: e.sortOrder,
  }))

  const initialQuestions = questionsRaw.map((q) => ({
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
    explanation: q.explanation,
    image_url: q.imageUrl,
    points: q.points,
    exams: q.exam ? { name: q.exam.category?.name || q.exam.name } : null,
    subjects: q.subject ? { name: q.subject.name } : null,
  }))

  return (
    <Suspense>
      <QuestionsClient initialExams={initialExams} initialQuestions={initialQuestions} />
    </Suspense>
  )
}
