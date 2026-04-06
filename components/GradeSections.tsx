'use client'

import Link from 'next/link'

interface CategoryInfo {
  id: number
  name: string
  examCount: number
  writtenCount: number
  practicalCount: number
}

interface GradeGroup {
  grade: string
  color: string
  icon: string
  description: string
  categories: CategoryInfo[]
}

const colorMap: Record<string, {
  banner: string
  bannerHover: string
  badge: string
  card: string
  cardBorder: string
  cardHoverBorder: string
  text: string
  lightBg: string
  iconBg: string
}> = {
  emerald: {
    banner: 'from-emerald-600 to-teal-700',
    bannerHover: 'hover:from-emerald-500 hover:to-teal-600',
    badge: 'bg-emerald-400/20 text-emerald-300',
    card: 'bg-emerald-50 dark:bg-emerald-950/30',
    cardBorder: 'border-emerald-200 dark:border-emerald-800/50',
    cardHoverBorder: 'hover:border-emerald-400 dark:hover:border-emerald-600',
    text: 'text-emerald-600 dark:text-emerald-400',
    lightBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconBg: 'bg-emerald-500/10',
  },
  violet: {
    banner: 'from-violet-600 to-purple-700',
    bannerHover: 'hover:from-violet-500 hover:to-purple-600',
    badge: 'bg-violet-400/20 text-violet-300',
    card: 'bg-violet-50 dark:bg-violet-950/30',
    cardBorder: 'border-violet-200 dark:border-violet-800/50',
    cardHoverBorder: 'hover:border-violet-400 dark:hover:border-violet-600',
    text: 'text-violet-600 dark:text-violet-400',
    lightBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconBg: 'bg-violet-500/10',
  },
  blue: {
    banner: 'from-blue-600 to-indigo-700',
    bannerHover: 'hover:from-blue-500 hover:to-indigo-600',
    badge: 'bg-blue-400/20 text-blue-300',
    card: 'bg-blue-50 dark:bg-blue-950/30',
    cardBorder: 'border-blue-200 dark:border-blue-800/50',
    cardHoverBorder: 'hover:border-blue-400 dark:hover:border-blue-600',
    text: 'text-blue-600 dark:text-blue-400',
    lightBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconBg: 'bg-blue-500/10',
  },
  amber: {
    banner: 'from-amber-600 to-orange-700',
    bannerHover: 'hover:from-amber-500 hover:to-orange-600',
    badge: 'bg-amber-400/20 text-amber-300',
    card: 'bg-amber-50 dark:bg-amber-950/30',
    cardBorder: 'border-amber-200 dark:border-amber-800/50',
    cardHoverBorder: 'hover:border-amber-400 dark:hover:border-amber-600',
    text: 'text-amber-600 dark:text-amber-400',
    lightBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconBg: 'bg-amber-500/10',
  },
  cyan: {
    banner: 'from-cyan-600 to-sky-700',
    bannerHover: 'hover:from-cyan-500 hover:to-sky-600',
    badge: 'bg-cyan-400/20 text-cyan-300',
    card: 'bg-cyan-50 dark:bg-cyan-950/30',
    cardBorder: 'border-cyan-200 dark:border-cyan-800/50',
    cardHoverBorder: 'hover:border-cyan-400 dark:hover:border-cyan-600',
    text: 'text-cyan-600 dark:text-cyan-400',
    lightBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconBg: 'bg-cyan-500/10',
  },
}

export default function GradeSections({ grades }: { grades: GradeGroup[] }) {
  return (
    <div>
      {/* ===== 등급 배너 카드 5개 ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-10 sm:mb-14">
        {grades.map((g) => {
          const c = colorMap[g.color] || colorMap.blue
          return (
            <a
              key={g.grade}
              href={`#grade-${g.grade}`}
              className={`bg-gradient-to-br ${c.banner} ${c.bannerHover} rounded-2xl p-4 sm:p-5 text-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 group relative overflow-hidden`}
            >
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/[0.07] rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/[0.05] rounded-full" />
              <div className="relative">
                <span className="text-2xl sm:text-3xl mb-2 block">{g.icon}</span>
                <h3 className="text-lg sm:text-xl font-black mb-0.5">{g.grade}</h3>
                <p className="text-[11px] sm:text-xs text-white/60 mb-2">{g.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] sm:text-xs font-bold ${c.badge} px-2 py-0.5 rounded-full`}>
                    {g.categories.length}개 자격증
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* ===== 등급별 자격증 목록 ===== */}
      {grades.map((g) => {
        const c = colorMap[g.color] || colorMap.blue
        if (g.categories.length === 0 && g.grade === '공기업') {
          return (
            <section key={g.grade} id={`grade-${g.grade}`} className="mb-10 sm:mb-14 scroll-mt-20">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{g.icon}</span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{g.grade}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{g.description}</p>
                </div>
              </div>
              <div className={`${c.card} border ${c.cardBorder} rounded-2xl p-8 text-center`}>
                <span className="text-4xl mb-3 block">🚧</span>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">준비 중입니다</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">곧 서비스가 시작됩니다</p>
              </div>
            </section>
          )
        }

        return (
          <section key={g.grade} id={`grade-${g.grade}`} className="mb-10 sm:mb-14 scroll-mt-20">
            {/* 등급 헤더 */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{g.icon}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{g.grade}</h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{g.description}</p>
              </div>
              <span className={`ml-auto text-xs font-bold ${c.text} ${c.lightBg} px-3 py-1 rounded-full`}>
                {g.categories.length}개 자격증
              </span>
            </div>

            {/* 자격증 카드 그리드 */}
            <div className={`grid gap-3 sm:gap-4 ${
              g.categories.length <= 2
                ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl'
                : g.categories.length <= 4
                  ? 'grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
            }`}>
              {g.categories.map((cat) => {
                const hasExams = cat.examCount > 0
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.id}`}
                    className={`border ${c.cardBorder} ${c.cardHoverBorder} ${c.card} rounded-xl p-4 sm:p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 group relative overflow-hidden`}
                  >
                    {/* 배경 장식 */}
                    <div className={`absolute top-0 right-0 w-20 h-20 ${c.iconBg} rounded-full -translate-y-1/2 translate-x-1/2`} />

                    <div className="relative">
                      {/* 배지 */}
                      <div className="flex items-center gap-1.5 mb-2">
                        {hasExams ? (
                          <>
                            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                              필기 {cat.writtenCount}
                            </span>
                            <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                              실기 {cat.practicalCount}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded">
                            준비중
                          </span>
                        )}
                      </div>

                      {/* 자격증명 */}
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {cat.name}
                      </h3>

                      {/* 입장하기 */}
                      <div className={`flex items-center text-xs font-medium ${c.text} group-hover:gap-1.5 transition-all`}>
                        {hasExams ? '시험 보기' : '상세 보기'}
                        <svg className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
