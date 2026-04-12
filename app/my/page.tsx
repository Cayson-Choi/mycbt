import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from 'next/link'
import AttemptHistoryClient from './AttemptHistoryClient'

export default async function MyPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login?redirect=/my')
  }

  const userId = session.user.id

  // 1. 사용자의 모든 응시 기록 조회 (제출된 것만)
  const attempts = await prisma.attempt.findMany({
    where: {
      userId,
      status: "SUBMITTED",
    },
    select: {
      id: true,
      examId: true,
      startedAt: true,
      submittedAt: true,
      totalScore: true,
      gradingStatus: true,
      exam: {
        select: { name: true, examType: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  })

  // 2. 모든 응시의 과목별 점수를 한번에 조회 (N+1 방지)
  const attemptIds = attempts.map((a) => a.id)
  let allSubjectScores: any[] = []

  if (attemptIds.length > 0) {
    allSubjectScores = await prisma.subjectScore.findMany({
      where: { attemptId: { in: attemptIds } },
      select: {
        attemptId: true,
        subjectId: true,
        subjectScore: true,
        subjectCorrect: true,
        subjectQuestions: true,
        subject: {
          select: { name: true },
        },
      },
      orderBy: { subjectId: "asc" },
    })
  }

  // attemptId별로 그룹핑
  const scoresByAttempt = new Map<number, any[]>()
  for (const score of allSubjectScores) {
    const list = scoresByAttempt.get(score.attemptId) || []
    list.push({
      attempt_id: score.attemptId,
      subject_id: score.subjectId,
      subject_score: score.subjectScore,
      subject_correct: score.subjectCorrect,
      subject_questions: score.subjectQuestions,
      subjects: { name: score.subject.name },
    })
    scoresByAttempt.set(score.attemptId, list)
  }

  const attemptsWithSubjects = attempts.map((attempt) => ({
    id: attempt.id,
    exam_id: attempt.examId,
    started_at: attempt.startedAt.toISOString(),
    submitted_at: attempt.submittedAt?.toISOString() ?? null,
    total_score: attempt.totalScore,
    grading_status: attempt.gradingStatus,
    exam_name: attempt.exam?.name || "알 수 없음",
    exam_type: attempt.exam?.examType || "WRITTEN",
    subject_scores: scoresByAttempt.get(attempt.id) || [],
  }))

  // 3. 통계 계산
  const totalAttempts = attempts.length
  const scores = attempts
    .map((a) => a.totalScore)
    .filter((s): s is number => s !== null)
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0
  const passCount = scores.filter((s) => s >= 60).length
  const passRate =
    totalAttempts > 0
      ? Math.round((passCount / totalAttempts) * 100)
      : 0

  // 4. 시험별 통계
  const examStatsMap = attempts.reduce((acc: any, attempt) => {
    const examId = attempt.examId
    const examName = attempt.exam?.name || "알 수 없음"

    if (!acc[examId]) {
      acc[examId] = {
        exam_id: examId,
        exam_name: examName,
        count: 0,
        scores: [] as number[],
      }
    }

    acc[examId].count++
    if (attempt.totalScore !== null) {
      acc[examId].scores.push(attempt.totalScore)
    }

    return acc
  }, {})

  const examStats = Object.values(examStatsMap).map((stat: any) => ({
    exam_id: stat.exam_id,
    exam_name: stat.exam_name,
    attempt_count: stat.count,
    avg_score:
      stat.scores.length > 0
        ? Math.round(
            stat.scores.reduce((a: number, b: number) => a + b, 0) /
              stat.scores.length
          )
        : 0,
    max_score: stat.scores.length > 0 ? Math.max(...stat.scores) : 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">마이페이지</h1>
          <p className="text-gray-600 dark:text-gray-400">내 응시 기록과 통계를 확인하세요</p>
        </div>

        {/* 전체 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">총 응시</span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{totalAttempts}회</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">평균</span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">{avgScore}점</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">최고</span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{maxScore}점</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">합격</span>
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{passCount}회</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">합격률</span>
              <span className="text-sm font-bold text-red-700 dark:text-red-300">{passRate}%</span>
            </div>
          </div>
        </div>

        {/* 시험별 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 border dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold mb-4 dark:text-white">시험별 성적</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {examStats.map((exam) => (
              <div key={exam.exam_id} className="border dark:border-gray-600 rounded-lg p-4">
                <div className="font-semibold text-lg mb-2 dark:text-white">{exam.exam_name}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">응시 횟수:</span>
                    <span className="font-medium dark:text-gray-200">{exam.attempt_count}회</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">평균 점수:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {exam.avg_score}점
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">최고 점수:</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {exam.max_score}점
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 응시 기록 (클라이언트 컴포넌트 - 필터링 인터랙션) */}
        <AttemptHistoryClient
          attempts={attemptsWithSubjects}
          examStats={examStats}
        />

        {/* 하단 버튼 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Link
            href="/"
            className="flex-1 px-3 py-2.5 bg-gray-600 dark:bg-gray-700 text-white text-center rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 text-sm"
          >
            홈으로
          </Link>
          <Link
            href="/my/profile"
            className="flex-1 px-3 py-2.5 bg-blue-600 dark:bg-blue-500 text-white text-center rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm"
          >
            정보수정 및 탈퇴
          </Link>
          <Link
            href="/my/wrong-answers"
            className="flex-1 px-3 py-2.5 bg-red-600 dark:bg-red-500 text-white text-center rounded-lg hover:bg-red-700 dark:hover:bg-red-600 text-sm"
          >
            오답노트
          </Link>
        </div>
      </div>
    </div>
  )
}
