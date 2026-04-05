"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setError("유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호와 확인 비밀번호가 일치하지 않습니다")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다")
        return
      }
      setSuccess(true)
    } catch {
      setError("오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-0 sm:min-h-[60vh] gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">비밀번호 재설정</h1>
        <p className="text-gray-500 dark:text-gray-400">
          새 비밀번호를 입력해주세요
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {success ? (
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg space-y-3">
            <p className="text-green-700 dark:text-green-300 font-medium text-lg">
              비밀번호가 변경되었습니다
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
            >
              로그인하러 가기
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            {token && (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (6자 이상)"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </form>
            )}

            {!token && (
              <div className="text-center">
                <Link
                  href="/forgot-password"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  비밀번호 재설정 다시 요청하기
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
