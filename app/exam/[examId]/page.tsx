import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { unstable_cache } from "next/cache"
import ExamStartClient from "./ExamStartClient"

// 30초마다 갱신 — 관리자 수정 시 최대 30초 후 반영, 사용자에게는 캐시로 빠르게 표시
export const revalidate = 30

export async function generateStaticParams() {
  const exams = await prisma.exam.findMany({
    where: { isPublished: true },
    select: { id: true },
  })
  return exams.map((e) => ({ examId: String(e.id) }))
}

const getExamData = (eid: number) =>
  unstable_cache(
    async () => {
      const [ex, subs, total] = await Promise.all([
        prisma.exam.findUnique({ where: { id: eid }, include: { category: true } }),
        prisma.subject.findMany({ where: { examId: eid }, orderBy: { orderNo: "asc" } }),
        prisma.question.count({ where: { examId: eid, isActive: true } }),
      ])
      return { ex, subs, total }
    },
    [`exam-start-${eid}`],
    { revalidate: 60 }
  )()

export default async function ExamStartPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const eid = Number(examId)

  const { ex, subs, total } = await getExamData(eid)

  if (!ex) notFound()

  const examData = {
    id: ex.id,
    name: ex.year
      ? `${ex.category.name} ${ex.year}년 ${ex.round}회`
      : ex.name,
    exam_mode: ex.examMode,
    exam_type: ex.examType,
    duration_minutes: ex.durationMinutes,
    is_published: ex.isPublished,
    sort_order: ex.sortOrder,
    min_tier: ex.minTier,
    category_id: ex.categoryId,
    category_name: ex.category.name,
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
    />
  )
}
