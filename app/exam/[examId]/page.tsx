import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ExamStartClient from "./ExamStartClient"

// 시험 시작 페이지는 관리자가 수정한 정보(시간, 문항 수 등)를 즉시 반영해야 하므로 캐시 사용 안 함
export const dynamic = "force-dynamic"

export default async function ExamStartPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const eid = Number(examId)

  const [ex, subs, qCounts] = await Promise.all([
    prisma.exam.findUnique({ where: { id: eid }, include: { category: true } }),
    prisma.subject.findMany({ where: { examId: eid }, orderBy: { orderNo: "asc" } }),
    prisma.question.groupBy({
      by: ["subjectId"],
      where: { examId: eid, isActive: true },
      _count: { id: true },
    }),
  ])

  if (!ex) notFound()

  const bySubject: Record<number, number> = {}
  let total = 0
  for (const g of qCounts) { bySubject[g.subjectId] = g._count.id; total += g._count.id }

  const examData = {
    id: ex.id,
    name: ex.year
      ? `${ex.category.name} ${ex.year}년 ${ex.round}회`
      : ex.name,
    exam_mode: ex.examMode,
    duration_minutes: ex.durationMinutes,
    is_published: ex.isPublished,
    sort_order: ex.sortOrder,
  }

  const subjectsData = subs.map((s) => ({
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
      officialQuestionCount={total}
      officialBySubject={bySubject}
    />
  )
}
