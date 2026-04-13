'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ProfileFormProps {
  nickname: string
  email: string
  phone: string
}

export default function ProfileForm({ nickname, email, phone: initialPhone }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [phone, setPhone] = useState(initialPhone)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || '프로필 수정 실패')
        return
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch {
      alert('오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 아이디 (수정 불가) */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">아이디</label>
          <input
            type="text"
            value={nickname}
            disabled
            className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">아이디는 수정할 수 없습니다</p>
        </div>

        {/* 이메일 (수정 불가) */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">이메일</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-3 py-2 border dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">이메일은 수정할 수 없습니다</p>
        </div>

        {/* 전화번호 (수정 가능) */}
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">전화번호 *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="010-1234-5678"
            required
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/my"
            className="flex-1 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white text-center rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={`flex-1 px-6 py-3 text-white rounded-lg ${
              saveSuccess
                ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600'
                : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 dark:disabled:bg-blue-600'
            }`}
          >
            {saving ? '저장 중...' : saveSuccess ? '저장 완료' : '저장'}
          </button>
        </div>
      </form>
    </div>
  )
}
