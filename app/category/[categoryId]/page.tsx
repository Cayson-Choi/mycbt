import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export const revalidate = 60

// 등급명 → URL 슬러그 + 표시명 매핑
const GRADE_TO_SLUG: Record<string, { slug: string; label: string }> = {
  "진단평가": { slug: "basic", label: "진단평가" },
  "기능사": { slug: "technician", label: "기능사" },
  "산업기사": { slug: "industrial", label: "산업기사" },
  "기사": { slug: "engineer", label: "기사" },
  "기능장": { slug: "master", label: "기능장" },
  "기타": { slug: "etc", label: "공식시험" },
}

export async function generateStaticParams() {
  const categories = await prisma.examCategory.findMany({
    where: { isActive: true },
    select: { id: true },
  })
  return categories.map((c) => ({ categoryId: String(c.id) }))
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>
}) {
  const { categoryId } = await params
  const id = parseInt(categoryId)

  if (isNaN(id)) {
    notFound()
  }

  const getCategoryData = unstable_cache(
    async (catId: number) => {
      const cat = await prisma.examCategory.findUnique({
        where: { id: catId, isActive: true },
        select: { id: true, name: true, description: true, grade: true },
      })
      if (!cat) return null

      const [writtenCount, practicalCount] = await Promise.all([
        prisma.exam.count({
          where: { categoryId: catId, isPublished: true, examType: "WRITTEN" },
        }),
        prisma.exam.count({
          where: { categoryId: catId, isPublished: true, examType: "PRACTICAL" },
        }),
      ])

      return { category: cat, writtenCount, practicalCount }
    },
    [`category-${id}`],
    { revalidate: 60 }
  )

  const data = await getCategoryData(id)
  if (!data) notFound()

  const { category, writtenCount, practicalCount } = data
  const gradeKey = category.grade || "기타"
  const gradeInfo = GRADE_TO_SLUG[gradeKey] || { slug: "etc", label: gradeKey }

  const examTypes = [
    {
      type: "written",
      label: "필기",
      description: "객관식 CBT 모의고사",
      count: writtenCount,
      gradient: "from-blue-500 to-indigo-600",
      hoverGradient: "hover:shadow-blue-500/25",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      type: "practical",
      label: "실기",
      description: "실기 필답형 모의고사",
      count: practicalCount,
      gradient: "from-emerald-500 to-teal-600",
      hoverGradient: "hover:shadow-emerald-500/25",
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤�� */}
        <div className="mb-10">
          <Link
            href={`/grade/${gradeInfo.slug}`}
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {gradeInfo.label}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-gray-500 dark:text-gray-400 mt-1">{category.description}</p>
          )}
        </div>

        {/* 필기/실기 선택 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {examTypes.map((et) => {
            const hasExams = et.count > 0

            const cardContent = (
              <div
                className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all ${
                  hasExams
                    ? `bg-gradient-to-br ${et.gradient} text-white shadow-lg hover:shadow-2xl ${et.hoverGradient} hover:-translate-y-1 cursor-pointer`
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700"
                }`}
              >
                {/* 배경 장식 */}
                {hasExams && (
                  <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full" />
                    <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
                  </>
                )}

                <div className="relative">
                  <div className={`mb-4 ${hasExams ? "text-white/90" : "text-gray-300 dark:text-gray-600"}`}>
                    {et.icon}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">{et.label}</h2>
                  <p className={`text-sm mb-4 ${hasExams ? "text-white/70" : ""}`}>
                    {et.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${hasExams ? "text-white/80" : ""}`}>
                      {hasExams ? `${et.count}개 시험` : "준비 중"}
                    </span>
                    {hasExams && (
                      <div className="flex items-center text-sm font-medium text-white/90">
                        입장하기
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )

            if (!hasExams) return <div key={et.type}>{cardContent}</div>

            return (
              <Link key={et.type} href={`/category/${category.id}/${et.type}`} className="block">
                {cardContent}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
