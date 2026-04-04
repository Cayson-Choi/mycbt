import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import ResetAttemptsSection from "@/components/ResetAttemptsSection"
import DuplicateQuestionsSection from "@/components/DuplicateQuestionsSection"
import ExamSettingsSection from "@/components/ExamSettingsSection"

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login?redirect=/admin")
  }

  // 관리자 권한 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect("/")
  }

  // 통계 데이터 조회
  const [totalUsers, totalQuestions, totalAttempts, exams] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.attempt.count({ where: { status: "SUBMITTED" } }),
    prisma.exam.findMany({
      select: {
        id: true,
        name: true,
        year: true,
        round: true,
        examMode: true,
        durationMinutes: true,
        sortOrder: true,
        category: { select: { name: true } },
      },
      orderBy: [{ categoryId: "asc" }, { year: "desc" }, { round: "asc" }, { sortOrder: "asc" }],
    }),
  ])

  const examsForProps = exams.map((e) => ({
    id: e.id,
    name: e.year
      ? `${e.category.name} ${e.year}년 ${e.round}회`
      : e.category.name,
    exam_mode: e.examMode,
    duration_minutes: e.durationMinutes,
    sort_order: e.sortOrder,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            👨‍💼 관리자 페이지
          </h1>
          <p className="text-gray-600 dark:text-gray-400">시스템 관리 및 설정</p>
        </div>

        {/* 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">전체 회원</span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                {totalUsers}명
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">전체 문제</span>
              <span className="text-sm font-bold text-green-700 dark:text-green-300">
                {totalQuestions}개
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">총 응시</span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {totalAttempts}회
              </span>
            </div>
          </div>
        </div>

        {/* 시험별 문제 수 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">📚 시험별 문제 현황</h2>
          <div className="space-y-3">
            {exams.map((exam) => (
              <ExamQuestionCount key={exam.id} examId={exam.id} examName={exam.year ? `${exam.category.name} ${exam.year}년 ${exam.round}회` : exam.category.name} />
            ))}
          </div>
        </div>

        {/* 출제 문항 수 설정 */}
        <ExamSettingsSection exams={examsForProps} />

        {/* 중복 문제 관리 */}
        <DuplicateQuestionsSection />

        {/* 응시 기록 초기화 */}
        <ResetAttemptsSection exams={examsForProps} />

        {/* 관리 메뉴 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/exams"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">시험 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  년도/회차 시험 생성 및 관리
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/questions"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">문제 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  문제 추가, 수정, 삭제
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">회원 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  회원 목록, 권한 관리
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/official-exams"
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border dark:border-gray-700"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎓</span>
              </div>
              <div>
                <h3 className="font-bold text-lg dark:text-white">공식 시험 관리</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  중간고사/기말고사 출제, 결과 조회
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* 하단 버튼 */}
        <div>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}

async function ExamQuestionCount({
  examId,
  examName,
}: {
  examId: number
  examName: string
}) {
  const [count, subjects] = await Promise.all([
    prisma.question.count({ where: { examId } }),
    prisma.subject.findMany({
      where: { examId },
      select: { id: true, name: true },
      orderBy: { orderNo: "asc" },
    }),
  ])

  const subjectCounts = await Promise.all(
    subjects.map(async (s) => {
      const cnt = await prisma.question.count({
        where: { examId, subjectId: s.id },
      })
      return { name: s.name, count: cnt }
    })
  )

  return (
    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium dark:text-gray-200">{examName}</span>
        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
          {count}개
        </span>
      </div>
      {subjectCounts.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 ml-1 text-xs text-gray-500 dark:text-gray-400">
          {subjectCounts.map((sc) => (
            <span key={sc.name}>
              {sc.name} <span className="font-medium">{sc.count}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
