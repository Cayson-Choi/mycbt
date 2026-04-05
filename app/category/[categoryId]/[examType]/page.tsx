import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const revalidate = 60

const EXAM_TYPE_MAP: Record<string, "WRITTEN" | "PRACTICAL"> = {
  written: "WRITTEN",
  practical: "PRACTICAL",
}

const EXAM_TYPE_LABEL: Record<string, string> = {
  written: "필기",
  practical: "실기",
}

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

const roundColors = [
  "from-blue-500 to-blue-700",
  "from-emerald-500 to-emerald-700",
  "from-amber-500 to-amber-700",
  "from-rose-500 to-rose-700",
]

export async function generateStaticParams() {
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    select: { id: true },
  })
  const params: { categoryId: string; examType: string }[] = []
  for (const c of categories) {
    params.push({ categoryId: String(c.id), examType: "written" })
    params.push({ categoryId: String(c.id), examType: "practical" })
  }
  return params
}

export default async function ExamTypePage({
  params,
}: {
  params: Promise<{ categoryId: string; examType: string }>
}) {
  const { categoryId, examType } = await params
  const id = parseInt(categoryId)
  const dbExamType = EXAM_TYPE_MAP[examType]

  if (isNaN(id) || !dbExamType) {
    notFound()
  }

  const getData = unstable_cache(
    async (catId: number, eType: "WRITTEN" | "PRACTICAL") => {
      const cat = await prisma.examCategory.findUnique({
        where: { id: catId, isActive: true },
        select: { id: true, name: true, description: true },
      })
      if (!cat) return null

      const exs = await prisma.exam.findMany({
        where: {
          categoryId: catId,
          isPublished: true,
          examMode: "PRACTICE",
          examType: eType,
        },
        select: {
          id: true, name: true, year: true, round: true,
          durationMinutes: true, minTier: true,
          subjects: { select: { questionsPerAttempt: true } },
          _count: { select: { questions: true } },
        },
        orderBy: [{ year: "desc" }, { round: "asc" }],
      })
      return { category: cat, exams: exs }
    },
    [`category-${id}-${examType}`],
    { revalidate: 60 }
  )

  const data = await getData(id, dbExamType)
  if (!data) notFound()

  const { category, exams } = data
  const typeLabel = EXAM_TYPE_LABEL[examType]

  const examList: ExamItem[] = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    year: exam.year,
    round: exam.round,
    duration_minutes: exam.durationMinutes,
    min_tier: exam.minTier,
    total_questions: exam._count.questions,
    questions_per_attempt: exam.subjects.reduce(
      (sum, s) => sum + s.questionsPerAttempt,
      0
    ),
  }))

  // 년도별 그룹핑
  const examsByYear = new Map<number, ExamItem[]>()
  const noYearExams: ExamItem[] = []

  for (const exam of examList) {
    if (exam.year) {
      const yearExams = examsByYear.get(exam.year) || []
      yearExams.push(exam)
      examsByYear.set(exam.year, yearExams)
    } else {
      noYearExams.push(exam)
    }
  }

  const sortedYears = Array.from(examsByYear.keys()).sort((a, b) => b - a)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/category/${category.id}`}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {category.name}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {category.name} {typeLabel}
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            총 {examList.length}개 시험
          </p>
        </div>

        {examList.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              아직 등록된 {typeLabel} 시험이 없습니다
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              관리자가 시험을 추가하면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 년도 없는 시험 */}
            {noYearExams.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {noYearExams.map((exam, idx) => (
                    <ExamCard key={exam.id} exam={exam} categoryName={category.name} colorIndex={idx} />
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
                        categoryName={category.name}
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
  categoryName,
  colorIndex,
}: {
  exam: ExamItem
  categoryName: string
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
      {hasQuestions && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
      )}

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
            hasQuestions ? "bg-white/20" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          {exam.duration_minutes}분
        </span>
      </div>

      <h3 className="font-bold text-sm sm:text-base mb-1">
        {exam.year ? `${categoryName} ${exam.year}년 ${exam.round}회` : exam.name}
      </h3>

      <p
        className={`text-xs mb-3 ${
          hasQuestions ? "text-white/70" : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {hasQuestions ? `${exam.questions_per_attempt}문항 출제` : "준비 중"}
      </p>

      {hasQuestions ? (
        <div className="flex items-center text-xs font-medium text-white/90">
          시험 응시하기
          <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      ) : (
        <div className="text-xs">문제 등록 대기</div>
      )}
    </div>
  )

  if (!hasQuestions) return cardContent

  return (
    <Link href={`/exam/${exam.id}`} className="block">
      {cardContent}
    </Link>
  )
}
