'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SubjectScore {
  attempt_id: number
  subject_id: number
  subject_score: number
  subject_correct: number
  subject_questions: number
  subjects: { name: string }
}

interface Attempt {
  id: number
  exam_id: number
  started_at: string
  submitted_at: string | null
  total_score: number | null
  grading_status: string
  exam_name: string
  subject_scores: SubjectScore[]
}

interface ExamStat {
  exam_id: number
  exam_name: string
  attempt_count: number
  avg_score: number
  max_score: number
}

interface Props {
  attempts: Attempt[]
  examStats: ExamStat[]
}

export default function AttemptHistoryClient({ attempts, examStats }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | number>('all')

  // 마이페이지 진입 시 하위 페이지들을 미리 prefetch
  useEffect(() => {
    router.prefetch('/my/wrong-answers')
    router.prefetch('/my/profile')
    router.prefetch('/my/withdraw')
  }, [router])

  const filteredAttempts =
    filter === 'all'
      ? attempts
      : attempts.filter((a) => a.exam_id === filter)

  return (
    <>
      {/* 응시 기록 필터 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 border dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold dark:text-white">응시 기록</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded text-sm ${
                filter === 'all'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              전체
            </button>
            {examStats.map((exam) => (
              <button
                key={exam.exam_id}
                onClick={() => setFilter(exam.exam_id)}
                className={`px-4 py-2 rounded text-sm ${
                  filter === exam.exam_id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {exam.exam_name}
              </button>
            ))}
          </div>
        </div>

        {/* 응시 기록 목록 */}
        {filteredAttempts.length > 0 ? (
          <div className="space-y-4">
            {filteredAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md dark:hover:shadow-gray-700 transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-lg dark:text-white">
                      {attempt.exam_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(attempt.submitted_at!).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-3xl font-bold ${
                        attempt.grading_status === 'PENDING_MANUAL'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : (attempt.total_score ?? 0) >= 60
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {attempt.total_score}점
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        attempt.grading_status === 'PENDING_MANUAL'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : (attempt.total_score ?? 0) >= 60
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {attempt.grading_status === 'PENDING_MANUAL' ? '채점 대기' : (attempt.total_score ?? 0) >= 60 ? '합격' : '불합격'}
                    </div>
                  </div>
                </div>

                {/* 과목별 점수 */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                  {attempt.subject_scores.map((subject) => (
                    <div
                      key={subject.subject_id}
                      className="bg-gray-50 dark:bg-gray-700 rounded p-2"
                    >
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {subject.subjects?.name}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {subject.subject_score}점
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {subject.subject_correct}/{subject.subject_questions}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 버튼 */}
                <div className="flex gap-2">
                  <Link
                    href={`/exam/result/${attempt.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-center rounded hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    상세 결과 보기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 py-3 text-sm">
            응시 기록이 없습니다
          </div>
        )}
      </div>
    </>
  )
}
