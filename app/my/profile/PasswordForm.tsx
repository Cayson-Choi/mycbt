'use client'

import { useState } from 'react'

interface PasswordFormProps {
  hasPassword: boolean
}

export default function PasswordForm({ hasPassword }: PasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (newPassword.length < 6) {
      setError('새 비밀번호는 6자 이상이어야 합니다')
      return
    }
    if (!confirmPassword) {
      setError('비밀번호 확인을 입력해주세요')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('새 비밀번호와 확인 비밀번호가 일치하지 않습니다')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: hasPassword ? currentPassword : undefined,
          newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '비밀번호 변경 실패')
        return
      }
      setSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">비밀번호 변경</h2>

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm text-green-700 dark:text-green-300">
          비밀번호가 변경되었습니다
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {hasPassword && (
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-200">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="현재 비밀번호 입력"
            />
          </div>
        )}

        {!hasPassword && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            소셜 로그인 계정입니다. 비밀번호를 새로 설정할 수 있습니다.
          </p>
        )}

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="새 비밀번호 (6자 이상)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-200">새 비밀번호 확인</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="새 비밀번호 다시 입력"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`w-full px-6 py-3 text-white rounded-lg transition-colors ${
              success
                ? 'bg-green-600 dark:bg-green-500'
                : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50'
            }`}
          >
            {saving ? '변경 중...' : success ? '변경 완료' : '비밀번호 변경'}
          </button>
        </div>
      </form>
    </div>
  )
}
