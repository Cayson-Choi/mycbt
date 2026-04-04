import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ExamsClient from "./ExamsClient"

export default async function AdminExamsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?redirect=/admin/exams")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })
  if (!user?.isAdmin) redirect("/")

  // 시험 목록 조회 (API route의 GET 로직과 동일)
  const exams = await prisma.exam.findMany({
    include: {
      category: { select: { id: true, name: true } },
      subjects: {
        select: {
          id: true,
          name: true,
          questionsPerAttempt: true,
          orderNo: true,
        },
        orderBy: { orderNo: "asc" },
      },
      _count: { select: { questions: true, attempts: true } },
    },
    orderBy: [
      { categoryId: "asc" },
      { year: "desc" },
      { round: "asc" },
      { sortOrder: "asc" },
    ],
  })

  const examsData = exams.map((e) => ({
    id: e.id,
    category_id: e.categoryId,
    category_name: e.category.name,
    name: e.name,
    year: e.year,
    round: e.round,
    exam_mode: e.examMode,
    duration_minutes: e.durationMinutes,
    is_published: e.isPublished,
    subjects: e.subjects.map((s) => ({
      id: s.id,
      name: s.name,
      questions_per_attempt: s.questionsPerAttempt,
    })),
    question_count: e._count.questions,
    attempt_count: e._count.attempts,
  }))

  // 카테고리 목록 조회 (exam-categories API와 동일하되 관리자용이므로 전체 조회)
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  })

  return (
    <ExamsClient
      initialExams={examsData}
      initialCategories={categories}
    />
  )
}
