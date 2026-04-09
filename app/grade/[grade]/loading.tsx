export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 뒤로가기 + 헤더 */}
        <div className="mb-8 sm:mb-10">
          <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* 카테고리 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 animate-pulse"
            >
              {/* 배지 */}
              <div className="flex items-center gap-1.5 mb-3">
                <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700 rounded" />
                <div className="h-5 w-14 bg-gray-100 dark:bg-gray-700 rounded" />
              </div>
              {/* 자격증명 */}
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              {/* 링크 텍스트 */}
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
