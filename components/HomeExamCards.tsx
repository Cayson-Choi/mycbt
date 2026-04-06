'use client'

import Link from "next/link"

const grades = [
  { id: 'technician', label: '기능사', sub: '전기·승강기·위험물·가스', count: 4 },
  { id: 'industrial', label: '산업기사', sub: '전기·소방·에너지·공조냉동·산업안전', count: 6 },
  { id: 'engineer', label: '기사', sub: '전기·소방·가스', count: 4 },
  { id: 'master', label: '기능장', sub: '전기기능장', count: 1 },
  { id: 'public', label: '공기업', sub: '한전·한수원 등', count: 0 },
  { id: 'ncs', label: '과정평가형', sub: 'NCS 기반 과정평가', count: 0 },
]

export default function HomeExamCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {grades.map((g) => {
        const isReady = g.count > 0
        return (
          <Link
            key={g.id}
            href={isReady ? `/grade/${g.id}` : '#'}
            className={`relative border rounded-xl p-5 sm:p-6 transition-all group
              ${isReady
                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md'
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 cursor-default opacity-60'
              }`}
            onClick={isReady ? undefined : (e) => e.preventDefault()}
          >
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              {g.label}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              {g.sub}
            </p>
            <div className="flex items-center justify-between">
              {isReady ? (
                <>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {g.count}개 자격증
                  </span>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">준비중</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
