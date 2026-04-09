export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* 통계 바 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-28 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="border-b dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center gap-4">
              {[80, 48, 48, 48, 64].map((w, i) => (
                <div
                  key={i}
                  className="h-4 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"
                  style={{ width: `${w}px` }}
                />
              ))}
            </div>
          </div>
          {/* 테이블 행 */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="border-b dark:border-gray-700 px-4 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
