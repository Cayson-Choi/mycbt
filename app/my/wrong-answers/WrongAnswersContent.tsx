'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MathText from '@/components/MathText'

interface SubjectStat {
  subject_id: number
  subject_name: string
  count: number
}

interface WrongAnswer {
  attempt_id: number
  attempt_date: string
  exam_id: number
  exam_name: string
  exam_type: string
  subject_id: number
  subject_name: string
  question_id: number
  question_code: string
  question_text: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
  choice_1_image: string | null
  choice_2_image: string | null
  choice_3_image: string | null
  choice_4_image: string | null
  correct_answer: number
  student_answer: number
  explanation: string | null
}

interface WrongAnswersData {
  wrong_answers: WrongAnswer[]
  total_count: number
  subject_stats: SubjectStat[]
}

export default function WrongAnswersContent({ data }: { data: WrongAnswersData }) {
  const router = useRouter()
  const [filter, setFilter] = useState<'all' | number>('all')

  useEffect(() => {
    router.prefetch('/my')
    router.prefetch('/')
  }, [router])

  const filteredAnswers =
    filter === 'all'
      ? data.wrong_answers
      : data.wrong_answers.filter((a) => a.subject_id === filter)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">오답노트</h1>
          <p className="text-gray-600 dark:text-gray-400">
            틀린 문제를 복습하고 약점을 보완하세요
          </p>
        </div>

        {/* 통계 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-4 dark:text-white">오답 통계</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border dark:border-gray-600 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">총 오답 문제</div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {data.total_count}문제
              </div>
            </div>
            <div className="border dark:border-gray-600 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">과목별 오답</div>
              <div className="space-y-1">
                {(data.subject_stats || []).map((stat) => (
                  <div key={stat.subject_id} className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{stat.subject_name}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {stat.count}문제
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 과목 필터 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold dark:text-white">과목 필터:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all'
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              전체 ({data.total_count || 0})
            </button>
            {(data.subject_stats || []).map((stat) => (
              <button
                key={stat.subject_id}
                onClick={() => setFilter(stat.subject_id)}
                className={`px-4 py-2 rounded ${
                  filter === stat.subject_id
                    ? 'bg-blue-600 dark:bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {stat.subject_name} ({stat.count})
              </button>
            ))}
          </div>
        </div>

        {/* 오답 문제 목록 */}
        {filteredAnswers.length > 0 ? (
          <div className="space-y-6">
            {filteredAnswers.map((item, index) => (
              <div
                key={`${item.attempt_id}-${item.question_id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-red-500 dark:border-red-400"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.exam_type === 'PRACTICAL'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                      }`}>
                        {item.exam_type === 'PRACTICAL' ? '실기' : '필기'}
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {item.exam_name}
                      </span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
                        {item.subject_name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.question_code}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(item.attempt_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>

                    <MathText
                      text={item.question_text}
                      className="text-lg font-medium mb-4 dark:text-white block"
                    />

                    <div className="space-y-2 mb-4">
                      {[1, 2, 3, 4].map((choice) => {
                        const isCorrect = choice === item.correct_answer
                        const isSelected = choice === item.student_answer

                        return (
                          <div
                            key={choice}
                            className={`p-3 border-2 rounded-lg ${
                              isCorrect
                                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/30'
                                : isSelected
                                ? 'border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-900/30'
                                : 'border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isCorrect
                                    ? 'bg-green-500 text-white'
                                    : isSelected
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {choice}
                              </span>
                              <span className="flex-1 dark:text-gray-200">
                                {item[`choice_${choice}_image` as keyof WrongAnswer] ? (
                                  <img
                                    src={item[`choice_${choice}_image` as keyof WrongAnswer] as string}
                                    alt={`선택지 ${choice}`}
                                    className="inline-block max-h-16 align-middle"
                                  />
                                ) : (
                                  <MathText text={item[`choice_${choice}` as keyof WrongAnswer] as string} />
                                )}
                              </span>
                              {isCorrect && (
                                <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400">
                                  (정답)
                                </span>
                              )}
                              {isSelected && !isCorrect && (
                                <span className="ml-auto text-xs font-bold text-red-600 dark:text-red-400">
                                  (내 선택)
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                      <div className="font-semibold text-blue-900 dark:text-blue-200 mb-1">해설</div>
                      <MathText
                        text={item.explanation || ''}
                        className="text-blue-800 dark:text-blue-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center border dark:border-gray-700">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              {filter === 'all' ? '오답이 없습니다!' : '이 과목에는 오답이 없습니다!'}
            </div>
            <div className="text-gray-400 dark:text-gray-500 text-sm">
              {filter === 'all'
                ? '모든 문제를 맞혔거나 아직 시험을 보지 않았습니다.'
                : '다른 과목을 선택해보세요.'}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/my"
            className="flex-1 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white text-center rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
          >
            마이페이지로
          </Link>
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white text-center rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
