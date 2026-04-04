"use client"

import Link from "next/link"

interface CategoryCard {
  id: number
  name: string
  description: string | null
  examCount: number
}

const cardStyles = [
  { gradient: "from-blue-500 to-indigo-600", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { gradient: "from-emerald-500 to-teal-600", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { gradient: "from-amber-500 to-orange-600", icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { gradient: "from-rose-500 to-pink-600", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
]

const floatClasses = [
  "float-animation",
  "float-animation-delay",
  "float-animation-delay2",
]

export default function ExamCards({
  categories,
}: {
  categories: CategoryCard[]
}) {
  return (
    <div
      className={`grid gap-4 sm:gap-6 max-w-5xl mx-auto ${
        categories.length <= 3
          ? "grid-cols-1 sm:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {categories.map((cat, index) => {
        const style = cardStyles[index % cardStyles.length]
        return (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className={`bg-gradient-to-br ${style.gradient} rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1.5 ${floatClasses[index % floatClasses.length]} group relative overflow-hidden`}
          >
            {/* 배경 장식 */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full" />

            {/* 아이콘 */}
            <div className="relative mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={style.icon}
                  />
                </svg>
              </div>
            </div>

            {/* 내용 */}
            <div className="relative">
              <h3 className="text-lg sm:text-xl font-bold mb-1">
                {cat.name}
              </h3>
              {cat.description && (
                <p className="text-sm text-white/70 mb-3 line-clamp-2">
                  {cat.description}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">
                  {cat.examCount > 0
                    ? `${cat.examCount}개 시험`
                    : "준비 중"}
                </span>
                <div className="flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                  입장하기
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
