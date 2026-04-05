"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다")
        return
      }
      setSent(true)
    } catch {
      setError("오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-0 sm:min-h-[60vh] gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">비밀번호 찾기</h1>
        <p className="text-gray-500 dark:text-gray-400">
          가입한 이메일 주소로 재설정 링크를 보내드립니다
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {sent ? (
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <p className="text-green-700 dark:text-green-300 font-medium text-lg mb-1">
              메일을 발송했습니다
            </p>
            <p className="text-sm text-green-600 dark:text-green-400">
              {email}로 보낸 메일의 링크를 클릭하면 비밀번호를 재설정할 수 있습니다
            </p>
            <p className="text-xs text-green-500 dark:text-green-500 mt-2">
              링크는 1시간 후 만료됩니다
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입한 이메일 주소"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? "발송 중..." : "비밀번호 재설정 링크 발송"}
              </button>
            </form>
          </>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
          <p>
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              로그인으로 돌아가기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
