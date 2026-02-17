'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ExamStartPage({ params }: { params: Promise<{ examId: string }> }) {
  const router = useRouter()
  const [examId, setExamId] = useState<string>('')
  const [exam, setExam] = useState<any>(null)
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(({ examId }) => {
      setExamId(examId)
      loadExamInfo(examId)
    })
  }, [])

  const loadExamInfo = async (id: string) => {
    try {
      // 시험 정보 조회
      const examRes = await fetch(`/api/exams/${id}`)
      if (!examRes.ok) {
        setError('시험 정보를 불러올 수 없습니다')
        setLoading(false)
        return
      }
      const examData = await examRes.json()
      setExam(examData)

      // 과목 정보 조회
      const subjectsRes = await fetch(`/api/exams/${id}/subjects`)
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json()
        setSubjects(subjectsData)
      }

      setLoading(false)
    } catch (err) {
      setError('오류가 발생했습니다')
      setLoading(false)
    }
  }

  const handleStart = async () => {
    setStarting(true)
    setError('')

    try {
      const res = await fetch('/api/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: parseInt(examId) }),
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-lg dark:text-white">로딩 중...</div>
      </div>
    )
  }

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md border dark:border-gray-700">
          <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const totalQuestions = subjects.reduce((sum, s) => sum + s.questions_per_attempt, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border dark:border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-8 dark:text-white">{exam?.name} 모의고사</h1>

          <div className="space-y-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-4 dark:text-white">📋 시험 정보</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">총 문항 수:</span>
                  <span className="font-semibold dark:text-gray-200">{totalQuestions}문항</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">시험 시간:</span>
                  <span className="font-semibold dark:text-gray-200">60분</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">합격 기준:</span>
                  <span className="font-semibold dark:text-gray-200">60점 이상</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border dark:border-gray-600">
              <h2 className="font-bold text-lg mb-4 dark:text-white">📚 과목 구성</h2>
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

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
              <h2 className="font-bold text-lg mb-3 dark:text-white">⚠️ 주의사항</h2>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• 시험 시작 후 60분 이내에 제출해야 합니다</li>
                <li>• 시간이 초과되면 자동으로 만료됩니다</li>
                <li>• 한 번에 하나의 시험만 응시할 수 있습니다</li>
                <li>• 23:00~23:59(KST)에는 새 시험을 시작할 수 없습니다</li>
                <li>• 답안은 자동으로 저장되며 재접속 시 이어풀기가 가능합니다</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              취소
            </Link>
            <button
              onClick={handleStart}
              disabled={starting}
              className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? '시작 중...' : '시험 시작'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
