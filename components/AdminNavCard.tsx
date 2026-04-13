'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface AdminNavCardProps {
  href: string
  icon: string
  title: string
  description: string
  iconBg: string
}

export default function AdminNavCard({ href, icon, title, description, iconBg }: AdminNavCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isPending) return
    startTransition(() => {
      router.push(href)
    })
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-disabled={isPending}
      className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border dark:border-gray-700 ${
        isPending ? 'pointer-events-none opacity-70' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
          {isPending ? (
            <svg className="w-6 h-6 animate-spin text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>
        <div>
          <h3 className="font-bold text-lg dark:text-white">
            {isPending ? '이동 중...' : title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </a>
  )
}
