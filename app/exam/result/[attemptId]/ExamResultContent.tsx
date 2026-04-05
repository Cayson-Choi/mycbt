'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MathText from '@/components/MathText'

interface SubjectScore {
  subject_id: number
  subject_name: string
  subject_questions: number
  subject_correct: number
  subject_score: number
}

interface QuestionResult {
  seq: number
  question_id: number
  question_text: string
  question_type: string
  choice_1: string | null
  choice_2: string | null
  choice_3: string | null
  choice_4: string | null
  choice_1_image: string | null
  choice_2_image: string | null
  choice_3_image: string | null
  choice_4_image: string | null
  correct_answer: number | null
  explanation: string | null
  image_url: string | null
  subject_name: string
  points: number
  student_answer: number | null
  student_answer_text: string | null
  is_correct: boolean | null
  awarded_points: number | null
  grading_status: string
  ai_feedback: string | null
}

interface ExamResultData {
  attempt_id: number
  exam_id: number
  exam_name: string
  exam_mode: string
  grading_status: string
  status: string
  started_at: string
  submitted_at: string | null
  total_questions: number
  total_correct: number | null
  total_score: number | null
  subject_scores: SubjectScore[]
  questions: QuestionResult[]
}

export default function ExamResultContent({ result }: { result: ExamResultData }) {
  const [showExplanations, setShowExplanations] = useState(false)

  const passed = (result.total_score ?? 0) >= 60
  const isOfficial = result.exam_mode === 'OFFICIAL'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* 총점 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 text-center border dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-4 dark:text-white">{result.exam_name} 결과</h1>

          <div className="mb-6">
            <div
              className={`text-6xl font-bold mb-2 ${
                passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {result.total_score}점
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              {isOfficial
                ? `${result.total_score} / ${result.questions.reduce((sum, q) => sum + (q.points || 1), 0)}점`
                : `${result.total_correct} / ${result.total_questions} 문제 정답`
              }
            </div>
            {result.grading_status === 'PENDING_MANUAL' && (
              <div className="mt-3 inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm font-semibold">
                주관식 채점 대기 중 (임시 점수)
              </div>
            )}
          </div>

          {result.grading_status === 'PENDING_MANUAL' ? (
            <div className="inline-block px-6 py-3 rounded-full text-xl font-bold bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
              채점 대기
            </div>
          ) : (
            <div
              className={`inline-block px-6 py-3 rounded-full text-xl font-bold ${
                passed
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
              }`}
            >
              {passed ? '합격' : '불합격'}
            </div>
          )}

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            제출 시간: {result.submitted_at ? new Date(result.submitted_at).toLocaleString('ko-KR') : '-'}
          </div>

        </div>

        {/* 과목별 점수 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 dark:text-white">과목별 성적</h2>
          <div className="space-y-4">
            {result.subject_scores.map((subject) => (
              <div key={subject.subject_id} className="border dark:border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold dark:text-white">{subject.subject_name}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {subject.subject_correct} / {subject.subject_questions}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div
                      className="bg-blue-600 dark:bg-blue-500 h-4 rounded-full transition-all"
                      style={{ width: `${subject.subject_questions > 0 ? (subject.subject_correct / subject.subject_questions) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 정답/오답 토글 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 border dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold dark:text-white">문제별 해설</h2>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showExplanations ? '해설 숨기기' : '해설 보기'}
            </button>
          </div>
        </div>

        {/* 문제 목록 */}
        {showExplanations && (
          <div className="space-y-6">
            {result.questions.map((question, index) => {
              const questionType = question.question_type || 'MULTIPLE_CHOICE'
              const isSubjective = questionType !== 'MULTIPLE_CHOICE'
              const borderColor = isSubjective
                ? question.grading_status === 'PENDING'
                  ? 'border-l-yellow-500'
                  : question.is_correct ? 'border-l-green-500' : 'border-l-red-500'
                : question.is_correct ? 'border-l-green-500' : 'border-l-red-500'
              const badgeBg = isSubjective
                ? question.grading_status === 'PENDING'
                  ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                  : question.is_correct
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                    : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                : question.is_correct
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'

              return (
                <div
                  key={question.question_id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border-l-4 border dark:border-gray-700 ${borderColor}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${badgeBg}`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {question.subject_name}
                    </span>
                    {isSubjective && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-medium">
                        {questionType === 'SHORT_ANSWER' ? '단답형' : '서술형'}
                      </span>
                    )}
                    {isSubjective ? (
                      question.grading_status === 'PENDING' ? (
                        <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                          채점 대기 중
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {question.awarded_points}/{question.points}점
                        </span>
                      )
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          question.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {question.is_correct ? '정답' : '오답'}
                      </span>
                    )}
                  </div>
                  <div>
                    <MathText
                      text={question.question_text}
                      className="text-base sm:text-lg font-medium mb-4 block dark:text-white"
                    />

                      {question.image_url && (
                        <div className="mb-4">
                          <Image
                            src={question.image_url}
                            alt="문제 이미지"
                            width={400}
                            height={280}
                            className="max-w-sm max-h-[280px] w-auto h-auto rounded border border-gray-200"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* 객관식 보기 */}
                      {!isSubjective && (
                        <div className="space-y-2 mb-4">
                          {[1, 2, 3, 4].map((choice) => {
                            const isCorrect = choice === question.correct_answer
                            const isSelected = choice === question.student_answer

                            return (
                              <div
                                key={choice}
                                className={`p-3 border-2 rounded-lg ${
                                  isCorrect
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-400'
                                    : isSelected
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-400'
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
                                    {isCorrect ? 'O' : isSelected ? 'X' : choice}
                                  </span>
                                  <span className="flex-1 dark:text-gray-200">
                                    {question[`choice_${choice}_image` as keyof QuestionResult] ? (
                                      <img
                                        src={question[`choice_${choice}_image` as keyof QuestionResult] as string}
                                        alt={`선택지 ${choice}`}
                                        className="inline-block max-h-16 align-middle"
                                      />
                                    ) : (
                                      <MathText text={question[`choice_${choice}` as keyof QuestionResult] as string || ''} />
                                    )}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* 주관식 답안 표시 */}
                      {isSubjective && (
                        <div className="space-y-2 mb-4">
                          <div className="p-3 border-2 border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">내 답안</div>
                            <div className="text-sm dark:text-gray-200 whitespace-pre-wrap">
                              {question.student_answer_text || '(미작성)'}
                            </div>
                          </div>
                          {question.ai_feedback && (
                            <div className="p-3 border-2 border-orange-300 dark:border-orange-600 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                              <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 mb-1">AI 채점 이유</div>
                              <div className="text-sm dark:text-gray-200 whitespace-pre-wrap">
                                {question.ai_feedback}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                          <div className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">해설</div>
                          <MathText
                            text={question.explanation}
                            className="text-sm text-blue-800 dark:text-blue-200"
                          />
                        </div>
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white text-center rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600"
          >
            홈으로
          </Link>
          <Link
            href="/my"
            className="flex-1 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white text-center rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600"
          >
            마이페이지
          </Link>
          {!isOfficial && (
            <Link
              href={`/exam/${result.exam_id}`}
              className="flex-1 px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white text-center rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
            >
              다시 응시
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
