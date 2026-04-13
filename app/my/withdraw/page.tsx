'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import ConfirmDialog from '@/components/ConfirmDialog'

export default function WithdrawPage() {
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')

  const handleWithdraw = async () => {
    setShowConfirm(false)
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/account/withdraw', {
        method: 'POST',
      })

      if (res.ok) {
        // JWT 세션 쿠키 제거 후 홈으로 이동
        await signOut({ callbackUrl: '/' })
        return
      } else {
        const data = await res.json()
        setError(data.error || '탈퇴 처리 실패')
      }
    } catch {
      setError('오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">회원 탈퇴</h1>
          <p className="text-gray-600 dark:text-gray-400">탈퇴 전 아래 내용을 반드시 확인해주세요</p>
        </div>

        {/* 경고 메시지 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-700 border-l-4 border-gray-500 p-4">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">주의사항</h3>
            <ul className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
              <li>- 모든 데이터는 즉시 삭제되며 복구할 수 없습니다</li>
              <li>- 탈퇴 후 동일한 계정으로 재가입은 가능하지만 기존 데이터는 복원되지 않습니다</li>
              <li>- 탈퇴 처리는 즉시 완료됩니다</li>
            </ul>
          </div>

          {/* 확인 체크박스 */}
          <div className="mt-6 pt-6 border-t dark:border-gray-600">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-5 h-5"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                위 내용을 모두 확인했으며, 탈퇴 시 모든 데이터가 삭제되는 것에 동의합니다.
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-4 mt-6">
            <Link
              href="/my"
              className="flex-1 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white text-center rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
            >
              취소
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading || !confirmed}
              className="flex-1 px-6 py-3 bg-red-600 dark:bg-red-500 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '회원 탈퇴'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="회원 탈퇴"
        message={'정말로 탈퇴하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.'}
        confirmText="탈퇴"
        confirmColor="red"
        onConfirm={handleWithdraw}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
