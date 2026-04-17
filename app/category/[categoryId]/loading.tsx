export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 스켈레톤 */}
        <div className="mb-10">
          <div className="h-4 w-14 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
          <div className="h-5 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {/* 필기/실기 카드 스켈레톤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gray-200 dark:bg-gray-700 animate-pulse min-h-[180px]"
            >
              <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg mb-4" />
              <div className="h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded mb-2" />
              <div className="h-4 w-36 bg-gray-300 dark:bg-gray-600 rounded mb-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
