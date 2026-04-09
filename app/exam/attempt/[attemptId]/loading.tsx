export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 상단 타이머 바 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* 문제 영역 */}
      <div className="max-w-5xl mx-auto px-4 py-8 pt-24">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700"
            >
              {/* 문제 번호 + 텍스트 */}
              <div className="flex items-start gap-3 mb-4">
                <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>

              {/* 보기 4개 */}
              <div className="space-y-2 ml-11">
                {[...Array(4)].map((_, j) => (
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
    </div>
  )
}
