import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { getAuthUser } from '@/lib/auth'

export default async function HeaderUserNav() {
  const user = await getAuthUser()

  if (user) {
    return (
      <>
        <Link
          href="/my"
          className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          마이페이지
        </Link>
        {user.is_admin && (
          <Link
            href="/admin"
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            관리자
          </Link>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400 pl-2 border-l border-gray-200 dark:border-gray-700">
          {user.name}님
          {user.is_admin && (
            <span className="ml-1.5 text-xs bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">
              관리자
            </span>
          )}
        </span>
        <LogoutButton />
      </>
    )
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
    >
      로그인
    </Link>
  )
}
