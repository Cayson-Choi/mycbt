import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import OfficialExamsClient from "@/components/admin/OfficialExamsClient"

export default async function OfficialExamsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/login?redirect=/admin/official-exams")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) {
    redirect("/")
  }

  // 공식 시험 목록 + 통계를 단일 배치로 조회 (N+1 제거)
  const [exams, questionCounts, attemptCounts] = await Promise.all([
    prisma.exam.findMany({
      where: { examMode: "OFFICIAL" },
      include: {
        subjects: {
          select: { id: true, name: true, orderNo: true },
          orderBy: { orderNo: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.question.groupBy({
      by: ['examId'],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.attempt.groupBy({
      by: ['examId'],
      where: { status: "SUBMITTED" },
      _count: { id: true },
    }),
  ])

  const questionCountMap = new Map(questionCounts.map((r) => [r.examId, r._count.id]))
  const attemptCountMap = new Map(attemptCounts.map((r) => [r.examId, r._count.id]))

  const examsWithStats = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    exam_mode: exam.examMode,
    password: exam.password || "",
    duration_minutes: exam.durationMinutes,
    created_at: exam.createdAt.toISOString(),
    is_published: exam.isPublished,
    question_count: questionCountMap.get(exam.id) || 0,
    attempt_count: attemptCountMap.get(exam.id) || 0,
  }))

  return <OfficialExamsClient initialExams={examsWithStats} />
}
