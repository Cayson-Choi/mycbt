export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* 필터 바 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
          <div className="flex items-center gap-3 flex-wrap">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-9 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* 오답 카드 목록 */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border dark:border-gray-700"
            >
              {/* 과목 태그 + 문제번호 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              {/* 문제 텍스트 */}
              <div className="space-y-2 mb-4">
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              {/* 답 표시 */}
              <div className="flex items-center gap-4">
                <div className="h-6 w-24 bg-red-100 dark:bg-red-900/30 rounded animate-pulse" />
                <div className="h-6 w-24 bg-green-100 dark:bg-green-900/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
