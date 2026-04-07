'use client'

import Link from "next/link"

const grades = [
  { id: 'technician', label: '기능사', sub: '', count: 4, accent: 'emerald' },
  { id: 'industrial', label: '산업기사', sub: '', count: 6, accent: 'violet' },
  { id: 'engineer', label: '기사', sub: '', count: 4, accent: 'blue' },
  { id: 'master', label: '기능장', sub: '', count: 1, accent: 'amber' },
  { id: 'public', label: '공기업', sub: '', count: 0, accent: 'cyan' },
  { id: 'ncs', label: '과정평가형', sub: '', count: 0, accent: 'rose' },
]

const styles: Record<string, { bg: string; border: string; hover: string; dot: string; badge: string; title: string }> = {
  emerald: {
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/30',
    hover: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20',
    dot: 'bg-emerald-400',
    badge: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40',
    title: 'group-hover:text-emerald-700 dark:group-hover:text-emerald-300',
  },
  violet: {
    bg: 'bg-violet-50/70 dark:bg-violet-950/20',
    border: 'border-violet-200/60 dark:border-violet-800/30',
    hover: 'hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20',
    dot: 'bg-violet-400',
    badge: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40',
    title: 'group-hover:text-violet-700 dark:group-hover:text-violet-300',
  },
  blue: {
    bg: 'bg-blue-50/70 dark:bg-blue-950/20',
    border: 'border-blue-200/60 dark:border-blue-800/30',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-blue-100/50 dark:hover:shadow-blue-900/20',
    dot: 'bg-blue-400',
    badge: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40',
    title: 'group-hover:text-blue-700 dark:group-hover:text-blue-300',
  },
  amber: {
    bg: 'bg-amber-50/70 dark:bg-amber-950/20',
    border: 'border-amber-200/60 dark:border-amber-800/30',
    hover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-amber-100/50 dark:hover:shadow-amber-900/20',
    dot: 'bg-amber-400',
    badge: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40',
    title: 'group-hover:text-amber-700 dark:group-hover:text-amber-300',
  },
  cyan: {
    bg: 'bg-cyan-50/70 dark:bg-cyan-950/20',
    border: 'border-cyan-200/60 dark:border-cyan-800/30',
    hover: 'hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-cyan-100/50 dark:hover:shadow-cyan-900/20',
    dot: 'bg-cyan-400',
    badge: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/40',
    title: 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300',
  },
  rose: {
    bg: 'bg-rose-50/70 dark:bg-rose-950/20',
    border: 'border-rose-200/60 dark:border-rose-800/30',
    hover: 'hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-rose-100/50 dark:hover:shadow-rose-900/20',
    dot: 'bg-rose-400',
    badge: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/40',
    title: 'group-hover:text-rose-700 dark:group-hover:text-rose-300',
  },
}

export default function HomeExamCards() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {grades.map((g) => {
        const isReady = g.count > 0
        const s = styles[g.accent]
        return (
          <Link
            key={g.id}
            href={isReady ? `/grade/${g.id}` : '#'}
            className={`relative border rounded-2xl p-5 sm:p-6 transition-all group overflow-hidden
              ${isReady
                ? `${s.bg} ${s.border} ${s.hover} hover:shadow-lg hover:-translate-y-0.5`
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-800 cursor-default opacity-50'
              }`}
            onClick={isReady ? undefined : (e) => e.preventDefault()}
          >
            {/* 장식 원 */}
            <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full ${isReady ? s.dot : 'bg-gray-300 dark:bg-gray-700'} opacity-[0.07]`} />

            {/* 상단 도트 */}
            <div className={`w-2 h-2 rounded-full mb-3 ${isReady ? s.dot : 'bg-gray-300 dark:bg-gray-600'}`} />

            <h3 className={`text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 transition-colors ${isReady ? s.title : ''}`}>
              {g.label}
            </h3>
            {g.sub && (
              <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                {g.sub}
              </p>
            )}
            {!g.sub && <div className="mb-3" />}
            <div className="flex items-center justify-between">
              {isReady ? (
                <>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.badge}`}>
                    {g.count}개 자격증
                  </span>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              ) : (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">준비중</span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
