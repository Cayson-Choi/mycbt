"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ExamItem {
  id: number
  name: string
  year: number | null
  round: number | null
  duration_minutes: number
  min_tier: string
  total_questions: number
  questions_per_attempt: number
}

interface CategoryData {
  category: { id: number; name: string; description: string | null }
  exams: ExamItem[]
}

const roundColors = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
]

export default function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const router = useRouter()
  const [data, setData] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    params.then(({ categoryId }) => {
      loadCategory(categoryId)
    })
  }, [params])

  const loadCategory = async (categoryId: string) => {
    try {
      const res = await fetch(`/api/exam-categories/${categoryId}/exams`)
      if (!res.ok) {
        setError("카테고리를 찾을 수 없습니다")
        setLoading(false)
        return
      }
      const result = await res.json()
      setData(result)
    } catch {
      setError("데이터를 불러올 수 없습니다")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-36 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error || "데이터를 불러올 수 없습니다"}
          </p>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const { category, exams } = data

  // 년도별 그룹핑
  const examsByYear = new Map<number, ExamItem[]>()
  const noYearExams: ExamItem[] = []

  for (const exam of exams) {
    if (exam.year) {
      const yearExams = examsByYear.get(exam.year) || []
      yearExams.push(exam)
      examsByYear.set(exam.year, yearExams)
    } else {
      noYearExams.push(exam)
    }
  }

  // 년도 내림차순 정렬
  const sortedYears = Array.from(examsByYear.keys()).sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            홈으로
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {category.description}
            </p>
          )}
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            총 {exams.length}개 시험
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              아직 등록된 시험이 없습니다
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              관리자가 시험을 추가하면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 년도 없는 시험 (전기기초 등) */}
            {noYearExams.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {noYearExams.map((exam, idx) => (
                    <ExamCard key={exam.id} exam={exam} colorIndex={idx} />
                  ))}
                </div>
              </div>
            )}

            {/* 년도별 시험 */}
            {sortedYears.map((year) => {
              const yearExams = examsByYear.get(year)!
              return (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                      {year}년
                    </h2>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {yearExams.length}개 시험
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {yearExams.map((exam) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        colorIndex={(exam.round || 1) - 1}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ExamCard({
  exam,
  colorIndex,
}: {
  exam: ExamItem
  colorIndex: number
}) {
  const hasQuestions = exam.total_questions > 0
  const color = roundColors[colorIndex % roundColors.length]

  const cardContent = (
    <div
      className={`relative overflow-hidden rounded-xl p-4 sm:p-5 h-full transition-all ${
        hasQuestions
          ? `bg-gradient-to-br ${color} text-white shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer`
          : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 cursor-not-allowed"
      }`}
    >
      {/* 배경 장식 */}
      {hasQuestions && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
      )}

      {/* 회차 뱃지 */}
      <div className="flex items-center justify-between mb-3">
        {exam.round ? (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              hasQuestions
                ? "bg-white/20 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            }`}
          >
            {exam.round}회차
          </span>
        ) : (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              hasQuestions
                ? "bg-white/20 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            }`}
          >
            연습
          </span>
        )}
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            hasQuestions
              ? "bg-white/20"
              : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {exam.duration_minutes}분
        </span>
      </div>

      {/* 시험명 */}
      <h3 className="font-bold text-sm sm:text-base mb-1">
        {exam.year ? `${exam.year}년 ${exam.round}회` : exam.name}
      </h3>

      {/* 문제 수 */}
      <p
        className={`text-xs mb-3 ${
          hasQuestions ? "text-white/70" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {hasQuestions
          ? `${exam.questions_per_attempt}문항 출제`
          : "준비 중"}
      </p>

      {/* 하단 */}
      {hasQuestions ? (
        <div className="flex items-center text-xs font-medium text-white/90">
          시험 응시하기
          <svg
            className="w-3.5 h-3.5 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      ) : (
        <div className="text-xs">문제 등록 대기</div>
      )}
    </div>
  )

  if (!hasQuestions) {
    return cardContent
  }

  return (
    <Link href={`/exam/${exam.id}`} className="block">
      {cardContent}
    </Link>
  )
}
