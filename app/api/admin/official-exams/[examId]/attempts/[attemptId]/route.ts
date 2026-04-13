import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id)
      return NextResponse.json({ error: "로그인 필요" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })
    if (!user?.isAdmin)
      return NextResponse.json({ error: "권한 없음" }, { status: 403 })

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

    if (!attempt) {
      return NextResponse.json({ error: "시험을 찾을 수 없습니다" }, { status: 404 })
    }
    if (attempt.status !== "SUBMITTED") {
      return NextResponse.json({ error: "제출된 시험이 아닙니다" }, { status: 400 })
    }

    // 학생 프로필 조회
    const studentProfile = await prisma.user.findUnique({
      where: { id: attempt.userId },
      select: { name: true, studentId: true },
    })

    // 시험 정보 조회
    const examData = await prisma.exam.findUnique({
      where: { id: attempt.examId },
      select: { name: true, examMode: true },
    })

    // 과목별 점수 조회
    const subjectScores = await prisma.subjectScore.findMany({
      where: { attemptId: attemptIdNum },
      include: {
        subject: { select: { id: true, name: true, orderNo: true } },
      },
    })

    // 문제별 정답/오답 조회
    const attemptQuestions = await prisma.attemptQuestion.findMany({
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
    })

    // 학생 답안 조회
    const studentAnswers = await prisma.attemptItem.findMany({
      where: { attemptId: attemptIdNum },
    })

    const answersMap = new Map<number, (typeof studentAnswers)[0]>()
    studentAnswers.forEach((item) => {
      answersMap.set(item.questionId, item)
    })

    // 과목 이름 맵
    const subjectsMap: Record<number, any> = {}
    for (const ss of subjectScores) {
      subjectsMap[ss.subject.id] = ss.subject
    }

    const questionsWithAnswers = attemptQuestions.map((aq) => {
      const q = aq.question
      const studentAnswer = answersMap.get(aq.questionId)
      const subjectName = q.subjectId
        ? subjectsMap[q.subjectId]?.name || ""
        : ""

      // gradingStatus 매핑: Prisma enum -> 프론트 호환
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

    return NextResponse.json({
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
          : attempt.gradingStatus,
      status: attempt.status,
      started_at: attempt.startedAt?.toISOString(),
      submitted_at: attempt.submittedAt?.toISOString(),
      total_questions: attempt.totalQuestions,
      total_correct: attempt.totalCorrect,
      total_score: attempt.totalScore,
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
    })
  } catch (error) {
    console.error("Admin attempt detail error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
