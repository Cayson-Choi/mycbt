export default function ExamLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="flex gap-3 mt-8">
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
