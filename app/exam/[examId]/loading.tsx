export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          {/* 시험 제목 */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex justify-center mb-8">
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* 시험 정보 박스 */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-6">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 과목 구성 박스 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 border dark:border-gray-600">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-600 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-gray-200 dark:bg-gray-600 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
