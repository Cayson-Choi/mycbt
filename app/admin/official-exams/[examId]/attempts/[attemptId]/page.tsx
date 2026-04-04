import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import AttemptDetailClient from "@/components/admin/AttemptDetailClient"

export default async function AdminAttemptDetailPage({
  params,
}: {
  params: Promise<{ examId: string; attemptId: string }>
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

  const { examId, attemptId } = await params
  const examIdNum = parseInt(examId)
  const attemptIdNum = parseInt(attemptId)

  // attempt 조회
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptIdNum, examId: examIdNum },
    select: {
      id: true,
      userId: true,
      examId: true,
      status: true,
      startedAt: true,
      submittedAt: true,
      totalQuestions: true,
      totalCorrect: true,
      totalScore: true,
      gradingStatus: true,
    },
  })

  if (!attempt || attempt.status !== "SUBMITTED") {
    notFound()
  }

  // 학생 프로필, 시험 정보, 과목별 점수, 문제+답안 동시 조회
  const [studentProfile, examData, subjectScores, attemptQuestions, studentAnswers] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: attempt.userId },
        select: { name: true, studentId: true },
      }),
      prisma.exam.findUnique({
        where: { id: attempt.examId },
        select: { name: true, examMode: true },
      }),
      prisma.subjectScore.findMany({
        where: { attemptId: attemptIdNum },
        include: {
          subject: { select: { id: true, name: true, orderNo: true } },
        },
      }),
      prisma.attemptQuestion.findMany({
        where: { attemptId: attemptIdNum },
        include: {
          question: {
            select: {
              id: true,
              questionCode: true,
              questionText: true,
              questionType: true,
              choice1: true,
              choice2: true,
              choice3: true,
              choice4: true,
              answer: true,
              answerText: true,
              explanation: true,
              imageUrl: true,
              subjectId: true,
              points: true,
            },
          },
        },
        orderBy: { seq: "asc" },
      }),
      prisma.attemptItem.findMany({
        where: { attemptId: attemptIdNum },
      }),
    ])

  // 답안 맵 생성
  const answersMap = new Map<number, (typeof studentAnswers)[0]>()
  studentAnswers.forEach((item) => {
    answersMap.set(item.questionId, item)
  })

  // 과목 이름 맵
  const subjectsMap: Record<number, (typeof subjectScores)[0]["subject"]> = {}
  for (const ss of subjectScores) {
    subjectsMap[ss.subject.id] = ss.subject
  }

  // 문제+답안 데이터 변환
  const questionsWithAnswers = attemptQuestions.map((aq) => {
    const q = aq.question
    const studentAnswer = answersMap.get(aq.questionId)
    const subjectName = q.subjectId
      ? subjectsMap[q.subjectId]?.name || ""
      : ""

    // gradingStatus 매핑
    let itemGradingStatus = "AUTO"
    if (studentAnswer?.gradingStatus === "MANUAL_GRADED") {
      itemGradingStatus = "GRADED"
    } else if (studentAnswer?.gradingStatus === "AI_GRADED") {
      itemGradingStatus = "GRADED"
    } else if (studentAnswer?.gradingStatus === "PENDING") {
      itemGradingStatus = "PENDING"
    }

    return {
      seq: aq.seq,
      question_id: aq.questionId,
      question_text: q.questionText || "",
      question_type:
        q.questionType === "MULTIPLE_CHOICE" ? "CHOICE" : q.questionType,
      choice_1: q.choice1 || "",
      choice_2: q.choice2 || "",
      choice_3: q.choice3 || "",
      choice_4: q.choice4 || "",
      correct_answer: q.answer || 0,
      answer_text: q.answerText || null,
      explanation: q.explanation || "",
      image_url: q.imageUrl || null,
      subject_name: subjectName,
      points: q.points || 1,
      student_answer: studentAnswer?.selected || null,
      student_answer_text: studentAnswer?.answerText || null,
      is_correct: studentAnswer?.isCorrect ?? null,
      awarded_points: studentAnswer?.awardedPoints ?? null,
      grading_status: itemGradingStatus,
      ai_feedback: studentAnswer?.aiFeedback || null,
    }
  })

  // 최종 결과 데이터
  const resultData = {
    attempt_id: attempt.id,
    exam_id: attempt.examId,
    exam_name: examData?.name || "",
    exam_mode: examData?.examMode || "PRACTICE",
    student: {
      name: studentProfile?.name || "",
      student_id: studentProfile?.studentId || "",
      affiliation: "",
    },
    grading_status:
      attempt.gradingStatus === "PENDING"
        ? "PENDING_MANUAL"
        : (attempt.gradingStatus ?? "COMPLETED"),
    status: attempt.status,
    started_at: attempt.startedAt?.toISOString() ?? null,
    submitted_at: attempt.submittedAt?.toISOString() ?? null,
    total_questions: attempt.totalQuestions ?? 0,
    total_correct: attempt.totalCorrect ?? 0,
    total_score: attempt.totalScore ?? 0,
    subject_scores: subjectScores.map((ss) => ({
      subject_id: ss.subjectId,
      subject_questions: ss.subjectQuestions,
      subject_correct: ss.subjectCorrect,
      subject_score: ss.subjectScore,
      subjects: {
        name: ss.subject.name,
        order_no: ss.subject.orderNo,
      },
    })),
    questions: questionsWithAnswers,
  }

  return (
    <AttemptDetailClient
      examId={examId}
      attemptId={attemptId}
      initialResult={resultData}
    />
  )
}
