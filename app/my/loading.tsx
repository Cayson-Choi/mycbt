export default function MyPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Stats bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border dark:border-gray-700">
          <div className="flex gap-3 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Exam stats grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border dark:border-gray-700">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border dark:border-gray-600 rounded-lg p-4">
                <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded" />
                  <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Attempt list */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border dark:border-gray-700">
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border dark:border-gray-600 rounded-lg p-4 mb-3">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
