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

  // 공식 시험 목록 조회 (API route의 GET 로직과 동일)
  const exams = await prisma.exam.findMany({
    where: { examMode: "OFFICIAL" },
    include: {
      subjects: {
        select: { id: true, name: true, orderNo: true },
        orderBy: { orderNo: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const examsWithStats = await Promise.all(
    exams.map(async (exam) => {
      const [questionCount, attemptCount] = await Promise.all([
        prisma.question.count({
          where: { examId: exam.id, isActive: true },
        }),
        prisma.attempt.count({
          where: { examId: exam.id, status: "SUBMITTED" },
        }),
      ])

      return {
        id: exam.id,
        name: exam.name,
        exam_mode: exam.examMode,
        password: exam.password || "",
        duration_minutes: exam.durationMinutes,
        created_at: exam.createdAt.toISOString(),
        is_published: exam.isPublished,
        question_count: questionCount,
        attempt_count: attemptCount,
      }
    })
  )

  return <OfficialExamsClient initialExams={examsWithStats} />
}
