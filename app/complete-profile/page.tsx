"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CompleteProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [phone, setPhone] = useState("")
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
    if (status === "authenticated" && session?.user?.phone) {
      // 이미 전화번호가 있으면 홈으로
      router.push("/")
    }
  }, [status, session, router])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11)
    let formatted = digits
    if (digits.length > 3 && digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
    } else if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    }
    setPhone(formatted)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const phoneValue = formData.get("phone") as string

    if (!name?.trim() || !phoneValue?.trim()) {
      setError("모든 항목을 입력해주세요")
      setSubmitting(false)
      return
    }

    if (!/^010-\d{4}-\d{4}$/.test(phoneValue.trim())) {
      setError("전화번호는 010-xxxx-xxxx 형식으로 입력해주세요")
      setSubmitting(false)
      return
    }

    if (!agreed) {
      setError("개인정보 수집 및 이용에 동의해주세요")
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phoneValue.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "프로필 생성에 실패했습니다")
        setSubmitting(false)
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("오류가 발생했습니다")
      setSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg dark:text-white">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">추가정보기입</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">
          서비스 이용을 위해 추가 정보를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-gray-200">
              이름
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={session?.user?.name || ""}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1 dark:text-gray-200">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              placeholder="010-1234-5678"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={13}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="privacy" className="text-sm dark:text-gray-200 cursor-pointer">
                <span className="font-semibold text-blue-600 dark:text-blue-400">[필수]</span>{" "}
                <span className="font-medium">개인정보 수집 및 이용 동의</span>
                <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400 list-disc list-inside">
                  <li>수집 항목: 이름, 전화번호</li>
                  <li>수집 목적: 본 서비스 이용 및 본인 식별</li>
                  <li>보유 기간: 회원 탈퇴 시까지</li>
                  <li>수집된 개인정보는 제3자에게 제공되지 않습니다.</li>
                  <li>동의를 거부할 권리가 있으며, 거부 시 서비스 이용이 제한됩니다.</li>
                </ul>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !agreed}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "처리 중..." : "가입 완료"}
          </button>
        </form>
      </div>
    </div>
  )
}
