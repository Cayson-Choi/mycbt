export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-44 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Stats bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border dark:border-gray-700">
          <div className="flex gap-3 flex-wrap">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 w-28 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Exam question counts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-8 border dark:border-gray-700">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-50 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
        {/* Menu cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div>
                  <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
