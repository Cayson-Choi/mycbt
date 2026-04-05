"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import ThemeToggle from "./ThemeToggle"

export default function Header() {
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await signOut({ callbackUrl: "/" })
  }

  const user = session?.user

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl leading-none">⚡</span>
            <span className="text-xl font-black tracking-tight animate-rainbow-text -ml-0.5">전기짱</span>
            <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 ml-1.5 font-semibold">차원이 다른 CBT</span>
          </Link>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {status === "loading" ? (
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ) : user ? (
              <>
                {/* 데스크톱 메뉴 */}
                <div className="hidden sm:flex items-center gap-3">
                  {(user as any).nickname ? (
                    <>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {(user as any).nickname}
                      </span>
                      <Link
                        href="/my"
                        className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                      >
                        마이페이지
                      </Link>
                      {(user as any).isAdmin && (
                        <Link
                          href="/admin"
                          className="text-sm text-red-600 dark:text-red-400 hover:text-red-700"
                        >
                          관리자
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {loggingOut ? "..." : "로그아웃"}
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-orange-500 dark:text-orange-400">
                      회원가입중
                    </span>
                  )}
                </div>

                {/* 모바일 햄버거 (가입 완료 시만) */}
                {(user as any).nickname && <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="sm:hidden p-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        mobileOpen
                          ? "M6 18L18 6M6 6l12 12"
                          : "M4 6h16M4 12h16M4 18h16"
                      }
                    />
                  </svg>
                </button>}
              </>
            ) : (
              <Link
                href="/login"
                className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                로그인
              </Link>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileOpen && user && (user as any).nickname && (
          <div className="sm:hidden pb-3 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 px-2">
              {(user as any).nickname}
            </p>
            <Link
              href="/my"
              className="block px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              onClick={() => setMobileOpen(false)}
            >
              마이페이지
            </Link>
            {(user as any).isAdmin && (
              <Link
                href="/admin"
                className="block px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                onClick={() => setMobileOpen(false)}
              >
                관리자
              </Link>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="block w-full text-left px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              {loggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
