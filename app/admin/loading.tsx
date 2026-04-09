export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* 통계 바 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-32 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 시험별 문제 현황 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="ml-4 space-y-2">
                  {[...Array(2)].map((_, j) => (
                    <div
                      key={j}
                      className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700"
            >
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse mb-3" />
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
