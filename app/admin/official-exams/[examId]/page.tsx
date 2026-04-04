import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import OfficialExamDetailClient from "@/components/admin/OfficialExamDetailClient"

export default async function OfficialExamDetailPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
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

  const { examId } = await params
  const examIdNum = parseInt(examId)

  // 시험 정보 조회
  const exam = await prisma.exam.findUnique({
    where: { id: examIdNum, examMode: "OFFICIAL" },
    select: {
      id: true,
      name: true,
      password: true,
      durationMinutes: true,
      isPublished: true,
    },
  })

  if (!exam) {
    notFound()
  }

  // 결과 + 문제 + 과목 동시 조회
  const [attempts, questions, subjects] = await Promise.all([
    // 제출된 attempts 조회
    prisma.attempt.findMany({
      where: { examId: examIdNum, status: "SUBMITTED" },
      select: {
        id: true,
        userId: true,
        status: true,
        startedAt: true,
        submittedAt: true,
        totalQuestions: true,
        totalCorrect: true,
        totalScore: true,
        gradingStatus: true,
      },
      orderBy: { totalScore: "desc" },
    }),
    // 문제 조회
    prisma.question.findMany({
      where: { examId: examIdNum },
      include: {
        subject: { select: { name: true } },
      },
      orderBy: [{ subjectId: "asc" }, { questionCode: "asc" }],
    }),
    // 과목 조회
    prisma.subject.findMany({
      where: { examId: examIdNum },
      select: { id: true, name: true, orderNo: true },
      orderBy: { orderNo: "asc" },
    }),
  ])

  // 사용자 정보 조회
  const userIds = attempts.map((a) => a.userId)
  const profiles =
    userIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: userIds } },
          select: { id: true, name: true, studentId: true },
        })
      : []

  const profilesMap: Record<string, (typeof profiles)[0]> = {}
  for (const p of profiles) {
    profilesMap[p.id] = p
  }

  // 결과 데이터 변환
  const resultsData = attempts.map((a) => {
    const p = profilesMap[a.userId]
    return {
      attempt_id: a.id,
      user_id: a.userId,
      student_id: p?.studentId || "",
      name: p?.name || "",
      affiliation: "",
      total_questions: a.totalQuestions ?? 0,
      total_correct: a.totalCorrect ?? 0,
      total_score: a.totalScore ?? 0,
      grading_status:
        a.gradingStatus === "PENDING" ? "PENDING_MANUAL" : (a.gradingStatus ?? "COMPLETED"),
      started_at: a.startedAt?.toISOString() ?? null,
      submitted_at: a.submittedAt?.toISOString() ?? null,
    }
  })

  // 문제 데이터 변환 (snake_case, 프론트 호환)
  const questionsData = questions.map((q) => ({
    id: q.id,
    question_code: q.questionCode,
    question_text: q.questionText,
    question_type:
      q.questionType === "MULTIPLE_CHOICE" ? "CHOICE" : q.questionType,
    subject_id: q.subjectId,
    answer: q.answer ?? 0,
    points: q.points,
    image_url: q.imageUrl,
  }))

  // 과목 데이터 변환
  const subjectsData = subjects.map((s) => ({
    id: s.id,
    name: s.name,
    order_no: s.orderNo,
  }))

  // 시험 데이터 변환
  const examData = {
    id: exam.id,
    name: exam.name,
    password: exam.password || "",
    duration_minutes: exam.durationMinutes,
    is_published: exam.isPublished,
  }

  return (
    <OfficialExamDetailClient
      examId={examId}
      initialExam={examData}
      initialResults={resultsData}
      initialQuestions={questionsData}
      initialSubjects={subjectsData}
    />
  )
}
