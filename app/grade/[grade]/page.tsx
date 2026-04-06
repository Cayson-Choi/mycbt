import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const revalidate = 60

const gradeMap: Record<string, { dbGrade: string; title: string; description: string }> = {
  technician: { dbGrade: '기능사', title: '기능사', description: '자격증 취득의 첫 걸음, 기초부터 탄탄하게' },
  industrial: { dbGrade: '산업기사', title: '산업기사', description: '전문 기술인의 시작, 산업 현장의 핵심 인력' },
  engineer: { dbGrade: '기사', title: '기사', description: '엔지니어의 필수 자격, 전문성을 증명하세요' },
  master: { dbGrade: '기능장', title: '기능장', description: '최고 등급 자격증에 도전하세요' },
}

export async function generateStaticParams() {
  return Object.keys(gradeMap).map((grade) => ({ grade }))
}

const getCategoriesByGrade = unstable_cache(
  async (dbGrade: string) => {
    return prisma.examCategory.findMany({
      where: { grade: dbGrade, isActive: true },
      include: {
        exams: {
          where: { isPublished: true, examMode: "PRACTICE" },
          select: { id: true, examType: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    })
  },
  ["grade-categories"],
  { revalidate: 60 }
)

export default async function GradePage({
  params,
}: {
  params: Promise<{ grade: string }>
}) {
  const { grade } = await params
  const info = gradeMap[grade]

  if (!info) {
    notFound()
  }

  const categories = await getCategoriesByGrade(info.dbGrade)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-10">
          <Link
            href="/#exams"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {info.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
            {info.description}
          </p>
        </div>

        {/* 자격증 카드 그리드 */}
        <div className={`grid gap-4 sm:gap-5 ${
          categories.length <= 2
            ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
            : categories.length <= 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}>
          {categories.map((cat) => {
            const writtenCount = cat.exams.filter((e) => e.examType === "WRITTEN").length
            const practicalCount = cat.exams.filter((e) => e.examType === "PRACTICAL").length
            const hasExams = cat.exams.length > 0

            return (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 transition-all hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md group"
              >
                {/* 배지 */}
                <div className="flex items-center gap-1.5 mb-3">
                  {hasExams ? (
                    <>
                      <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        필기 {writtenCount}
                      </span>
                      <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        실기 {practicalCount}
                      </span>
                    </>
                  ) : (
                    <span className="text-[11px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 px-2 py-0.5 rounded">
                      준비중
                    </span>
                  )}
                </div>

                {/* 자격증명 */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {cat.name}
                </h2>

                {/* 링크 */}
                <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {hasExams ? '시험 선택하기' : '상세 보기'}
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-16 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
            <p className="text-gray-400 dark:text-gray-500 text-sm">준비 중입니다</p>
            <p className="text-gray-300 dark:text-gray-600 text-xs mt-1">곧 서비스가 시작됩니다</p>
          </div>
        )}
      </div>
    </div>
  )
}
