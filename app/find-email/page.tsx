"use client"

import { useState } from "react"
import Link from "next/link"

export default function FindEmailPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [maskedEmail, setMaskedEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMaskedEmail("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/find-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다")
        return
      }
      setMaskedEmail(data.maskedEmail)
    } catch {
      setError("오류가 발생했습니다")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-0 sm:min-h-[60vh] gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">이메일 찾기</h1>
        <p className="text-gray-500 dark:text-gray-400">
          가입 시 등록한 전화번호로 이메일을 찾을 수 있습니다
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {maskedEmail ? (
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">가입된 이메일 주소</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{maskedEmail}</p>
            <div className="pt-2 space-y-2">
              <Link
                href="/login"
                className="block px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm text-center"
              >
                로그인하러 가기
              </Link>
              <button
                onClick={() => { setMaskedEmail(""); setPhone("") }}
                className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                다시 찾기
              </button>
            </div>
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
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="가입 시 등록한 전화번호 (예: 010-1234-5678)"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {loading ? "찾는 중..." : "이메일 찾기"}
              </button>
            </form>
          </>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
