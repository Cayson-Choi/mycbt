export default function HomeLoading() {
  return (
    <div>
      {/* Hero + Leaderboard skeleton */}
      <section className="relative bg-black min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-4 py-12">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mx-auto mb-4" />
          <div className="h-4 w-64 bg-gray-800 rounded animate-pulse mx-auto mb-8" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>

      {/* Exam cards skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 animate-pulse">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
