'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TIER_LABELS, hasTierAccess } from '@/lib/tier'

interface ExamData {
  id: number
  name: string
  exam_mode: string
  exam_type: string
  duration_minutes: number
  is_published: boolean
  sort_order: number
  min_tier: string
}

interface SubjectData {
  id: number
  exam_id: number
  name: string
  questions_per_attempt: number
  order_no: number
}

interface ExamStartClientProps {
  examId: string
  exam: ExamData
  subjects: SubjectData[]
  officialQuestionCount: number
}

export default function ExamStartClient({
  examId,
  exam,
  subjects,
  officialQuestionCount,
}: ExamStartClientProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [showTierPopup, setShowTierPopup] = useState(false)

  // 홈/취소 prefetch
  useEffect(() => {
    router.prefetch('/')
  }, [router])

  // OFFICIAL 시험용 상태
  const [password, setPassword] = useState('')

  const isOfficial = exam.exam_mode === 'OFFICIAL'
  const userTier = session?.user?.tier || 'FREE'
  const userIsAdmin = session?.user?.isAdmin || false
  const examMinTier = exam.min_tier || 'FREE'
  const canAccess = userIsAdmin || hasTierAccess(userTier, examMinTier)
  const durationMinutes = exam.duration_minutes || 60
  const totalQuestions = isOfficial
    ? officialQuestionCount
    : subjects.reduce((sum, s) => sum + s.questions_per_attempt, 0)

  const handleStart = async () => {
    setStarting(true)
    setError('')

    // 브라우저에 paint 기회를 줘서 "시작 중..." 즉시 표시
    await new Promise(resolve => setTimeout(resolve, 0))

    try {
      const body: any = {
        exam_id: parseInt(examId),
      }

      // OFFICIAL 모드일 때 비밀번호 포함
      if (isOfficial) {
        if (!password) {
          setError('비밀번호를 입력해주세요')
          setStarting(false)
          return
        }
        body.password = password
      }

      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '시험 시작에 실패했습니다')
        setStarting(false)
        return
      }

      // 시험 화면으로 이동
      router.push(`/exam/attempt/${data.attempt_id}`)
    } catch (err) {
      setError('오류가 발생했습니다')
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-2 dark:text-white flex items-center justify-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              exam.exam_type === 'PRACTICAL'
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            }`}>
              {exam.exam_type === 'PRACTICAL' ? '실기' : '필기'}
            </span>
            {exam.name}
          </h1>
          {isOfficial ? (
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-sm font-semibold">
                공식 시험
              </span>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 mb-8">모의고사</p>
          )}

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4 dark:text-white">시험 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">총 문항 수:</span>
                  <span className="font-semibold dark:text-gray-200">{totalQuestions}문항</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">시험 시간:</span>
                  <span className="font-semibold dark:text-gray-200">{durationMinutes}분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">합격 기준:</span>
                  <span className="font-semibold dark:text-gray-200">60점 이상</span>
                </div>
              </div>
            </div>

            {/* 과목 구성 (공식 시험은 1과목이므로 숨김) */}
            {!isOfficial && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border dark:border-gray-600">
                <h2 className="font-bold text-lg mb-4 dark:text-white">과목 구성</h2>
                <div className="space-y-2">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">
                        {index + 1}. {subject.name}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">{subject.questions_per_attempt}문항</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-3 dark:text-white">주의사항</h2>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 시험 시작 후 {durationMinutes}분 이내에 제출해야 합니다</li>
                <li>• 시간이 초과되면 자동으로 만료됩니다</li>
                <li>• 시험을 중단하면 기록이 삭제됩니다</li>
              </ul>
            </div>

            {/* 공식 시험: 비밀번호 입력 */}
            {isOfficial && (
              <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
                <h2 className="font-bold text-lg mb-3 dark:text-white">시험 비밀번호</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  시험 감독관이 안내한 비밀번호를 입력하세요.
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              취소
            </Link>
            <button
              onClick={() => {
                if (!canAccess) {
                  setShowTierPopup(true)
                  return
                }
                handleStart()
              }}
              disabled={starting}
              className="flex-1 px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? '시작 중...' : '시험 시작'}
            </button>
          </div>
        </div>
      </div>

      {/* 등급 부족 팝업 */}
      {showTierPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full p-6 border dark:border-gray-700">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
                <svg className="w-7 h-7 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-6V4m0 0L8 8m4-4l4 4" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 dark:text-white">등급을 올려주세요</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                이 시험은 <span className="font-semibold text-blue-600 dark:text-blue-400">{TIER_LABELS[examMinTier] || examMinTier}</span> 등급 이상만 응시할 수 있습니다.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                현재 등급: <span className="font-medium">{TIER_LABELS[userTier] || userTier}</span>
              </p>
              <button
                onClick={() => setShowTierPopup(false)}
                className="w-full px-4 py-2.5 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 text-sm font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
