import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import ExamStartClient from "./ExamStartClient"

export const revalidate = 60

export async function generateStaticParams() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    select: { id: true },
  })
  return exams.map((e) => ({ examId: String(e.id) }))
}

export default async function ExamStartPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const eid = Number(examId)

  const getExamData = unstable_cache(
    async (id: number) => {
      const [ex, subs, qCounts] = await Promise.all([
        prisma.exam.findUnique({ where: { id }, include: { category: true } }),
        prisma.subject.findMany({ where: { examId: id }, orderBy: { orderNo: "asc" } }),
        prisma.question.groupBy({
          by: ["subjectId"],
          where: { examId: id, isActive: true },
          _count: { id: true },
        }),
      ])
      if (!ex) return null
      const bySubject: Record<number, number> = {}
      let total = 0
      for (const g of qCounts) { bySubject[g.subjectId] = g._count.id; total += g._count.id }
      return { exam: ex, subjects: subs, questionCounts: { total, bySubject } }
    },
    [`exam-${eid}`],
    { revalidate: 60 }
  )

  const data = await getExamData(eid)
  if (!data) notFound()

  const { exam, subjects, questionCounts } = data

  // snake_case 변환 (기존 클라이언트 코드 호환)
  const examData = {
    id: exam.id,
    name: exam.year
      ? `${exam.category.name} ${exam.year}년 ${exam.round}회`
      : exam.category.name,
    exam_mode: exam.examMode,
    duration_minutes: exam.durationMinutes,
    is_published: exam.isPublished,
    sort_order: exam.sortOrder,
  }

  const subjectsData = subjects.map((s) => ({
    id: s.id,
    exam_id: s.examId,
    name: s.name,
    questions_per_attempt: s.questionsPerAttempt,
    order_no: s.orderNo,
  }))

  return (
    <ExamStartClient
      examId={examId}
      exam={examData}
      subjects={subjectsData}
      officialQuestionCount={questionCounts.total}
      officialBySubject={questionCounts.bySubject}
    />
  )
}
