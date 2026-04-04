import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ExamStartClient from "./ExamStartClient"

export default async function ExamStartPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = await params
  const eid = Number(examId)

  // 시험 정보 + 과목 + 문제 수 병렬 조회 (서버에서 직접 DB 접근)
  const [exam, subjects, questionCounts] = await Promise.all([
    prisma.exam.findUnique({
      where: { id: eid },
      include: { category: true },
    }),
    prisma.subject.findMany({
      where: { examId: eid },
      orderBy: { orderNo: "asc" },
    }),
    // OFFICIAL 모드용: 과목별 문제 수 (PRACTICE에서도 가볍게 가져옴)
    prisma.question
      .groupBy({
        by: ["subjectId"],
        where: { examId: eid, isActive: true },
        _count: { id: true },
      })
      .then((groups) => {
        const bySubject: Record<number, number> = {}
        let total = 0
        for (const g of groups) {
          bySubject[g.subjectId] = g._count.id
          total += g._count.id
        }
        return { total, bySubject }
      }),
  ])

  if (!exam) {
    notFound()
  }

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
