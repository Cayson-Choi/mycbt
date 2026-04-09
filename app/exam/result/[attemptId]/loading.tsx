export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* 점수 카드 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border dark:border-gray-700">
          <div className="text-center mb-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-4" />
            <div className="h-16 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2" />
            <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto" />
          </div>

          {/* 과목별 점수 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 border dark:border-gray-600"
              >
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-2" />
                <div className="h-6 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex justify-center gap-3">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* 문제 목록 */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border dark:border-gray-700"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-11">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
