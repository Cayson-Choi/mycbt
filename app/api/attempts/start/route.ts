import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 })
    }

    const { exam_id, password } = await request.json()
    if (!exam_id) {
      return NextResponse.json({ error: "exam_id가 필요합니다" }, { status: 400 })
    }

    const exam = await prisma.exam.findUnique({
      where: { id: Number(exam_id) },
      select: {
        id: true,
        name: true,
        examMode: true,
        durationMinutes: true,
        isPublished: true,
        password: true,
      },
    })
    if (!exam) {
      return NextResponse.json({ error: "존재하지 않는 시험입니다" }, { status: 404 })
    }

    const isOfficial = exam.examMode === "OFFICIAL"

    // OFFICIAL: 게시/비밀번호 검증
    if (isOfficial) {
      if (!exam.isPublished) {
        return NextResponse.json({ error: "현재 응시할 수 없는 시험입니다" }, { status: 403 })
      }
      if (!password || password !== exam.password) {
        return NextResponse.json({ error: "비밀번호가 일치하지 않습니다" }, { status: 403 })
      }
    }

    // 진행 중인 시험 삭제
    const existing = await prisma.attempt.findMany({
      where: { userId: session.user.id, status: "IN_PROGRESS" },
      select: { id: true },
    })
    if (existing.length > 0) {
      const ids = existing.map((e) => e.id)
      await Promise.all([
        prisma.attemptItem.deleteMany({ where: { attemptId: { in: ids } } }),
        prisma.subjectScore.deleteMany({ where: { attemptId: { in: ids } } }),
        prisma.attemptQuestion.deleteMany({ where: { attemptId: { in: ids } } }),
      ])
      await prisma.attempt.deleteMany({ where: { id: { in: ids } } })
    }

    const subjects = await prisma.subject.findMany({
      where: { examId: Number(exam_id) },
      orderBy: { orderNo: "asc" },
    })
    if (subjects.length === 0) {
      return NextResponse.json({ error: "과목 정보를 찾을 수 없습니다" }, { status: 404 })
    }

    const startedAt = new Date()
    const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000)

    if (isOfficial) {
      // OFFICIAL: 전체 활성 문제 id순
      const allQuestions = await prisma.question.findMany({
        where: { examId: Number(exam_id), isActive: true },
        orderBy: { id: "asc" },
        select: { id: true },
      })
      if (allQuestions.length === 0) {
        return NextResponse.json({ error: "출제할 문제가 없습니다" }, { status: 404 })
      }

      const newAttempt = await prisma.attempt.create({
        data: {
          userId: session.user.id,
          examId: Number(exam_id),
          status: "IN_PROGRESS",
          startedAt,
          expiresAt,
          totalQuestions: allQuestions.length,
        },
      })

      await prisma.attemptQuestion.createMany({
        data: allQuestions.map((q, i) => ({
          attemptId: newAttempt.id,
          seq: i + 1,
          questionId: q.id,
        })),
      })

      return NextResponse.json({
        attempt_id: newAttempt.id,
        exam_id: Number(exam_id),
        exam_name: exam.name,
        exam_mode: exam.examMode,
        duration_minutes: exam.durationMinutes,
        total_questions: allQuestions.length,
        expires_at: expiresAt.toISOString(),
        is_existing: false,
        message: "시험이 시작되었습니다",
      })
    } else {
      // PRACTICE: 과목별 랜덤 선택
      const totalQuestions = subjects.reduce((sum, s) => sum + s.questionsPerAttempt, 0)

      const newAttempt = await prisma.attempt.create({
        data: {
          userId: session.user.id,
          examId: Number(exam_id),
          status: "IN_PROGRESS",
          startedAt,
          expiresAt,
          totalQuestions,
        },
      })

      const attemptQuestions: { attemptId: number; seq: number; questionId: number }[] = []
      let seq = 1

      // 모든 과목 문제를 한 번에 조회 후 subjectId로 그룹핑
      const allQuestionsPractice = await prisma.question.findMany({
        where: { examId: Number(exam_id), isActive: true },
        select: { id: true, subjectId: true },
      })
      const questionsBySubject = new Map<number, { id: number }[]>()
      for (const q of allQuestionsPractice) {
        const list = questionsBySubject.get(q.subjectId) ?? []
        list.push({ id: q.id })
        questionsBySubject.set(q.subjectId, list)
      }

      for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i]
        const available = questionsBySubject.get(subject.id) ?? []

        if (available.length === 0) {
          await prisma.attempt.delete({ where: { id: newAttempt.id } })
          return NextResponse.json({ error: `${subject.name} 과목의 활성 문제가 없습니다` }, { status: 404 })
        }
        if (available.length < subject.questionsPerAttempt) {
          await prisma.attempt.delete({ where: { id: newAttempt.id } })
          return NextResponse.json(
            { error: `${subject.name} 과목의 문제가 부족합니다 (필요: ${subject.questionsPerAttempt}, 현재: ${available.length})` },
            { status: 400 }
          )
        }

        const shuffled = [...available].sort(() => Math.random() - 0.5)
        const selected = shuffled.slice(0, subject.questionsPerAttempt)
        for (const q of selected) {
          attemptQuestions.push({ attemptId: newAttempt.id, seq: seq++, questionId: q.id })
        }
      }

      await prisma.attemptQuestion.createMany({ data: attemptQuestions })

      return NextResponse.json({
        attempt_id: newAttempt.id,
        exam_id: Number(exam_id),
        exam_name: exam.name,
        exam_mode: exam.examMode,
        duration_minutes: exam.durationMinutes,
        total_questions: totalQuestions,
        expires_at: expiresAt.toISOString(),
        is_existing: false,
        message: "시험이 시작되었습니다",
      })
    }
  } catch (error) {
    console.error("Start attempt error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
