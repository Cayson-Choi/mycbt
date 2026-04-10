'use client'

export default function AdminLoadingPopup({ show }: { show: boolean }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl px-6 py-4 flex items-center gap-3 border dark:border-gray-700">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">불러오는 중...</span>
      </div>
    </div>
  )
}
