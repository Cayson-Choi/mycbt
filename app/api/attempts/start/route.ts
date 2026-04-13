import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hasTierAccess } from "@/lib/tier"
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

    // 시험 정보 + 과목 + 진행 중인 시험 + 문제 전부 병렬 조회
    const examId = Number(exam_id)
    const [exam, subjects, existing, allQuestions] = await Promise.all([
      prisma.exam.findUnique({
        where: { id: examId },
        select: { id: true, name: true, examMode: true, durationMinutes: true, isPublished: true, password: true, minTier: true },
      }),
      prisma.subject.findMany({ where: { examId }, orderBy: { orderNo: "asc" } }),
      prisma.attempt.findMany({ where: { userId: session.user.id, status: "IN_PROGRESS" }, select: { id: true } }),
      prisma.question.findMany({ where: { examId, isActive: true }, select: { id: true, subjectId: true } }),
    ])

    if (!exam) {
      return NextResponse.json({ error: "존재하지 않는 시험입니다" }, { status: 404 })
    }
    if (subjects.length === 0) {
      return NextResponse.json({ error: "과목 정보를 찾을 수 없습니다" }, { status: 404 })
    }

    const isOfficial = exam.examMode === "OFFICIAL"

    if (isOfficial) {
      if (!exam.isPublished) {
        return NextResponse.json({ error: "현재 응시할 수 없는 시험입니다" }, { status: 403 })
      }
      if (!password || password !== exam.password) {
        return NextResponse.json({ error: "비밀번호가 일치하지 않습니다" }, { status: 403 })
      }
    }

    // 등급 체크
    if (exam.minTier !== "FREE") {
      const profile = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { tier: true, isAdmin: true },
      })

      if (!profile?.isAdmin && !hasTierAccess(profile?.tier || "FREE", exam.minTier)) {
        return NextResponse.json(
          {
            error: "등급이 부족합니다",
            required_tier: exam.minTier,
            user_tier: profile?.tier || "FREE",
          },
          { status: 403 }
        )
      }
    }

    // 진행 중인 시험 삭제 (fire-and-forget: 새 시험 생성과 병렬)
    let cleanupPromise: Promise<void> | null = null
    if (existing.length > 0) {
      const ids = existing.map((e) => e.id)
      cleanupPromise = (async () => {
        await Promise.all([
          prisma.attemptItem.deleteMany({ where: { attemptId: { in: ids } } }),
          prisma.subjectScore.deleteMany({ where: { attemptId: { in: ids } } }),
          prisma.attemptQuestion.deleteMany({ where: { attemptId: { in: ids } } }),
        ])
        await prisma.attempt.deleteMany({ where: { id: { in: ids } } })
      })()
    }

    const startedAt = new Date()
    const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60 * 1000)

    if (allQuestions.length === 0) {
      if (cleanupPromise) await cleanupPromise
      return NextResponse.json({ error: "출제할 문제가 없습니다" }, { status: 404 })
    }

    if (isOfficial) {
      // OFFICIAL: 전체 활성 문제 id순
      const officialQuestions = allQuestions.sort((a, b) => a.id - b.id)
      if (officialQuestions.length === 0) {
        if (cleanupPromise) await cleanupPromise
        return NextResponse.json({ error: "출제할 문제가 없습니다" }, { status: 404 })
      }

      // cleanup과 attempt 생성 병렬
      if (cleanupPromise) await cleanupPromise
      const newAttempt = await prisma.attempt.create({
        data: {
          userId: session.user.id,
          examId: examId,
          status: "IN_PROGRESS",
          startedAt,
          expiresAt,
          totalQuestions: officialQuestions.length,
        },
      })

      await prisma.attemptQuestion.createMany({
        data: officialQuestions.map((q, i) => ({
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
        total_questions: officialQuestions.length,
        expires_at: expiresAt.toISOString(),
        is_existing: false,
        message: "시험이 시작되었습니다",
      })
    } else {
      // PRACTICE: 과목별 랜덤 선택
      const totalQuestions = subjects.reduce((sum, s) => sum + s.questionsPerAttempt, 0)

      if (cleanupPromise) await cleanupPromise
      const newAttempt = await prisma.attempt.create({
        data: {
          userId: session.user.id,
          examId: examId,
          status: "IN_PROGRESS",
          startedAt,
          expiresAt,
          totalQuestions,
        },
      })

      const attemptQuestions: { attemptId: number; seq: number; questionId: number }[] = []
      let seq = 1

      // 이미 조회된 allQuestions를 subjectId로 그룹핑 (추가 DB 조회 없음)
      const questionsBySubject = new Map<number, { id: number }[]>()
      for (const q of allQuestions) {
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
