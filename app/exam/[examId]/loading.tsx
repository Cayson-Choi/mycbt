export default function ExamStartLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700 animate-pulse">
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8" />
          {/* Exam info box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
            <div className="h-5 w-24 bg-blue-200 dark:bg-blue-800 rounded mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-20 bg-blue-100 dark:bg-blue-800/50 rounded" />
                  <div className="h-4 w-16 bg-blue-100 dark:bg-blue-800/50 rounded" />
                </div>
              ))}
            </div>
          </div>
          {/* Notice box */}
          <div className="h-28 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-8" />
          {/* Buttons */}
          <div className="flex gap-3">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg" />
            <div className="flex-1 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
